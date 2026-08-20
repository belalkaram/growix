import { db } from '@/db';
import { pageViews, orders } from '@/db/schema';
import { desc, count, sql, and, gte, lte, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export interface AnalyticsFilters {
  range?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  deviceType?: 'all' | 'mobile' | 'desktop';
  path?: string;
}

export interface ShopifyAnalyticsReport {
  // Core Traffic
  totalViews: number;
  uniqueSessions: number;
  liveVisitorsNow: number;
  avgSessionDurationSeconds: number;
  avgCheckoutDurationSeconds: number;

  // E-commerce & Conversion Funnel
  viewedCatalogSessions: number;
  reachedCheckoutSessions: number;
  totalOrdersPlaced: number;
  totalOrdersApproved: number;
  abandonedCheckoutSessions: number;
  abandonmentRate: number;
  conversionRate: number;

  // Financials
  totalRevenue: number;
  averageOrderValue: number;

  // Breakdowns
  topPages: { path: string; views: number; avgDuration: number }[];
  deviceStats: { deviceType: string | null; views: number; sessions: number }[];
  trafficSources: { source: string; views: number; sessions: number }[];
  hourlyTraffic: { hour: number; views: number; sessions: number }[];
  recentViews: any[];
  availablePaths: string[];
}

export async function getAnalyticsSummary(filters: AnalyticsFilters = {}): Promise<ShopifyAnalyticsReport> {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new Error('غير مصرح بالوصول');
  }

  try {
    const pvConditions = [];
    const orderConditions = [];
    const now = new Date();

    // 1. Precise Time Filter
    let filterStart: Date | undefined;
    let filterEnd: Date | undefined;

    if (filters.range === 'today') {
      filterStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (filters.range === 'yesterday') {
      filterStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
      filterEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
    } else if (filters.range === '7days') {
      filterStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filters.range === '30days') {
      filterStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (filters.range === 'month') {
      filterStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    } else if (filters.range === 'year') {
      filterStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    } else if (filters.startDate) {
      const [year, month, day] = filters.startDate.split('-').map(Number);
      const [startHour, startMin] = (filters.startTime || '00:00').split(':').map(Number);
      filterStart = new Date(year, month - 1, day, startHour, startMin, 0);

      if (filters.endDate) {
        const [endYear, endMonth, endDay] = filters.endDate.split('-').map(Number);
        const [endHour, endMin] = (filters.endTime || '23:59').split(':').map(Number);
        filterEnd = new Date(endYear, endMonth - 1, endDay, endHour, endMin, 59);
      }
    }

    if (filterStart) {
      pvConditions.push(gte(pageViews.createdAt, filterStart));
      orderConditions.push(gte(orders.createdAt, filterStart));
    }
    if (filterEnd) {
      pvConditions.push(lte(pageViews.createdAt, filterEnd));
      orderConditions.push(lte(orders.createdAt, filterEnd));
    }

    // 2. Device type filter
    if (filters.deviceType && filters.deviceType !== 'all') {
      pvConditions.push(eq(pageViews.deviceType, filters.deviceType));
    }

    // 3. Path filter
    if (filters.path && filters.path !== 'all') {
      pvConditions.push(eq(pageViews.path, filters.path));
    }

    const pvWhereClause = pvConditions.length > 0 ? and(...pvConditions) : undefined;
    const orderWhereClause = orderConditions.length > 0 ? and(...orderConditions) : undefined;

    // 1. Total pageviews count & unique sessions
    const [{ totalViews }] = await db
      .select({ totalViews: count() })
      .from(pageViews)
      .where(pvWhereClause);

    const [{ uniqueSessions }] = await db
      .select({ uniqueSessions: count(sql`DISTINCT ${pageViews.sessionId}`) })
      .from(pageViews)
      .where(pvWhereClause);

    // 2. Realtime Active Visitors (Last 5 Minutes)
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const [{ liveVisitorsNow }] = await db
      .select({ liveVisitorsNow: count(sql`DISTINCT ${pageViews.sessionId}`) })
      .from(pageViews)
      .where(gte(pageViews.createdAt, fiveMinAgo));

    // 3. Average Durations (Overall & Checkout)
    const [{ avgDurationRaw }] = await db
      .select({ avgDurationRaw: sql<number>`COALESCE(AVG(${pageViews.durationSeconds}), 0)` })
      .from(pageViews)
      .where(pvWhereClause);

    const checkoutDurationConditions = [...pvConditions, eq(pageViews.path, '/checkout')];
    const [{ avgCheckoutRaw }] = await db
      .select({ avgCheckoutRaw: sql<number>`COALESCE(AVG(${pageViews.durationSeconds}), 0)` })
      .from(pageViews)
      .where(and(...checkoutDurationConditions));

    // 4. Funnel Stage 2: Viewed Tools or Pricing Catalog
    const catalogConditions = [...pvConditions, sql`(${pageViews.path} LIKE '/tools%' OR ${pageViews.path} LIKE '/pricing%')`];
    const [{ viewedCatalogSessions }] = await db
      .select({ viewedCatalogSessions: count(sql`DISTINCT ${pageViews.sessionId}`) })
      .from(pageViews)
      .where(and(...catalogConditions));

    // 5. Funnel Stage 3: Reached Checkout
    const reachedCheckoutConditions = [...pvConditions, sql`${pageViews.path} LIKE '/checkout%'`];
    const [{ reachedCheckoutSessions }] = await db
      .select({ reachedCheckoutSessions: count(sql`DISTINCT ${pageViews.sessionId}`) })
      .from(pageViews)
      .where(and(...reachedCheckoutConditions));

    // 6. Orders in Filtered Window
    const allOrders = await db
      .select({
        id: orders.id,
        amount: orders.amount,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(orderWhereClause);

    const totalOrdersPlaced = allOrders.length;
    const approvedOrders = allOrders.filter((o) => o.status === 'approved');
    const totalOrdersApproved = approvedOrders.length;

    const totalRevenue = approvedOrders.reduce((sum, o) => {
      const parsed = parseFloat(o.amount || '0');
      return sum + (isNaN(parsed) ? 0 : parsed);
    }, 0);

    const averageOrderValue = totalOrdersApproved > 0 ? Math.round(totalRevenue / totalOrdersApproved) : 0;
    const abandonedCheckoutSessions = Math.max(0, (reachedCheckoutSessions || 0) - totalOrdersPlaced);
    const abandonmentRate = reachedCheckoutSessions > 0
      ? Math.round((abandonedCheckoutSessions / reachedCheckoutSessions) * 100)
      : 0;
    const conversionRate = uniqueSessions > 0
      ? parseFloat(((totalOrdersPlaced / uniqueSessions) * 100).toFixed(1))
      : 0;

    // 7. Top Visited Pages with Avg Duration
    const topPagesRaw = await db
      .select({
        path: pageViews.path,
        views: count(),
        avgDuration: sql<number>`COALESCE(AVG(${pageViews.durationSeconds}), 0)`,
      })
      .from(pageViews)
      .where(pvWhereClause)
      .groupBy(pageViews.path)
      .orderBy(desc(count()))
      .limit(10);

    const topPages = topPagesRaw.map((p) => ({
      path: p.path,
      views: Number(p.views) || 0,
      avgDuration: Math.round(Number(p.avgDuration) || 0),
    }));

    // 8. Device Stats
    const deviceStatsRaw = await db
      .select({
        deviceType: pageViews.deviceType,
        views: count(),
        sessions: count(sql`DISTINCT ${pageViews.sessionId}`),
      })
      .from(pageViews)
      .where(pvWhereClause)
      .groupBy(pageViews.deviceType);

    const deviceStats = deviceStatsRaw.map((d) => ({
      deviceType: d.deviceType,
      views: Number(d.views) || 0,
      sessions: Number(d.sessions) || 0,
    }));

    // 9. Traffic Sources (UTM Source / Referrer)
    const trafficSourcesRaw = await db
      .select({
        source: sql<string>`COALESCE(${pageViews.utmSource}, SPLIT_PART(SPLIT_PART(${pageViews.referrer}, '//', 2), '/', 1), 'Direct / المباشر')`,
        views: count(),
        sessions: count(sql`DISTINCT ${pageViews.sessionId}`),
      })
      .from(pageViews)
      .where(pvWhereClause)
      .groupBy(sql`COALESCE(${pageViews.utmSource}, SPLIT_PART(SPLIT_PART(${pageViews.referrer}, '//', 2), '/', 1), 'Direct / المباشر')`)
      .orderBy(desc(count()))
      .limit(6);

    const trafficSources = trafficSourcesRaw.map((t) => ({
      source: t.source || 'Direct / المباشر',
      views: Number(t.views) || 0,
      sessions: Number(t.sessions) || 0,
    }));

    // 10. Hourly Traffic Breakdown (0 to 23)
    const hourlyRaw = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${pageViews.createdAt})`,
        views: count(),
        sessions: count(sql`DISTINCT ${pageViews.sessionId}`),
      })
      .from(pageViews)
      .where(pvWhereClause)
      .groupBy(sql`EXTRACT(HOUR FROM ${pageViews.createdAt})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${pageViews.createdAt})`);

    const hourlyMap: Record<number, { views: number; sessions: number }> = {};
    for (let h = 0; h < 24; h++) {
      hourlyMap[h] = { views: 0, sessions: 0 };
    }
    hourlyRaw.forEach((row) => {
      const h = Number(row.hour);
      if (h >= 0 && h < 24) {
        hourlyMap[h] = {
          views: Number(row.views) || 0,
          sessions: Number(row.sessions) || 0,
        };
      }
    });

    const hourlyTraffic = Object.entries(hourlyMap).map(([h, data]) => ({
      hour: Number(h),
      views: data.views,
      sessions: data.sessions,
    }));

    // 11. Recent 15 Filtered Views
    const recentViews = await db
      .select()
      .from(pageViews)
      .where(pvWhereClause)
      .orderBy(desc(pageViews.createdAt))
      .limit(15);

    // 12. Distinct Paths for Filter
    const distinctPaths = await db
      .select({ path: pageViews.path })
      .from(pageViews)
      .groupBy(pageViews.path);

    return {
      totalViews: Number(totalViews) || 0,
      uniqueSessions: Number(uniqueSessions) || 0,
      liveVisitorsNow: Number(liveVisitorsNow) || 0,
      avgSessionDurationSeconds: Math.round(Number(avgDurationRaw) || 0),
      avgCheckoutDurationSeconds: Math.round(Number(avgCheckoutRaw) || 0),

      viewedCatalogSessions: Number(viewedCatalogSessions) || 0,
      reachedCheckoutSessions: Number(reachedCheckoutSessions) || 0,
      totalOrdersPlaced,
      totalOrdersApproved,
      abandonedCheckoutSessions,
      abandonmentRate,
      conversionRate,

      totalRevenue,
      averageOrderValue,

      topPages,
      deviceStats,
      trafficSources,
      hourlyTraffic,
      recentViews,
      availablePaths: distinctPaths.map((p) => p.path),
    };
  } catch (error) {
    console.error('Analytics query error:', error);
    return {
      totalViews: 0,
      uniqueSessions: 0,
      liveVisitorsNow: 0,
      avgSessionDurationSeconds: 0,
      avgCheckoutDurationSeconds: 0,
      viewedCatalogSessions: 0,
      reachedCheckoutSessions: 0,
      totalOrdersPlaced: 0,
      totalOrdersApproved: 0,
      abandonedCheckoutSessions: 0,
      abandonmentRate: 0,
      conversionRate: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      topPages: [],
      deviceStats: [],
      trafficSources: [],
      hourlyTraffic: [],
      recentViews: [],
      availablePaths: [],
    };
  }
}
