'use server';

import { db } from '@/db';
import { toolVideos } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sql } from 'drizzle-orm';

async function ensureVideosTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tool_videos (
        id SERIAL PRIMARY KEY,
        tool_id VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        video_url TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true NOT NULL,
        sort_order INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
  } catch {}
}

/** Get videos for a user's approved order */
export async function getVideosForOrderAction(packageId: string, toolId?: string | null) {
  await ensureVideosTable();
  try {
    const allVideos = await db
      .select()
      .from(toolVideos)
      .where(eq(toolVideos.isActive, true))
      .orderBy(asc(toolVideos.sortOrder), asc(toolVideos.createdAt));

    if (packageId === 'bundle-vip') {
      // VIP gets all videos
      return { success: true, videos: allVideos };
    } else {
      // Single tool: return videos for that tool + general (null toolId) videos
      const filtered = allVideos.filter(
        (v) => v.toolId === toolId || v.toolId === null
      );
      return { success: true, videos: filtered };
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    return { success: true, videos: [] };
  }
}

/** Admin: Get all videos */
export async function getAllVideosAdminAction() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new Error('غير مصرح');
  }
  await ensureVideosTable();
  return db.select().from(toolVideos).orderBy(asc(toolVideos.sortOrder), desc(toolVideos.createdAt));
}

/** Admin: Add a video */
export async function addVideoAction(data: {
  toolId?: string;
  title: string;
  videoUrl: string;
  description?: string;
  sortOrder?: number;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح' };
  }
  if (!data.title || !data.videoUrl) {
    return { success: false, error: 'العنوان ورابط الفيديو مطلوبان' };
  }
  try {
    await ensureVideosTable();
    const [video] = await db
      .insert(toolVideos)
      .values({
        toolId: data.toolId || null,
        title: data.title.trim(),
        videoUrl: data.videoUrl.trim(),
        description: data.description?.trim() || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: true,
      })
      .returning();
    revalidatePath('/admin/videos');
    revalidatePath('/my-orders');
    return { success: true, video };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Admin: Update a video */
export async function updateVideoAction(data: {
  id: number;
  toolId?: string | null;
  title: string;
  videoUrl: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح' };
  }
  if (!data.title || !data.videoUrl) {
    return { success: false, error: 'العنوان ورابط الفيديو مطلوبان' };
  }
  try {
    await ensureVideosTable();
    await db
      .update(toolVideos)
      .set({
        toolId: data.toolId || null,
        title: data.title.trim(),
        videoUrl: data.videoUrl.trim(),
        description: data.description?.trim() || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(toolVideos.id, data.id));

    revalidatePath('/admin/videos');
    revalidatePath('/my-orders');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Admin: Delete a video */
export async function deleteVideoAction(videoId: number) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح' };
  }
  try {
    await db.delete(toolVideos).where(eq(toolVideos.id, videoId));
    revalidatePath('/admin/videos');
    revalidatePath('/my-orders');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Admin: Toggle active status */
export async function toggleVideoActiveAction(videoId: number, isActive: boolean) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح' };
  }
  try {
    await db
      .update(toolVideos)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(toolVideos.id, videoId));
    revalidatePath('/admin/videos');
    revalidatePath('/my-orders');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
