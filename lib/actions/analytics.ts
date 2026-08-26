'use server';

import { db } from '@/db';
import { pageViews, orders, users, tools, paymentTransactions } from '@/db/schema';
import { eq, and, gte, lte, count, sql, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface ResetAnalyticsOptions {
  clearAdminViews?: boolean;
  clearTestOrders?: boolean;
  clearDryRunWebhooks?: boolean;
  clearAllViews?: boolean;
  beforeDate?: string;
}

export async function resetAnalyticsDataAction(options: ResetAnalyticsOptions) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const summary: string[] = [];
    const dateLimit = options.beforeDate ? new Date(options.beforeDate) : undefined;

    // 1. Clear Admin & Test Views only
    if (options.clearAdminViews) {
      await db.delete(pageViews).where(
        and(
          sql`(${pageViews.isAdmin} = true OR ${pageViews.isTest} = true)`,
          dateLimit ? lte(pageViews.createdAt, dateLimit) : undefined
        )
      );
      summary.push('تم مسح زيارات وتجارب الأدمن بنجاح');
    }

    // 2. Clear All Page Views
    if (options.clearAllViews) {
      await db.delete(pageViews).where(
        dateLimit ? lte(pageViews.createdAt, dateLimit) : undefined
      );
      summary.push('تم تصفير كافة سجلات الزيارات');
    }

    // 3. Clear Test Orders
    if (options.clearTestOrders) {
      await db.delete(orders).where(
        and(
          eq(orders.isTest, true),
          dateLimit ? lte(orders.createdAt, dateLimit) : undefined
        )
      );
      summary.push('تم مسح جميع الطلبات التجريبية');
    }

    // 4. Clear Dry-Run Webhook Transactions
    if (options.clearDryRunWebhooks) {
      await db.delete(paymentTransactions).where(
        and(
          eq(paymentTransactions.isDryRun, true),
          dateLimit ? lte(paymentTransactions.createdAt, dateLimit) : undefined
        )
      );
      summary.push('تم مسح رسائل الويب هوك التجريبية');
    }

    revalidatePath('/admin/analytics');
    revalidatePath('/admin/orders');
    revalidatePath('/admin/transactions');

    return { 
      success: true, 
      message: summary.length > 0 ? summary.join(' | ') : 'لم يتم تحديد أي بيانات للمسح' 
    };
  } catch (error: any) {
    console.error('Reset analytics error:', error);
    return { success: false, error: 'حدث خطأ أثناء إعادة ضبط البيانات' };
  }
}

export interface AnalyticsFilterParams {
  range?: string; // 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'month' | 'last_month' | 'year' | 'custom'
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  device?: string; // 'all' | 'desktop' | 'mobile'
  path?: string; // specific page path
}

export interface VisitorLogsFilterParams {
  range?: string; // 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'month' | 'last_month' | 'year' | 'custom'
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  device?: string; // 'all' | 'desktop' | 'mobile'
  path?: string; // specific page path or 'all'
  search?: string; // search in path, sessionId, utmSource, referrer
  limit?: number; // 15, 30, 50, 100, 200
  includeAdmin?: boolean;
}

