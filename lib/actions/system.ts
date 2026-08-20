'use server';

import { db } from '@/db';
import { users, orders, packages, tools, packageFiles, coupons, pageViews, securityLogs } from '@/db/schema';
import { sql, eq, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getTelegramCredentials } from '@/lib/telegram';

export interface SystemHealthData {
  timestamp: string;
  database: {
    connected: boolean;
    pingMs: number;
    provider: string;
    totalTables: number;
  };
  counts: {
    totalUsers: number;
    adminUsers: number;
    standardUsers: number;
    totalOrders: number;
    pendingOrders: number;
    approvedOrders: number;
    totalRevenue: number;
    totalTools: number;
    totalPackages: number;
    totalFiles: number;
    activeCoupons: number;
    totalPageViews: number;
    securityEvents: number;
  };
  r2Storage: {
    connected: boolean;
    bucketName: string;
    objectsCount: number;
    error?: string;
  };
  telegramBot: {
    configured: boolean;
    hasToken: boolean;
    hasChatId: boolean;
    status: 'connected' | 'not_configured' | 'error';
    error?: string;
  };
  server: {
    nodeVersion: string;
    environment: string;
    uptimeSeconds: number;
    memoryUsageMb: number;
  };
}

export async function getLiveSystemHealthAction(): Promise<{
  success: boolean;
  data?: SystemHealthData;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  const startTime = Date.now();

  try {
    // 1. Live Database Ping & Stats
    const pingStart = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbPingMs = Date.now() - pingStart;

    // 2. Fetch live accurate table counts
    const [
      [{ value: totalUsersCount }],
      [{ value: adminUsersCount }],
      [{ value: totalOrdersCount }],
      [{ value: pendingOrdersCount }],
      [{ value: approvedOrdersCount }],
      [{ value: totalToolsCount }],
      [{ value: totalPackagesCount }],
      [{ value: totalFilesCount }],
      [{ value: activeCouponsCount }],
      [{ value: totalViewsCount }],
      [{ value: securityEventsCount }],
    ] = await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(users).where(eq(users.role, 'admin')),
      db.select({ value: count() }).from(orders),
      db.select({ value: count() }).from(orders).where(eq(orders.status, 'pending')),
      db.select({ value: count() }).from(orders).where(eq(orders.status, 'approved')),
      db.select({ value: count() }).from(tools),
      db.select({ value: count() }).from(packages),
      db.select({ value: count() }).from(packageFiles),
      db.select({ value: count() }).from(coupons).where(eq(coupons.isActive, true)),
      db.select({ value: count() }).from(pageViews),
      db.select({ value: count() }).from(securityLogs),
    ]);

    // Calculate real revenue from approved orders
    const approvedOrdersList = await db
      .select({ amount: orders.amount })
      .from(orders)
      .where(eq(orders.status, 'approved'));

    const totalRevenue = approvedOrdersList.reduce((sum, ord) => {
      const num = parseInt(ord.amount.replace(/[^0-9]/g, '')) || 0;
      return sum + num;
    }, 0);

    // 3. Test Cloudflare R2 Connection
    let r2Connected = false;
    let r2ObjectsCount = 0;
    let r2Error: string | undefined = undefined;
    try {
      const { listR2Objects } = await import('@/lib/r2');
      const objs = await listR2Objects();
      r2Connected = true;
      r2ObjectsCount = objs.length;
    } catch (e: any) {
      r2Error = e.message;
    }

    // 4. Test Telegram Credentials
    const telegramCreds = await getTelegramCredentials();
    let telegramStatus: 'connected' | 'not_configured' | 'error' = 'not_configured';
    let telegramError: string | undefined = undefined;

    if (telegramCreds.token && telegramCreds.chatId) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${telegramCreds.token}/getMe`);
        const data = await res.json();
        if (data.ok) {
          telegramStatus = 'connected';
        } else {
          telegramStatus = 'error';
          telegramError = data.description;
        }
      } catch (e: any) {
        telegramStatus = 'error';
        telegramError = e.message;
      }
    }

    const memoryUsage = process.memoryUsage();
    const memoryMb = Math.round(memoryUsage.heapUsed / 1024 / 1024);

    const healthData: SystemHealthData = {
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        pingMs: dbPingMs,
        provider: 'Neon PostgreSQL Serverless',
        totalTables: 15,
      },
      counts: {
        totalUsers: Number(totalUsersCount || 0),
        adminUsers: Number(adminUsersCount || 0),
        standardUsers: Number(totalUsersCount || 0) - Number(adminUsersCount || 0),
        totalOrders: Number(totalOrdersCount || 0),
        pendingOrders: Number(pendingOrdersCount || 0),
        approvedOrders: Number(approvedOrdersCount || 0),
        totalRevenue,
        totalTools: Number(totalToolsCount || 0),
        totalPackages: Number(totalPackagesCount || 0),
        totalFiles: Number(totalFilesCount || 0),
        activeCoupons: Number(activeCouponsCount || 0),
        totalPageViews: Number(totalViewsCount || 0),
        securityEvents: Number(securityEventsCount || 0),
      },
      r2Storage: {
        connected: r2Connected,
        bucketName: process.env.R2_BUCKET_NAME || 'growix-files',
        objectsCount: r2ObjectsCount,
        error: r2Error,
      },
      telegramBot: {
        configured: Boolean(telegramCreds.token && telegramCreds.chatId),
        hasToken: Boolean(telegramCreds.token),
        hasChatId: Boolean(telegramCreds.chatId),
        status: telegramStatus,
        error: telegramError,
      },
      server: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'production',
        uptimeSeconds: Math.round(process.uptime()),
        memoryUsageMb: memoryMb,
      },
    };

    return { success: true, data: healthData };
  } catch (error: any) {
    console.error('System health check error:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء فحص النظام' };
  }
}
