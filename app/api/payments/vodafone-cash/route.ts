import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentTransactions } from '@/db/schema';
import { parseVodafoneCashMessage } from '@/lib/payments/vodafone-cash-parser';
import { matchVodafoneCashPayment } from '@/lib/payments/vodafone-cash-matcher';
import { checkRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // 1. HTTPS only validation (if in production)
    if (process.env.NODE_ENV === 'production' && !req.url.startsWith('https://')) {
      return NextResponse.json({ success: false, status: 'SECURE_CONNECTION_REQUIRED' }, { status: 400 });
    }

    // 2. Authentication
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.VODAFONE_CASH_WEBHOOK_SECRET;
    
    if (!expectedSecret) {
      console.error('CRITICAL: VODAFONE_CASH_WEBHOOK_SECRET is not set');
      return NextResponse.json({ success: false, status: 'SERVER_CONFIGURATION_ERROR' }, { status: 500 });
    }
    
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
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

    const { rawMessage } = body;
    if (!rawMessage || typeof rawMessage !== 'string') {
      return NextResponse.json({ success: false, status: 'MISSING_MESSAGE' }, { status: 400 });
    }

    // 5. Parser Integration
    const parsedMsg = parseVodafoneCashMessage(rawMessage);

    // Prepare fields for DB Insertion
    let transactionId = '';
    let amount = '0';
    let amountCents = 0;
    let senderPhone = 'unknown';
    let walletPhone = 'unknown';
    let statusStr = 'INVALID_MESSAGE';
    let reviewReason = '';
    let matchResultDetails = null;

    if (!parsedMsg) {
      // Parser failed completely (missing critical amounts/phones)
      transactionId = `INV_${crypto.randomBytes(8).toString('hex')}`;
      reviewReason = 'Failed to parse SMS message structure';
    } else if (!parsedMsg.transactionId) {
      // Parsed successfully but NO transactionId
      transactionId = `NOTX_${crypto.randomBytes(8).toString('hex')}`;
      amount = parsedMsg.amount;
      amountCents = parsedMsg.amountCents;
      senderPhone = parsedMsg.senderPhone;
      walletPhone = parsedMsg.walletPhone || 'unknown';
      reviewReason = 'Missing transactionId in SMS';
    } else {
      // Full successful parse
      transactionId = parsedMsg.transactionId;
      amount = parsedMsg.amount;
      amountCents = parsedMsg.amountCents;
      senderPhone = parsedMsg.senderPhone;
      walletPhone = parsedMsg.walletPhone || 'unknown';
      
      // PHASE 3B: DRY RUN Matching Engine
      try {
        const matchResult = await matchVodafoneCashPayment(parsedMsg);
        statusStr = matchResult.status;
        reviewReason = matchResult.matchReasons.join(', ');
        matchResultDetails = matchResult;
      } catch (err: any) {
        console.error('Match engine error:', err);
        statusStr = 'FAILED';
        reviewReason = 'Matcher engine failed: ' + err.message;
      }
    }

    // 6. DB Persistence & Idempotency (PHASE 3A)
    try {
      await db.insert(paymentTransactions).values({
        transactionId,
        provider: 'vodafone_cash',
        amount,
        amountCents,
        senderPhone,
        senderName: parsedMsg?.senderName || null,
        walletPhone,
        rawTransactionDate: parsedMsg?.rawTransactionDate || null,
        rawTransactionTime: parsedMsg?.rawTransactionTime || null,
        rawMessage: rawMessage,
        status: statusStr,
        matchedOrderId: matchResultDetails?.matchedOrderId || null,
        reviewReason,
        metadata: {
          candidates: matchResultDetails?.candidateCount || 0,
          isDryRun: true,
          reasons: matchResultDetails?.matchReasons || []
        },
        isDryRun: true, // As requested, PHASE 3 is DRY RUN only
        processedAt: new Date()
      });
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

    // Safe logging (No secrets)
    console.log(`Webhook processed Vodafone Cash: status=${statusStr} txId=${transactionId}`);

    // Return safe external response
    return NextResponse.json({ success: true, status: statusStr });
    
  } catch (err) {
    console.error('Unexpected webhook error:', err);
    return NextResponse.json({ success: false, status: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