function parseDateRange(filter?: AnalyticsFilterParams): { start?: Date; end?: Date } {
  if (!filter) return {};

  const now = new Date();
  let start: Date | undefined;
  let end: Date | undefined;

  if (filter.range === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (filter.range === 'yesterday') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
  } else if (filter.range === '7days') {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    end = new Date();
  } else if (filter.range === '30days') {
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    end = new Date();
  } else if (filter.range === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (filter.range === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (filter.range === 'year') {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else if (filter.startDate) {
    // Custom range
    const [year, month, day] = filter.startDate.split('-').map(Number);
    const [startHour, startMin] = (filter.startTime || '00:00').split(':').map(Number);
    start = new Date(year, month - 1, day, startHour, startMin, 0, 0);

    if (filter.endDate) {
      const [endYear, endMonth, endDay] = filter.endDate.split('-').map(Number);
      const [endHour, endMin] = (filter.endTime || '23:59').split(':').map(Number);
      end = new Date(endYear, endMonth - 1, endDay, endHour, endMin, 59, 999);
    }
  }

  return { start, end };
}

export async function getRecentVisitorLogsAction(params: VisitorLogsFilterParams = {}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول', views: [], totalCount: 0 };
  }

  try {
    const { start, end } = parseDateRange(params);
    const conditions: any[] = [];

    if (start) {
      conditions.push(gte(pageViews.createdAt, start));
    }
    if (end) {
      conditions.push(lte(pageViews.createdAt, end));
    }

    if (params.device && params.device !== 'all') {
      conditions.push(eq(pageViews.deviceType, params.device));
    }

    if (params.path && params.path !== 'all') {
      conditions.push(eq(pageViews.path, params.path));
    }

    if (!params.includeAdmin) {
      conditions.push(sql`(${pageViews.isAdmin} IS FALSE OR ${pageViews.isAdmin} IS NULL)`);
      conditions.push(sql`(${pageViews.isTest} IS FALSE OR ${pageViews.isTest} IS NULL)`);
    }

    if (params.search && params.search.trim()) {
      const q = `%${params.search.trim()}%`;
      conditions.push(
        sql`(${pageViews.path} ILIKE ${q} OR ${pageViews.sessionId} ILIKE ${q} OR ${pageViews.utmSource} ILIKE ${q} OR ${pageViews.referrer} ILIKE ${q})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const limitCount = Math.min(Math.max(params.limit || 15, 1), 500);

    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(pageViews)
      .where(whereClause);

    const views = await db
      .select()
      .from(pageViews)
      .where(whereClause)
      .orderBy(desc(pageViews.createdAt))
      .limit(limitCount);

    return {
      success: true,
      totalCount: Number(totalCount || 0),
      views: views.map((v) => ({
        id: v.id,
        sessionId: v.sessionId,
        path: v.path,
        referrer: v.referrer,
        utmSource: v.utmSource,
        utmMedium: v.utmMedium,
        utmCampaign: v.utmCampaign,
        deviceType: v.deviceType,
        durationSeconds: v.durationSeconds,
        isAdmin: v.isAdmin,
        createdAt: v.createdAt.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('getRecentVisitorLogsAction error:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء جلب سجل الزيارات', views: [], totalCount: 0 };
  }
}

export async function getDynamicAnalyticsAction(filter?: AnalyticsFilterParams) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new Error('غير مصرح بالوصول');
  }

  const { start, end } = parseDateRange(filter);

  const pvConditions: any[] = [];
  const orderConditions: any[] = [];

  if (start) {
    pvConditions.push(gte(pageViews.createdAt, start));
    orderConditions.push(gte(orders.createdAt, start));
  }
  if (end) {
    pvConditions.push(lte(pageViews.createdAt, end));
    orderConditions.push(lte(orders.createdAt, end));
  }
  if (filter?.device && filter.device !== 'all') {
    pvConditions.push(eq(pageViews.deviceType, filter.device));
  }
  if (filter?.path && filter.path !== 'all') {
    pvConditions.push(eq(pageViews.path, filter.path));
  }

  // 1. Total views in filtered window
  const viewsQuery = db.select({ value: count() }).from(pageViews);
  const [{ value: totalViews }] = pvConditions.length > 0
    ? await viewsQuery.where(and(...pvConditions))
    : await viewsQuery;

  // 2. Unique sessions in filtered window
  const uniqueSessionsQuery = db.select({ value: count(sql`DISTINCT ${pageViews.sessionId}`) }).from(pageViews);
  const [{ value: uniqueVisitors }] = pvConditions.length > 0
    ? await uniqueSessionsQuery.where(and(...pvConditions))
    : await uniqueSessionsQuery;

  // 3. Orders in filtered window
  const ordersQuery = db
    .select({
      id: orders.id,
      amount: orders.amount,
      status: orders.status,
      packageId: orders.packageId,
      createdAt: orders.createdAt,
    })
    .from(orders);

  const ordersList = orderConditions.length > 0
    ? await ordersQuery.where(and(...orderConditions))
    : await ordersQuery;

  const totalOrders = ordersList.length;
  const approvedOrders = ordersList.filter((o) => o.status === 'approved').length;
  const pendingOrders = ordersList.filter((o) => o.status === 'pending').length;

  const totalRevenue = ordersList
    .filter((o) => o.status === 'approved')
    .reduce((sum, o) => sum + (parseInt(o.amount.replace(/[^0-9]/g, '')) || 0), 0);

  // 4. Top visited paths
  const topPathsQuery = db
    .select({
      path: pageViews.path,
      viewsCount: count(),
      uniqueCount: count(sql`DISTINCT ${pageViews.sessionId}`),
    })
    .from(pageViews);

  const topPaths = pvConditions.length > 0
    ? await topPathsQuery.where(and(...pvConditions)).groupBy(pageViews.path).orderBy(desc(count())).limit(10)
    : await topPathsQuery.groupBy(pageViews.path).orderBy(desc(count())).limit(10);

  // 5. Device Breakdown
  const deviceQuery = db
    .select({
      deviceType: pageViews.deviceType,
      viewsCount: count(),
    })
    .from(pageViews);

  const deviceStats = pvConditions.length > 0
    ? await deviceQuery.where(and(...pvConditions)).groupBy(pageViews.deviceType)
    : await deviceQuery.groupBy(pageViews.deviceType);

  // 6. Traffic Sources / UTM Referrers
  const referrerQuery = db
    .select({
      referrer: pageViews.referrer,
      utmSource: pageViews.utmSource,
      viewsCount: count(),
    })
    .from(pageViews);

  const referrers = pvConditions.length > 0
    ? await referrerQuery.where(and(...pvConditions)).groupBy(pageViews.referrer, pageViews.utmSource).orderBy(desc(count())).limit(8)
    : await referrerQuery.groupBy(pageViews.referrer, pageViews.utmSource).orderBy(desc(count())).limit(8);

  return {
    totalViews: Number(totalViews || 0),
    uniqueVisitors: Number(uniqueVisitors || 0),
    totalOrders,
    approvedOrders,
    pendingOrders,
    totalRevenue,
    topPaths,
    deviceStats,
    referrers,
    filterApplied: filter || null,
  };
}
