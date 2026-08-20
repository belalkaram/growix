'use server';

import { db } from '@/db';
import { pageViews, orders, users, tools } from '@/db/schema';
import { eq, and, gte, lte, count, sql, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export interface AnalyticsFilterParams {
  range?: string; // 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'month' | 'year' | 'custom'
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  device?: string; // 'all' | 'desktop' | 'mobile'
  path?: string; // specific page path
}

export function parseDateRange(filter?: AnalyticsFilterParams): { start?: Date; end?: Date } {
  if (!filter) return {};

  const now = new Date();
  let start: Date | undefined;
  let end: Date | undefined = new Date();

  if (filter.range === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  } else if (filter.range === 'yesterday') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
  } else if (filter.range === '7days') {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (filter.range === '30days') {
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (filter.range === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  } else if (filter.range === 'year') {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
  } else if (filter.startDate) {
    // Custom range
    const [year, month, day] = filter.startDate.split('-').map(Number);
    const [startHour, startMin] = (filter.startTime || '00:00').split(':').map(Number);
    start = new Date(year, month - 1, day, startHour, startMin, 0);

    if (filter.endDate) {
      const [endYear, endMonth, endDay] = filter.endDate.split('-').map(Number);
      const [endHour, endMin] = (filter.endTime || '23:59').split(':').map(Number);
      end = new Date(endYear, endMonth - 1, endDay, endHour, endMin, 59);
    }
  }

  return { start, end };
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
