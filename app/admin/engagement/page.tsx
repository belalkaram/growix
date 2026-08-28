import { db } from '@/db';
import { users, orders, fileDownloads } from '@/db/schema';
import { eq, and, sql, count, desc, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EngagementClientPage from './EngagementClientPage';

export const metadata = {
  title: 'تدقيق تفاعل العملاء | لوحة تحكم GROWIX',
  description: 'حصر العملاء المفعّلين الذين لم يستفيدوا من الباقة بشكل كامل',
};

export const dynamic = 'force-dynamic';

export default async function EngagementPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/login');
  }

  // ── 1. Total approved orders ──────────────────────────────────────
  const totalApproved = await db
    .select({ value: count() })
    .from(orders)
    .where(eq(orders.status, 'approved'));

  // ── 2. Users with approved orders and their download counts ────────
  const engagementRows = await db
    .select({
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.phone,
      createdAt: users.createdAt,
      orderId: orders.id,
      packageId: orders.packageId,
      toolId: orders.toolId,
      orderCreatedAt: orders.createdAt,
      downloadCount: sql<number>`cast(count(${fileDownloads.id}) as int)`,
    })
    .from(users)
    .innerJoin(orders, and(eq(orders.userId, users.id), eq(orders.status, 'approved')))
    .leftJoin(fileDownloads, eq(fileDownloads.userId, users.id))
    .groupBy(
      users.id,
      users.name,
      users.email,
      users.phone,
      users.createdAt,
      orders.id,
      orders.packageId,
      orders.toolId,
      orders.createdAt
    )
    .orderBy(desc(orders.createdAt));

  // ── 3. Top downloaded files ─────────────────────────────────────────
  const topFiles = await db
    .select({
      fileName: fileDownloads.fileName,
      category: fileDownloads.category,
      downloads: sql<number>`cast(count(*) as int)`,
    })
    .from(fileDownloads)
    .groupBy(fileDownloads.fileName, fileDownloads.category)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // ── 4. Zero-download users count ───────────────────────────────────
  const zeroDownloads = engagementRows.filter(r => r.downloadCount === 0).length;

  const stats = {
    totalApproved: Number(totalApproved[0]?.value || 0),
    zeroDownloads,
    withDownloads: engagementRows.length - zeroDownloads,
  };

  return (
    <EngagementClientPage
      rows={engagementRows.map(r => ({
        userId: r.userId,
        userName: r.userName,
        userEmail: r.userEmail,
        userPhone: r.userPhone || '',
        createdAt: r.createdAt.toISOString(),
        orderId: r.orderId,
        packageId: r.packageId,
        toolId: r.toolId || null,
        orderCreatedAt: r.orderCreatedAt.toISOString(),
        downloadCount: r.downloadCount || 0,
      }))}
      topFiles={topFiles.map(f => ({
        fileName: f.fileName,
        category: f.category,
        downloads: f.downloads,
      }))}
      stats={stats}
    />
  );
}
