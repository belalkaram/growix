import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pageViews } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, referrer, sessionId, utmSource, utmMedium, utmCampaign } = body;

    if (!path || !sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const deviceType = /mobile|android|iphone|ipad/i.test(userAgent) ? 'mobile' : 'desktop';
    const country = req.headers.get('x-vercel-ip-country') || 'EG';

    // Insert lightweight page view record
    await db.insert(pageViews).values({
      sessionId,
      path: path.slice(0, 500),
      referrer: referrer ? referrer.slice(0, 500) : null,
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      country,
      deviceType,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
