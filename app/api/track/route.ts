import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pageViews } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

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
      isAdmin = false,
      isTest = false
    } = body;

    if (!sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Handle duration update on unload / beacon ping
    if (type === 'ping' || type === 'duration') {
      if (durationSeconds > 0) {
        // Find most recent pageview for this session and path
        const [recentView] = await db
          .select({ id: pageViews.id, durationSeconds: pageViews.durationSeconds })
          .from(pageViews)
          .where(
            and(
              eq(pageViews.sessionId, sessionId),
              path ? eq(pageViews.path, path) : undefined
            )
          )
          .orderBy(desc(pageViews.createdAt))
          .limit(1);

        if (recentView) {
          await db
            .update(pageViews)
            .set({ 
              durationSeconds: Math.max(recentView.durationSeconds || 0, Math.min(3600, durationSeconds)),
              isAdmin: isAdmin || false,
              isTest: isTest || false,
            })
            .where(eq(pageViews.id, recentView.id));
        }
      }
      return NextResponse.json({ ok: true });
    }

    // Default: Record PageView
    if (!path) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const deviceType = /mobile|android|iphone|ipad/i.test(userAgent) ? 'mobile' : 'desktop';
    const country = req.headers.get('x-vercel-ip-country') || 'EG';

    // Insert lightweight page view record
    const [newView] = await db
      .insert(pageViews)
      .values({
        sessionId,
        path: path.slice(0, 500),
        referrer: referrer ? referrer.slice(0, 500) : null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        country,
        deviceType,
        durationSeconds: durationSeconds || 0,
        isAdmin: isAdmin || false,
        isTest: isTest || false,
      })
      .returning({ id: pageViews.id });

    return NextResponse.json({ ok: true, viewId: newView?.id });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
