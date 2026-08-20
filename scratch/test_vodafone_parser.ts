import { parseVodafoneCashMessage } from '../lib/payments/vodafone-cash-parser.js';
import { normalizeEgyptianPhone } from '../lib/payments/types.js';
import assert from 'assert';

function testNormalizePhone() {
  assert.strictEqual(normalizeEgyptianPhone('01019033661'), '01019033661');
  assert.strictEqual(normalizeEgyptianPhone('+201019033661'), '01019033661');
  assert.strictEqual(normalizeEgyptianPhone('00201019033661'), '01019033661');
  assert.strictEqual(normalizeEgyptianPhone('201019033661'), '01019033661');
  assert.strictEqual(normalizeEgyptianPhone('011 2233 4455'), '01122334455');
  console.log('✅ Phone normalization tests passed.');
}

function testParser() {
  // Real User Message
  const msgReal = `تم استلام مبلغ 320.00 جنيه من 01205798578؛
المسجل بإسم OMAR ASHRAF ABDLTAWAB ABDLRAZIK
على رقم محفظتك 01019033661 بتاريخ 13:54 26-08-09.
رصيدك الحالي: 335.56 جنيه
رقم العملية: 022521856691
تقدر تتابع كل مصروفاتك من تاريخ المعاملات على أبلكيشن أنا فودافون http://vf.eg/vfcash`;
  
  const parsedReal = parseVodafoneCashMessage(msgReal);
  assert.ok(parsedReal);
  assert.strictEqual(parsedReal.amount, '320.00');
  assert.strictEqual(parsedReal.amountCents, 32000);
  assert.strictEqual(parsedReal.senderPhone, '01205798578');
  assert.strictEqual(parsedReal.senderName, 'OMAR ASHRAF ABDLTAWAB ABDLRAZIK');
  assert.strictEqual(parsedReal.walletPhone, '01019033661');
  assert.strictEqual(parsedReal.rawTransactionDate, '26-08-09');
  assert.strictEqual(parsedReal.rawTransactionTime, '13:54');
  assert.strictEqual(parsedReal.transactionId, '022521856691');

  // Valid message 1
  const msg1 = "تم استلام مبلغ 320.00 جنيه من رقم 01012345678 رقم العملية 987654321 بتاريخ 2026-08-20 الساعة 14:30";
  const parsed1 = parseVodafoneCashMessage(msg1);
  assert.ok(parsed1);
  assert.strictEqual(parsed1.amount, '320.00');
  assert.strictEqual(parsed1.senderPhone, '01012345678');
  assert.strictEqual(parsed1.transactionId, '987654321');

  // Invalid - missing phone
  const invalid1 = "تم استلام مبلغ 320.00 جنيه";
  assert.strictEqual(parseVodafoneCashMessage(invalid1), null);

  console.log('✅ Parser tests passed.');
}

function runTests() {
  try {
    testNormalizePhone();
    testParser();
    console.log('All tests passed successfully! 🎉');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

runTests();
