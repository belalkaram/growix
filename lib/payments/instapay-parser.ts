import { ParsedPaymentMessage } from './types';

/**
 * Pure function to parse InstaPay SMS message.
 * Extracts amount, sender name, and transaction/reference ID.
 * Employs conservative parsing to fail-closed on ambiguity.
 */
export function parseInstaPayMessage(rawMessage: string): ParsedPaymentMessage | null {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return null;
  }

  const message = rawMessage.trim();

  // Extract amount
  // Matches "بمبلغ 550.00 جم"
  const amountRegex = /(?:بمبلغ|مبلغ|استلام|ايداع)\s*[:\-]?\s*([0-9]+(?:\.[0-9]{1,2})?)\s*(?:جم|جنيه|جنية|ج|egp)/i;
  const amountMatch = message.match(amountRegex);
  
  if (!amountMatch || !amountMatch[1]) {
    return null; // Cannot determine amount safely
  }
  
  let amountStr = amountMatch[1];
  
  // Format amount to standard 2 decimal places if needed for string consistency
  if (!amountStr.includes('.')) {
    amountStr = amountStr + '.00';
  } else if (amountStr.split('.')[1].length === 1) {
    amountStr = amountStr + '0';
  }
  
  const amountCents = Math.round(parseFloat(amountStr) * 100);

  // Extract sender name
  // Matches "من محمد لطفى مفيد رجب رقم مرجعي"
  const senderNameRegex = /(?:من)\s+([\u0621-\u064Aa-zA-Z\s]+?)\s+(?:رقم|يوم|بتاريخ|الساعة|للمزيد)/i;
  const senderNameMatch = message.match(senderNameRegex);
  const senderName = senderNameMatch ? senderNameMatch[1].trim() : undefined;

  // Extract optional transaction ID / reference ID
  // Matches "رقم مرجعي 448940145821"
  const txIdRegex = /(?:رقم مرجعي|رقم المرجع|المرجع|رقم العملية|transaction id|txn id|trx|ref)\s*[:\-]?\s*([0-9a-zA-Z]+)/i;
  const txIdMatch = message.match(txIdRegex);
  const transactionId = txIdMatch && txIdMatch[1] ? txIdMatch[1] : undefined;
  
  // Extract date/time from the real format: "يوم 08-12 الساعة 10:38"
  const dateRegex = /(?:يوم|بتاريخ)\s*[:\-]?\s*([0-9]{2}-[0-9]{2}|[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}\/[0-9]{2}\/[0-9]{4})/i;
  const timeRegex = /(?:الساعة|الوقت|time)\s*[:\-]?\s*([0-9]{1,2}:[0-9]{2}(?:\s*(?:am|pm|ص|م))?)/i;
  
  const dateMatch = message.match(dateRegex);
  const timeMatch = message.match(timeRegex);

  return {
    provider: 'instapay',
    amount: amountStr,
    amountCents,
    senderName,
    transactionId,
    rawTransactionDate: dateMatch ? dateMatch[1] : undefined,
    rawTransactionTime: timeMatch ? timeMatch[1] : undefined,
    isMatched: false,
    rawMessage: message
  };
}
