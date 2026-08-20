import { parseInstaPayMessage } from '../lib/payments/instapay-parser.js';
import assert from 'assert';

function testInstaPayParser() {
  // Real User Message
  const msgReal = `تم إضافة تحويل لحظي لبطاقتكم مسبقة الدفع بمبلغ 550.00 جم من محمد لطفى مفيد رجب رقم مرجعي 448940145821 يوم 08-12 الساعة 10:38 للمزيد اتصل بـ 19623`;
  
  const parsedReal = parseInstaPayMessage(msgReal);
  assert.ok(parsedReal);
  assert.strictEqual(parsedReal.provider, 'instapay');
  assert.strictEqual(parsedReal.amount, '550.00');
  assert.strictEqual(parsedReal.amountCents, 55000);
  assert.strictEqual(parsedReal.senderName, 'محمد لطفى مفيد رجب');
  assert.strictEqual(parsedReal.transactionId, '448940145821');
  assert.strictEqual(parsedReal.rawTransactionDate, '08-12');
  assert.strictEqual(parsedReal.rawTransactionTime, '10:38');

  // Valid message 2 (different variation)
  const msg2 = "استلام تحويل بمبلغ 200 جنيه من Ahmed Ali رقم العملية tx123456 يوم 2026-08-09 الساعة 14:00";
  const parsed2 = parseInstaPayMessage(msg2);
  assert.ok(parsed2);
  assert.strictEqual(parsed2.amount, '200.00');
  assert.strictEqual(parsed2.amountCents, 20000);
  assert.strictEqual(parsed2.senderName, 'Ahmed Ali');
  assert.strictEqual(parsed2.transactionId, 'tx123456');

  // Invalid - missing amount
  const invalid1 = "تم إضافة تحويل لحظي لبطاقتكم مسبقة الدفع من محمد لطفى مفيد رجب رقم مرجعي 448940145821";
  assert.strictEqual(parseInstaPayMessage(invalid1), null);

  console.log('✅ InstaPay Parser tests passed.');
}

function runTests() {
  try {
    testInstaPayParser();
    console.log('All tests passed successfully! 🎉');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

runTests();
