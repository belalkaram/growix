import { db } from '@/db/index';
import { orders, siteSettings, paymentTransactions } from '@/db/schema';
import { eq, and, isNull, gte, desc } from 'drizzle-orm';
import { ParsedPaymentMessage, normalizeEgyptianPhone, PaymentProvider } from './types';

export type MatchStatus = 
  | 'AUTO_APPROVED'
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
      return result;
    }
    
    result.matchReasons.push('PHONE_MATCH');

  } else if (parsedMsg.provider === 'instapay') {
    // InstaPay specific rules
    // No sender phone provided in SMS, relies strictly on amount exact match + time window uniqueness
    for (const order of amountMatchedCandidates) {
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
    result.status = 'AUTO_APPROVED';
    result.matchedOrderId = finalCandidates[0].id;
    result.matchReasons.push('TRANSACTION_UNIQUE');
    result.matchReasons.push('TIMESTAMP_VALID');
    return result;
  }

  return result;
}

/**
 * Reverse Matching Service (Bidirectional Engine):
 * When a customer creates an order on the checkout page AFTER already transferring money via phone,
 * this function searches recently arrived unlinked payment transactions (from the past 2 hours)
 * with special prioritization for transactions arriving in the 1 to 15 minutes window before checkout.
 */
export async function matchOrderWithRecentTransactions(order: {
  id: string;
  amount: string;
  paymentProvider: string;
  senderNumber: string;
  createdAt: Date;
}) {
  const orderAmountCents = Math.round(parseFloat(order.amount) * 100);
  const twoHoursAgo = new Date(order.createdAt.getTime() - 2 * 60 * 60 * 1000);
  const normalizedSenderPhone = normalizeEgyptianPhone(order.senderNumber);

  // 1. Fetch unlinked transactions received in the last 2 hours matching provider & amount
  const candidateTxs = await db
    .select()
    .from(paymentTransactions)
    .where(
      and(
        isNull(paymentTransactions.matchedOrderId),
        eq(paymentTransactions.provider, order.paymentProvider),
        eq(paymentTransactions.amountCents, orderAmountCents),
        gte(paymentTransactions.createdAt, twoHoursAgo)
      )
    )
    .orderBy(desc(paymentTransactions.createdAt));

  if (candidateTxs.length === 0) {
    return { match: false, reason: 'NO_RECENT_TRANSACTION_FOUND' };
  }

  let matchedTx = null;

  if (order.paymentProvider === 'vodafone_cash') {
    // For Vodafone Cash, phone match gives 100% certainty
    const matchingPhoneTxs = candidateTxs.filter((tx) => {
      const txPhone = normalizeEgyptianPhone(tx.senderPhone || '');
      return txPhone && txPhone === normalizedSenderPhone;
    });

    if (matchingPhoneTxs.length === 1) {
      matchedTx = matchingPhoneTxs[0];
    } else if (matchingPhoneTxs.length > 1) {
      // If multiple from same phone, choose the one closest to order creation time
      matchedTx = matchingPhoneTxs.sort((a, b) => {
        const diffA = Math.abs(order.createdAt.getTime() - a.createdAt.getTime());
        const diffB = Math.abs(order.createdAt.getTime() - b.createdAt.getTime());
        return diffA - diffB;
      })[0];
    }
  } else if (order.paymentProvider === 'instapay') {
    // For InstaPay: Prioritize transactions received within 1 to 15 minutes BEFORE the order was submitted
    // Sort candidates by time distance to order creation
    const sortedByDistance = [...candidateTxs].sort((a, b) => {
      const diffA = Math.abs(order.createdAt.getTime() - a.createdAt.getTime());
      const diffB = Math.abs(order.createdAt.getTime() - b.createdAt.getTime());
      return diffA - diffB;
    });

    if (candidateTxs.length === 1) {
      matchedTx = candidateTxs[0];
    } else {
      // If multiple unlinked InstaPay transactions exist, check if exactly one is in the immediate 1-15 min window
      const fifteenMinsMs = 15 * 60 * 1000;
      const immediateWindowTxs = candidateTxs.filter((tx) => {
        const diff = order.createdAt.getTime() - tx.createdAt.getTime();
        // Payment happened between 0 seconds and 15 minutes before the order
        return diff >= -30000 && diff <= fifteenMinsMs;
      });

      if (immediateWindowTxs.length === 1) {
        matchedTx = immediateWindowTxs[0];
      } else {
        return { match: false, reason: 'MULTIPLE_INSTAPAY_TRANSACTIONS_REQUIRE_REVIEW', count: candidateTxs.length };
      }
    }
  }

  if (matchedTx) {
    return {
      match: true,
      transaction: matchedTx,
      status: 'AUTO_APPROVED' as const,
      reason: 'EXACT_REVERSE_MATCH_PRIOR_PAYMENT'
    };
  }

  return { match: false, reason: 'NO_DEFINITIVE_MATCH' };
}
