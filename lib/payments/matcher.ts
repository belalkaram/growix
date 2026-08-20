import { db } from '@/db/index';
import { orders, siteSettings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { ParsedPaymentMessage, normalizeEgyptianPhone, PaymentProvider } from './types';

export type MatchStatus = 
  | 'WOULD_AUTO_APPROVE' 
  | 'REVIEW_REQUIRED' 
  | 'NO_MATCH' 
  | 'DUPLICATE' 
  | 'WRONG_WALLET' 
  | 'INVALID_MESSAGE' 
  | 'AMOUNT_MISMATCH' 
  | 'PHONE_MISMATCH' 
  | 'TIME_MISMATCH'
  | 'WRONG_PROVIDER';

export interface MatchResult {
  status: MatchStatus;
  matchedOrderId?: string;
  provider: PaymentProvider;
  transactionId?: string;
  candidateCount: number;
  matchReasons: string[];
  timestamp: Date;
}

export async function matchPayment(parsedMsg: ParsedPaymentMessage): Promise<MatchResult> {
  const currentTimestamp = new Date();
  const result: MatchResult = {
    status: 'NO_MATCH',
    provider: parsedMsg.provider,
    transactionId: parsedMsg.transactionId,
    candidateCount: 0,
    matchReasons: [],
    timestamp: currentTimestamp
  };

  if (!parsedMsg.transactionId) {
    result.status = 'INVALID_MESSAGE';
    result.matchReasons.push('Missing critical field: transactionId');
    return result;
  }

  // 1. Fetch system wallet settings
  const settingsRows = await db.select().from(siteSettings);
  const vfWalletSetting = settingsRows.find(s => s.key === 'vodafone_cash_wallet')?.value;
  const waSetting = settingsRows.find(s => s.key === 'whatsapp_number')?.value;
  const officialWalletRaw = vfWalletSetting || waSetting;
  const officialWallet = normalizeEgyptianPhone(officialWalletRaw || '');

  // 2. Validate Wallet if present (mostly for Vodafone Cash)
  if (parsedMsg.walletPhone && officialWallet) {
    if (parsedMsg.walletPhone !== officialWallet) {
      result.status = 'WRONG_WALLET';
      result.matchReasons.push(`SMS wallet (${parsedMsg.walletPhone}) does not match system wallet (${officialWallet})`);
      return result;
    } else {
      result.matchReasons.push('WALLET_MATCH');
    }
  }

  // 3. Provider Isolation & Candidate Fetching
  // Only query pending orders with electronic-wallet and matching paymentProvider
  const candidates = await db.select().from(orders).where(
    and(
      eq(orders.status, 'pending'),
      eq(orders.paymentMethod, 'electronic-wallet'),
      eq(orders.paymentProvider, parsedMsg.provider)
    )
  );

  result.matchReasons.push('PROVIDER_MATCH');
  result.matchReasons.push('STATUS_PENDING');

  // 4. Amount Matching (Strict Exact Match on cents)
  let amountMatchedCandidates = [];
  for (const order of candidates) {
    const orderAmountCents = Math.round(parseFloat(order.amount) * 100);
    if (orderAmountCents === parsedMsg.amountCents) {
      amountMatchedCandidates.push(order);
    }
  }

  if (amountMatchedCandidates.length === 0) {
    result.status = 'NO_MATCH';
    result.matchReasons.push('AMOUNT_MISMATCH');
    return result;
  }
  
  result.matchReasons.push('AMOUNT_MATCH');

  // 5. Provider-Specific Matching
  let finalCandidates = [];
  
  if (parsedMsg.provider === 'vodafone_cash') {
    // Vodafone Cash specific rules
    for (const order of amountMatchedCandidates) {
      const orderPhone = normalizeEgyptianPhone(order.senderNumber);
      
      if (orderPhone !== parsedMsg.senderPhone) {
        continue;
      }

      // Check Time Window (Logical window)
      // Allow orders created up to 14 days ago, or safely 24 hours in the future (timezone differences)
      const orderAgeDays = (currentTimestamp.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (orderAgeDays > 14 || orderAgeDays < -1) {
        // Technically matches amount and phone, but too old
        continue; 
      }

      finalCandidates.push(order);
    }

    if (finalCandidates.length === 0) {
      result.status = 'NO_MATCH';
      result.matchReasons.push('PHONE_MISMATCH');
      // If there were candidates before phone filter, and none after, it's a phone mismatch
      return result;
    }
    
    result.matchReasons.push('PHONE_MATCH');

  } else if (parsedMsg.provider === 'instapay') {
    // InstaPay specific rules
    // No sender phone provided in SMS, relies strictly on amount exact match + time window uniqueness
    
    for (const order of amountMatchedCandidates) {
      // Time window check: Since InstaPay only gives Day-Month and HH:mm, 
      // we check order age generally, and we can infer year from order.createdAt
      const orderAgeDays = (currentTimestamp.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (orderAgeDays > 14 || orderAgeDays < -1) {
        continue;
      }
      
      finalCandidates.push(order);
    }

    if (finalCandidates.length === 0) {
      result.status = 'NO_MATCH';
      result.matchReasons.push('TIME_MISMATCH');
      return result;
    }
    
    // Note: senderName is INFORMATIONAL ONLY, so we DO NOT filter by it.
  } else {
    result.status = 'WRONG_PROVIDER';
    result.matchReasons.push('Unsupported provider for auto-matching');
    return result;
  }

  // 6. Evaluate Candidate Count
  result.candidateCount = finalCandidates.length;

  if (finalCandidates.length > 1) {
    result.status = 'REVIEW_REQUIRED';
    result.matchReasons.push('MULTIPLE_CANDIDATES');
    return result;
  }

  if (finalCandidates.length === 1) {
    result.status = 'WOULD_AUTO_APPROVE';
    result.matchedOrderId = finalCandidates[0].id;
    result.matchReasons.push('TRANSACTION_UNIQUE');
    result.matchReasons.push('TIMESTAMP_VALID');
    return result;
  }

  return result;
}
