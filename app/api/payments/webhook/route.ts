import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentTransactions } from '@/db/schema';
import { parseVodafoneCashMessage } from '@/lib/payments/vodafone-cash-parser';
import { parseInstaPayMessage } from '@/lib/payments/instapay-parser';
import { matchPayment } from '@/lib/payments/matcher';
import { approveOrderCore } from '@/lib/actions/orders';
import { checkRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

/**
 * Timing-safe constant-time string comparison to prevent timing-attack vulnerability on auth tokens.
 */
function timingSafeEqualStr(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. HTTPS only validation (if in production)
    if (process.env.NODE_ENV === 'production' && !req.url.startsWith('https://')) {
      return NextResponse.json({ success: false, status: 'SECURE_CONNECTION_REQUIRED' }, { status: 400 });
    }

    // 2. Authentication with Timing-Safe Token Check
    const authHeader = req.headers.get('authorization') || '';
    const expectedSecret = process.env.PAYMENT_WEBHOOK_SECRET || process.env.VODAFONE_CASH_WEBHOOK_SECRET;
    
    if (!expectedSecret) {
      console.error('CRITICAL: PAYMENT_WEBHOOK_SECRET is not set');
      return NextResponse.json({ success: false, status: 'SERVER_CONFIGURATION_ERROR' }, { status: 500 });
    }
    
    const expectedHeader = `Bearer ${expectedSecret}`;
    if (!authHeader || !timingSafeEqualStr(authHeader, expectedHeader)) {
      return NextResponse.json({ success: false, status: 'UNAUTHORIZED' }, { status: 401 });
    }

    // 3. Rate Limiting
    const rateLimit = await checkRateLimit({
      action: 'api',
      maxRequests: 30, // Allows 30 webhook requests per minute
      windowMs: 60 * 1000, 
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, status: 'RATE_LIMITED' }, { status: 429 });
    }

    // 4. Request Validation
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ success: false, status: 'INVALID_CONTENT_TYPE' }, { status: 400 });
    }

    const rawBody = await req.text();
    if (rawBody.length > 5000) {
      return NextResponse.json({ success: false, status: 'PAYLOAD_TOO_LARGE' }, { status: 413 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ success: false, status: 'INVALID_JSON' }, { status: 400 });
    }

    // Shortcut sends { message: "...", device: "iphone" }
    const rawMessage = body.message || body.rawMessage; 
    const device = body.device || 'unknown';

    if (!rawMessage || typeof rawMessage !== 'string') {
      return NextResponse.json({ success: false, status: 'MISSING_MESSAGE' }, { status: 400 });
    }

    // 5. Provider Detection (Conservative)
    let detectedProvider: 'vodafone_cash' | 'instapay' | null = null;
    
    if (
      (rawMessage.includes('استلام مبلغ') || rawMessage.includes('تم استلام')) && 
      (rawMessage.includes('رقم العملية') || rawMessage.includes('رقم محفظتك'))
    ) {
      detectedProvider = 'vodafone_cash';
    } else if (
      rawMessage.includes('تحويل لحظي') && 
      (rawMessage.includes('رقم مرجعي') || rawMessage.includes('رقم المرجع'))
    ) {
      detectedProvider = 'instapay';
    }

    if (!detectedProvider) {
      return NextResponse.json({ success: false, status: 'INVALID_MESSAGE' }, { status: 400 });
    }

    // 6. Multi-provider Parsing
    const parsedMsg = detectedProvider === 'vodafone_cash' 
      ? parseVodafoneCashMessage(rawMessage) 
      : parseInstaPayMessage(rawMessage);

    // Prepare fields for DB Insertion
    let transactionId = '';
    let amount = '0';
    let amountCents = 0;
    let senderPhone = 'unknown';
    let walletPhone = 'unknown';
    let statusStr = 'INVALID_MESSAGE';
    let reviewReason = '';
    let matchResultDetails: any = null;

    if (!parsedMsg) {
      // Parser failed completely (missing critical amounts/phones/reference)
      transactionId = `INV_${crypto.randomBytes(8).toString('hex')}`;
      reviewReason = 'Failed to parse SMS message structure';
    } else if (!parsedMsg.transactionId) {
      // Parsed successfully but NO transactionId
      transactionId = `NOTX_${crypto.randomBytes(8).toString('hex')}`;
      amount = parsedMsg.amount;
      amountCents = parsedMsg.amountCents;
      senderPhone = parsedMsg.senderPhone || 'unknown';
      walletPhone = parsedMsg.walletPhone || 'unknown';
      reviewReason = 'Missing transactionId or referenceId in SMS';
    } else {
      // Full successful parse
      transactionId = parsedMsg.transactionId;
      amount = parsedMsg.amount;
      amountCents = parsedMsg.amountCents;
      senderPhone = parsedMsg.senderPhone || 'unknown';
      walletPhone = parsedMsg.walletPhone || 'unknown';
      
      // Matching Engine
      try {
        const matchResult = await matchPayment(parsedMsg);
        statusStr = matchResult.status;
        reviewReason = matchResult.matchReasons.join(', ');
        matchResultDetails = matchResult;
      } catch (err: any) {
        console.error('Match engine error:', err);
        statusStr = 'FAILED';
        reviewReason = 'Matcher engine failed: ' + err.message;
      }
    }

    // 7. DB Persistence & Idempotency
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const isLiveApproved = statusStr === 'AUTO_APPROVED' && !!matchResultDetails?.matchedOrderId;

    try {
      await db.insert(paymentTransactions).values({
        transactionId,
        provider: detectedProvider,
        amount,
        amountCents,
        senderPhone,
        senderName: parsedMsg?.senderName || null,
        walletPhone,
        rawTransactionDate: parsedMsg?.rawTransactionDate || null,
        rawTransactionTime: parsedMsg?.rawTransactionTime || null,
        referenceId: parsedMsg?.provider === 'instapay' ? parsedMsg.transactionId : null,
        rawMessage: rawMessage,
        status: statusStr,
        matchedOrderId: matchResultDetails?.matchedOrderId || null,
        reviewReason,
        metadata: {
          candidates: matchResultDetails?.candidateCount || 0,
          isDryRun: !isLiveApproved,
          reasons: matchResultDetails?.matchReasons || [],
          device,
          ip,
          userAgent,
          receivedAt: new Date().toISOString()
        },
        isDryRun: !isLiveApproved,
        processedAt: new Date()
      });

      // 8. 🚀 LIVE AUTO-APPROVAL SIDE-EFFECT
      if (isLiveApproved && matchResultDetails?.matchedOrderId) {
        await approveOrderCore({
          orderId: matchResultDetails.matchedOrderId,
          approvalType: 'auto',
          matchedTransactionId: transactionId,
          adminNotes: `تم التفعيل التلقائي الفوري بواسطة الـ Webhook (${detectedProvider})`,
        });
      }
    } catch (dbErr: any) {
      // Check for PostgreSQL unique constraint violation on transaction_id
      const errCode = dbErr.code || dbErr.cause?.code;
      const errMsg = dbErr.message || '';
      const causeMsg = dbErr.cause?.message || '';
      
      if (errCode === '23505' || errMsg.includes('unique constraint') || causeMsg.includes('unique constraint') || errMsg.includes('duplicate key') || causeMsg.includes('duplicate key')) {
        return NextResponse.json({ success: true, status: 'DUPLICATE' });
      }
      console.error('DB Persistence Error:', dbErr);
      return NextResponse.json({ success: false, status: 'INTERNAL_DB_ERROR' }, { status: 500 });
    }

    console.log(`Webhook processed ${detectedProvider}: txId=${transactionId} status=${statusStr} matchedOrderId=${matchResultDetails?.matchedOrderId || 'none'} candidates=${matchResultDetails?.candidateCount || 0}`);

    return NextResponse.json({ success: true, status: statusStr });
    
  } catch (err) {
    console.error('Unexpected webhook error:', err);
    return NextResponse.json({ success: false, status: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
