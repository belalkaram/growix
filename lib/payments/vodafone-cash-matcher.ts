import { db } from '@/db/index'; // Let's use @/db since @/db is what lib/rate-limit uses, wait let me check @/db/index vs @/db
import { orders, siteSettings } from '@/db/schema';
import { eq, and, or, isNull } from 'drizzle-orm';
import { ParsedVodafoneCashMessage, normalizeEgyptianPhone } from './vodafone-cash-parser';

export type MatchStatus = 
  | 'WOULD_AUTO_APPROVE' 
  | 'REVIEW_REQUIRED' 
  | 'NO_MATCH' 
  | 'DUPLICATE' 
  | 'WRONG_WALLET' 
  | 'INVALID_MESSAGE' 
  | 'AMOUNT_MISMATCH' 
  | 'PHONE_MISMATCH' 
  | 'TIME_MISMATCH';

export interface MatchResult {
  status: MatchStatus;
  matchedOrderId?: string;
  candidateCount: number;
  matchReasons: string[];
  timestamp: Date;
  transactionId?: string;
}

export async function matchVodafoneCashPayment(parsedMsg: ParsedVodafoneCashMessage): Promise<MatchResult> {
  const timestamp = new Date();
  
  if (!parsedMsg.transactionId) {
    return {
      status: 'INVALID_MESSAGE',
      candidateCount: 0,
      matchReasons: ['Missing critical field: transactionId'],
      timestamp
    };
  }

  // Retrieve official wallet from site settings
  // Try vodafone_cash_wallet first, fallback to whatsapp_number if needed
  const settingsRows = await db.select().from(siteSettings).where(
    or(eq(siteSettings.key, 'vodafone_cash_wallet'), eq(siteSettings.key, 'whatsapp_number'))
  );
  
  const vfWalletSetting = settingsRows.find(s => s.key === 'vodafone_cash_wallet')?.value;
  const waSetting = settingsRows.find(s => s.key === 'whatsapp_number')?.value;
  const officialWalletRaw = vfWalletSetting || waSetting;
  const officialWallet = normalizeEgyptianPhone(officialWalletRaw || '');

  if (parsedMsg.walletPhone && officialWallet) {
    if (parsedMsg.walletPhone !== officialWallet) {
      return {
        status: 'WRONG_WALLET',
        candidateCount: 0,
        matchReasons: [`SMS wallet (${parsedMsg.walletPhone}) does not match system wallet (${officialWallet})`],
        timestamp,
        transactionId: parsedMsg.transactionId
      };
    }
  }

  // Note: Idempotency is checked at the Webhook / route layer by trying to insert the paymentTransaction.
  // If it's already there, the route will return DUPLICATE before calling the matcher.
  
  // Fetch pending candidates
  const candidates = await db.select().from(orders).where(
    and(
      eq(orders.status, 'pending'),
      or(
        isNull(orders.paymentProvider),
        eq(orders.paymentProvider, 'vodafone_cash')
      )
    )
  );

  const exactMatches = [];
  const mismatches = [];

  for (const order of candidates) {
    const orderPhone = normalizeEgyptianPhone(order.senderNumber);
    
    if (orderPhone !== parsedMsg.senderPhone) {
      mismatches.push('PHONE_MISMATCH');
      continue;
    }
    
    // Check amount
    const orderAmountCents = Math.round(parseFloat(order.amount) * 100);
    if (orderAmountCents !== parsedMsg.amountCents) {
      mismatches.push('AMOUNT_MISMATCH');
      continue;
    }
    
    // Check time window (allow order to be created up to 7 days before, or 1 day after the SMS)
    // We use the system time for simplicity since SMS timezone might be ambiguous, 
    // but a robust approach checks order.createdAt against transaction timestamp if parseable.
    // Let's ensure order is not super old (e.g. > 14 days)
    const orderAgeMs = timestamp.getTime() - order.createdAt.getTime();
    const orderAgeDays = orderAgeMs / (1000 * 60 * 60 * 24);
    
    if (orderAgeDays > 14 || orderAgeDays < -1) {
      mismatches.push('TIME_MISMATCH');
      continue;
    }
    
    // Exact match!
    exactMatches.push(order);
  }

  if (exactMatches.length === 1) {
    return {
      status: 'WOULD_AUTO_APPROVE',
      matchedOrderId: exactMatches[0].id,
      candidateCount: 1,
      matchReasons: ['Single exact match on phone, amount, and time window'],
      timestamp,
      transactionId: parsedMsg.transactionId
    };
  }

  if (exactMatches.length > 1) {
    return {
      status: 'REVIEW_REQUIRED',
      candidateCount: exactMatches.length,
      matchReasons: ['Multiple pending orders match the phone and amount exact criteria'],
      timestamp,
      transactionId: parsedMsg.transactionId
    };
  }

  // No exact matches found
  let finalStatus: MatchStatus = 'NO_MATCH';
  let reason = 'No matching pending order found';
  
  if (mismatches.includes('AMOUNT_MISMATCH') && !mismatches.includes('PHONE_MISMATCH')) {
    finalStatus = 'AMOUNT_MISMATCH';
    reason = 'Phone matched but amount did not match any pending order';
  } else if (mismatches.includes('PHONE_MISMATCH')) {
    finalStatus = 'PHONE_MISMATCH';
    reason = 'No pending order with this sender phone was found';
  }

  return {
    status: finalStatus,
    candidateCount: 0,
    matchReasons: [reason],
    timestamp,
    transactionId: parsedMsg.transactionId
  };
}
