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

export async function getAnalyticsSummary(filters: AnalyticsFilters = {}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new Error('غير مصرح بالوصول');
  }

  try {
    const conditions = [];
    const now = new Date();

    // 1. Precise Time Filter
    if (filters.range === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      conditions.push(gte(pageViews.createdAt, todayStart));
    } else if (filters.range === 'yesterday') {
      const yStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
      const yEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
      conditions.push(gte(pageViews.createdAt, yStart));
      conditions.push(lte(pageViews.createdAt, yEnd));
    } else if (filters.range === '7days') {
      const threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      conditions.push(gte(pageViews.createdAt, threshold));
    } else if (filters.range === '30days') {
      const threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      conditions.push(gte(pageViews.createdAt, threshold));
    } else if (filters.range === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      conditions.push(gte(pageViews.createdAt, monthStart));
    } else if (filters.range === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      conditions.push(gte(pageViews.createdAt, yearStart));
    } else if (filters.startDate) {
      // Custom Range
      const [year, month, day] = filters.startDate.split('-').map(Number);
      const [startHour, startMin] = (filters.startTime || '00:00').split(':').map(Number);
      const customStart = new Date(year, month - 1, day, startHour, startMin, 0);
      conditions.push(gte(pageViews.createdAt, customStart));

      if (filters.endDate) {
        const [endYear, endMonth, endDay] = filters.endDate.split('-').map(Number);
        const [endHour, endMin] = (filters.endTime || '23:59').split(':').map(Number);
        const customEnd = new Date(endYear, endMonth - 1, endDay, endHour, endMin, 59);
        conditions.push(lte(pageViews.createdAt, customEnd));
      }
    }

    // 2. Device type filter
    if (filters.deviceType && filters.deviceType !== 'all') {
      conditions.push(eq(pageViews.deviceType, filters.deviceType));
    }

    // 3. Path filter
    if (filters.path && filters.path !== 'all') {
      conditions.push(eq(pageViews.path, filters.path));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Total pageviews count
    const [{ totalViews }] = await db
      .select({ totalViews: count() })
      .from(pageViews)
      .where(whereClause);

    // Unique sessions count
    const [{ uniqueSessions }] = await db
      .select({ uniqueSessions: count(sql`DISTINCT ${pageViews.sessionId}`) })
      .from(pageViews)
      .where(whereClause);

    // Top pages visited
    const topPages = await db
      .select({
        path: pageViews.path,
        views: count(),
      })
      .from(pageViews)
      .where(whereClause)
      .groupBy(pageViews.path)
      .orderBy(desc(count()))
      .limit(10);

    // Device breakdown
    const deviceStats = await db
      .select({
        deviceType: pageViews.deviceType,
        views: count(),
      })
      .from(pageViews)
      .where(whereClause)
      .groupBy(pageViews.deviceType);

    // Recent 15 filtered views
    const recentViews = await db
      .select()
      .from(pageViews)
      .where(whereClause)
      .orderBy(desc(pageViews.createdAt))
      .limit(15);

    // Get distinct paths list for filter select options
    const distinctPaths = await db
      .select({ path: pageViews.path })
      .from(pageViews)
      .groupBy(pageViews.path);

    return {
      totalViews: totalViews || 0,
      uniqueSessions: uniqueSessions || 0,
      topPages,
      deviceStats,
      recentViews,
      availablePaths: distinctPaths.map((p) => p.path),
    };
  } catch (error) {
    console.error('Analytics query error:', error);
    return {
      totalViews: 0,
      uniqueSessions: 0,
      topPages: [],
      deviceStats: [],
      recentViews: [],
      availablePaths: [],
    };
  }
}
