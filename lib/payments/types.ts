export type PaymentProvider = 'vodafone_cash' | 'instapay' | 'other';

export interface ParsedPaymentMessage {
  provider: PaymentProvider;
  amount: string; // Exact string like "320.00"
  amountCents: number; // For exact math: 32000
  senderPhone?: string; // e.g. "01205798578" (Vodafone Cash)
  senderName?: string; // Extracted customer name
  walletPhone?: string; // Receiving company wallet or InstaPay address
  transactionId?: string; // Must be uniquely extracted for idempotency
  rawTransactionDate?: string; // e.g. "26-08-09"
  rawTransactionTime?: string; // e.g. "13:54"
  isMatched: boolean;
  rawMessage: string;
}

/**
 * Normalizes an Egyptian phone number to local 11-digit format (01...).
 * Handles +20, 0020, 20 prefixes.
 */
export function normalizeEgyptianPhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9+]/g, '');
  
  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('0020')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('20') && cleaned.length === 12) {
    cleaned = '0' + cleaned.substring(2);
  }
  
  return cleaned;
}
