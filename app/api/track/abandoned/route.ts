import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { abandonedCheckouts } from '@/db/schema';
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
      sessionId, 
      phone, 
      packageId, 
      toolId, 
      amount, 
      couponCode,
      lastStep = 3 
    } = body;

    // Validate phone and session
    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return NextResponse.json({ ok: false, message: 'Invalid phone' }, { status: 400 });
    }

    const cleanPhone = phone.trim().slice(0, 50);
    const cleanSessionId = typeof sessionId === 'string' && sessionId ? sessionId.slice(0, 80) : 'unknown_session';
    const cleanPackageId = typeof packageId === 'string' ? packageId.slice(0, 100) : null;
    const cleanToolId = typeof toolId === 'string' ? toolId.slice(0, 100) : null;
    const cleanAmount = typeof amount === 'string' || typeof amount === 'number' ? String(amount).slice(0, 50) : null;
    const cleanCoupon = typeof couponCode === 'string' ? couponCode.slice(0, 50) : null;

    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';

    const session = await auth();
    const userId = (session?.user as { id?: string })?.id || null;

    // Check if an incomplete record already exists for this session or phone
    const [existing] = await db
      .select({ id: abandonedCheckouts.id })
      .from(abandonedCheckouts)
      .where(
        and(
          eq(abandonedCheckouts.isCompleted, false),
          eq(abandonedCheckouts.phone, cleanPhone)
        )
      )
      .orderBy(desc(abandonedCheckouts.updatedAt))
      .limit(1);

    if (existing) {
      await db
        .update(abandonedCheckouts)
        .set({
          sessionId: cleanSessionId,
          userId: userId || undefined,
          packageId: cleanPackageId,
          toolId: cleanToolId,
          amount: cleanAmount,
          couponCode: cleanCoupon,
          lastStep: Number(lastStep) || 3,
          ip: ip.slice(0, 100),
          userAgent: userAgent.slice(0, 500),
          updatedAt: new Date(),
        })
        .where(eq(abandonedCheckouts.id, existing.id));

      return NextResponse.json({ ok: true, action: 'updated', id: existing.id });
    }

    // Insert new abandoned lead
    const [newLead] = await db
      .insert(abandonedCheckouts)
      .values({
        sessionId: cleanSessionId,
        userId: userId || null,
        phone: cleanPhone,
        packageId: cleanPackageId,
        toolId: cleanToolId,
        amount: cleanAmount,
        couponCode: cleanCoupon,
        ip: ip.slice(0, 100),
        userAgent: userAgent.slice(0, 500),
        isCompleted: false,
        lastStep: Number(lastStep) || 3,
      })
      .returning({ id: abandonedCheckouts.id });

    return NextResponse.json({ ok: true, action: 'created', id: newLead.id });
  } catch (error) {
    console.error('Error in /api/track/abandoned:', error);
    return NextResponse.json({ ok: false, error: 'Failed to record lead' }, { status: 500 });
  }
}
