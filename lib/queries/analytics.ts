import { db } from '@/db';
import { pageViews } from '@/db/schema';
import { desc, count, sql, and, gte, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export interface AnalyticsFilters {
  timeRange?: 'all' | 'today' | '7days' | '30days';
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

    // 1. Time range filter
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = new Date();
      let threshold = new Date();
      if (filters.timeRange === 'today') {
        threshold.setHours(0, 0, 0, 0);
      } else if (filters.timeRange === '7days') {
        threshold.setDate(now.getDate() - 7);
      } else if (filters.timeRange === '30days') {
        threshold.setDate(now.getDate() - 30);
      }
      conditions.push(gte(pageViews.createdAt, threshold));
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
    console.error('Error fetching analytics summary:', error);
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
