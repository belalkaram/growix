'use server';

import { db } from '@/db';
import { tools, toolsSeo } from '@/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const toolSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  number: z.number().int().optional(),
  name: z.string().min(2, 'الاسم مطلوب'),
  category: z.string().min(1),
  badge: z.string().optional(),
  shortDesc: z.string().min(1),
  longDesc: z.string().optional(),
  features: z.array(z.string()),
  iconName: z.string().min(1),
  isActive: z.boolean().default(true),
  // SEO fields
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  h1: z.string().optional(),
});

export async function createToolAction(data: z.infer<typeof toolSchema>) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const validated = toolSchema.parse(data);

    // If number not provided, calculate next number
    let toolNumber = validated.number;
    if (!toolNumber) {
      const all = await db.select().from(tools);
      toolNumber = all.length + 1;
    }

    await db.insert(tools).values({
      id: validated.id,
      slug: validated.slug,
      number: toolNumber,
      name: validated.name,
      category: validated.category,
      badge: validated.badge || null,
      shortDesc: validated.shortDesc,
      longDesc: validated.longDesc || null,
      features: validated.features,
      iconName: validated.iconName,
      isActive: validated.isActive ?? true,
    });

    if (validated.metaTitle || validated.metaDescription || validated.h1) {
      await db.insert(toolsSeo).values({
        toolId: validated.id,
        slug: validated.slug,
        metaTitle: validated.metaTitle || validated.name,
        metaDescription: validated.metaDescription || validated.shortDesc,
        h1: validated.h1 || validated.name,
        h2Keywords: [],
        keywords: [],
        faqItems: [],
        schemaName: validated.name,
        schemaDescription: validated.shortDesc,
      });
    }

    revalidatePath('/');
    revalidatePath('/tools');
    revalidatePath(`/tools/${validated.slug}`);
    revalidatePath('/admin/tools');
    return { success: true };
  } catch (error: any) {
    if (error?.issues && error.issues.length > 0) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Create tool error:', error);
    return { success: false, error: 'حدث خطأ أثناء إضافة الأداة' };
  }
}

export async function updateToolAction(data: z.infer<typeof toolSchema>) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const validated = toolSchema.parse(data);

    await db
      .insert(tools)
      .values({
        id: validated.id,
        slug: validated.slug,
        number: validated.number || 1,
        name: validated.name,
        category: validated.category,
        badge: validated.badge || null,
        shortDesc: validated.shortDesc,
        longDesc: validated.longDesc || null,
        features: validated.features,
        iconName: validated.iconName,
        isActive: validated.isActive,
      })
      .onConflictDoUpdate({
        target: tools.id,
        set: {
          name: validated.name,
          slug: validated.slug,
          category: validated.category,
          badge: validated.badge || null,
          shortDesc: validated.shortDesc,
          longDesc: validated.longDesc || null,
          features: validated.features,
          iconName: validated.iconName,
          isActive: validated.isActive,
          updatedAt: new Date(),
        },
      });

    if (validated.metaTitle && validated.metaDescription && validated.h1) {
      await db
        .insert(toolsSeo)
        .values({
          toolId: validated.id,
          slug: validated.slug,
          metaTitle: validated.metaTitle,
          metaDescription: validated.metaDescription,
          h1: validated.h1,
          h2Keywords: [],
          keywords: [],
          faqItems: [],
          schemaName: validated.name,
          schemaDescription: validated.shortDesc,
        })
        .onConflictDoUpdate({
          target: toolsSeo.toolId,
          set: {
            slug: validated.slug,
            metaTitle: validated.metaTitle,
            metaDescription: validated.metaDescription,
            h1: validated.h1,
            updatedAt: new Date(),
          },
        });
    }

    revalidatePath('/');
    revalidatePath('/tools');
    revalidatePath(`/tools/${validated.slug}`);
    revalidatePath('/admin/tools');
    return { success: true };
  } catch (error: any) {
    if (error?.issues && error.issues.length > 0) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Update tool error:', error);
    return { success: false, error: 'حدث خطأ أثناء حفظ الأداة' };
  }
}

export async function deleteToolAction(toolId: string) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    await db.delete(tools).where(eq(tools.id, toolId));
    revalidatePath('/');
    revalidatePath('/tools');
    revalidatePath('/admin/tools');
    return { success: true };
  } catch (error) {
    console.error('Delete tool error:', error);
    return { success: false, error: 'حدث خطأ أثناء حذف الأداة' };
  }
}

export async function toggleToolAction(toolId: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    await db
      .update(tools)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(tools.id, toolId));

    revalidatePath('/');
    revalidatePath('/tools');
    revalidatePath('/admin/tools');
    return { success: true };
  } catch (error) {
    console.error('Toggle tool error:', error);
    return { success: false, error: 'حدث خطأ أثناء تغيير حالة الأداة' };
  }
}
