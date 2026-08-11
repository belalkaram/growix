'use server';

import { db } from '@/db';
import { tools, toolsSeo } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const toolSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  number: z.number().int(),
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
        number: validated.number,
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
    return { success: true };
  } catch (error: any) {
    if (error?.issues && error.issues.length > 0) {
      return { success: false, error: error.issues[0].message };
    }
    console.error('Update tool error:', error);
    return { success: false, error: 'حدث خطأ أثناء حفظ الأداة' };
  }
}
