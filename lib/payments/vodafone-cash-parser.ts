import { ParsedPaymentMessage, normalizeEgyptianPhone } from './types';

/**
 * Pure function to parse Vodafone Cash SMS message.
 * Extracts amount, sender phone, and optionally transaction ID.
 * Employs conservative parsing to fail-closed on ambiguity.
 */
export function parseVodafoneCashMessage(rawMessage: string): ParsedPaymentMessage | null {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return null;
  }

  const message = rawMessage.trim();

  // Extract amount
  // Matches "مبلغ 300 جنيه" or "مبلغ 300.50" or "received 300 EGP"
  const amountRegex = /(?:مبلغ|استلام|ايداع|received|amount)\s*[:\-]?\s*([0-9]+(?:\.[0-9]{1,2})?)\s*(?:جنيه|جنية|ج|egp)/i;
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

  // Extract sender phone
  // Matches "من 01012345678" or "من رقم 01012345678" or "from 01012345678"
  const phoneRegex = /(?:من|من رقم|رقم|from|sender)\s*[:\-]?\s*([+0-9\s]{10,15})/i;
  const phoneMatch = message.match(phoneRegex);
  
  if (!phoneMatch || !phoneMatch[1]) {
    return null; // Cannot determine sender phone
  }

  const senderPhone = normalizeEgyptianPhone(phoneMatch[1]);
  if (!senderPhone.startsWith('01') || senderPhone.length !== 11) {
    return null; // Invalid Egyptian phone format
  }

  // Extract sender name
  // Matches "المسجل بإسم OMAR ASHRAF"
  const senderNameRegex = /(?:المسجل بإسم|بإسم)\s+([a-zA-Z\s]+)(?:[\r\n؛;]|$)/i;
  const senderNameMatch = message.match(senderNameRegex);
  const senderName = senderNameMatch ? senderNameMatch[1].trim() : undefined;

  // Extract wallet phone
  // Matches "على رقم محفظتك 01019033661"
  const walletPhoneRegex = /(?:رقم محفظتك|محفظتك)\s*[:\-]?\s*([+0-9\s]{10,15})/i;
  const walletPhoneMatch = message.match(walletPhoneRegex);
  const walletPhone = walletPhoneMatch ? normalizeEgyptianPhone(walletPhoneMatch[1]) : undefined;

  // Extract optional transaction ID
  // Matches "رقم العملية: 123456" or "Transaction ID: 123456"
  const txIdRegex = /(?:رقم العملية|العملية|رقم المرجع|transaction id|txn id|trx)\s*[:\-]?\s*([0-9a-zA-Z]+)/i;
  const txIdMatch = message.match(txIdRegex);
  const transactionId = txIdMatch && txIdMatch[1] ? txIdMatch[1] : undefined;
  
  // Extract date/time from the real format: "بتاريخ 13:54 26-08-09"
  // General format: "بتاريخ HH:mm DD-MM-YY" or "بتاريخ DD-MM-YYYY الساعة HH:mm"
  let rawTransactionDate: string | undefined;
  let rawTransactionTime: string | undefined;
  
  const dateTimeCombinedRegex = /(?:بتاريخ)\s+([0-9]{1,2}:[0-9]{2})\s+([0-9]{2}-[0-9]{2}-[0-9]{2,4})/i;
  const dateTimeCombinedMatch = message.match(dateTimeCombinedRegex);
  if (dateTimeCombinedMatch) {
    rawTransactionTime = dateTimeCombinedMatch[1];
    rawTransactionDate = dateTimeCombinedMatch[2];
  } else {
    // Fallback standard regex
    const dateRegex = /(?:بتاريخ|date)\s*[:\-]?\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}\/[0-9]{2}\/[0-9]{4})/i;
    const timeRegex = /(?:الساعة|الوقت|time)\s*[:\-]?\s*([0-9]{1,2}:[0-9]{2}(?:\s*(?:am|pm|ص|م))?)/i;
    const dateMatch = message.match(dateRegex);
    const timeMatch = message.match(timeRegex);
    rawTransactionDate = dateMatch ? dateMatch[1] : undefined;
    rawTransactionTime = timeMatch ? timeMatch[1] : undefined;
  }

  return {
    provider: 'vodafone_cash',
    amount: amountStr,
    amountCents,
    senderPhone,
    senderName,
    walletPhone,
    transactionId,
    rawTransactionDate,
    rawTransactionTime,
    isMatched: false, // Will be set by matcher logic later
    rawMessage: message
  };
}
