import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pageViews } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const { 
      type = 'view', 
      path, 
      referrer, 
      sessionId, 
      utmSource, 
      utmMedium, 
      utmCampaign, 
      durationSeconds = 0,
    } = body;

    // Sanitize and validate sessionId (prevent injection)
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 100) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const cleanSessionId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    const cleanPath = typeof path === 'string' ? path.slice(0, 300) : '';

    // Check server session to accurately determine isAdmin and isTest
    const session = await auth();
    const userRole = (session?.user as { role?: string })?.role;
    const isServerAdmin = userRole === 'admin';
    const isServerTest = userRole === 'test' || body.isTest === true;

    // Handle duration update on unload / beacon ping
    if (type === 'ping' || type === 'duration') {
      const safeDuration = typeof durationSeconds === 'number' ? Math.max(0, Math.min(3600, durationSeconds)) : 0;
      if (safeDuration > 0) {
        const [recentView] = await db
          .select({ id: pageViews.id, durationSeconds: pageViews.durationSeconds })
          .from(pageViews)
          .where(
            and(
              eq(pageViews.sessionId, cleanSessionId),
              cleanPath ? eq(pageViews.path, cleanPath) : undefined
            )
          )
          .orderBy(desc(pageViews.createdAt))
          .limit(1);

        if (recentView) {
          await db
            .update(pageViews)
            .set({ 
              durationSeconds: Math.max(recentView.durationSeconds || 0, safeDuration),
              isAdmin: isServerAdmin,
              isTest: isServerTest,
            })
            .where(eq(pageViews.id, recentView.id));
        }
      }
      return NextResponse.json({ ok: true });
    }

    // Default: Record PageView
    if (!cleanPath) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const deviceType = /mobile|android|iphone|ipad/i.test(userAgent) ? 'mobile' : 'desktop';
    const country = (req.headers.get('x-vercel-ip-country') || 'EG').slice(0, 10);

    const safeReferrer = typeof referrer === 'string' ? referrer.slice(0, 400) : null;
    const safeUtmSource = typeof utmSource === 'string' ? utmSource.slice(0, 100) : null;
    const safeUtmMedium = typeof utmMedium === 'string' ? utmMedium.slice(0, 100) : null;
    const safeUtmCampaign = typeof utmCampaign === 'string' ? utmCampaign.slice(0, 100) : null;
    const safeDuration = typeof durationSeconds === 'number' ? Math.max(0, Math.min(3600, durationSeconds)) : 0;

    // Insert sanitized page view record
    const [newView] = await db
      .insert(pageViews)
      .values({
        sessionId: cleanSessionId,
        path: cleanPath,
        referrer: safeReferrer,
        utmSource: safeUtmSource,
        utmMedium: safeUtmMedium,
        utmCampaign: safeUtmCampaign,
        country,
        deviceType,
        durationSeconds: safeDuration,
        isAdmin: isServerAdmin,
        isTest: isServerTest,
      })
      .returning({ id: pageViews.id });

    return NextResponse.json({ ok: true, viewId: newView?.id });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
