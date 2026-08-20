import { matchPayment } from '../lib/payments/matcher.js';
import { db } from '../db/index.js';
import { orders } from '../db/schema.js';
import { ParsedPaymentMessage } from '../lib/payments/types.js';
import assert from 'assert';
import { eq } from 'drizzle-orm';

// Mock DB interactions for testing
async function runTests() {
  console.log('--- Starting Multi-provider Matcher Tests ---');

  // Insert mock orders
  const mockUserId = '11111111-1111-1111-1111-111111111111'; // Assuming a user exists or we bypass FK for test?
  // Actually, Drizzle will enforce FK for userId. We might need a real user.
  // Instead of inserting into the DB and risking FK errors, we can mock `db.select` or just use a real user from the DB.
  const user = await db.query.users.findFirst();
  if (!user) {
    console.log('No user found in DB to attach orders to. Skipping DB tests.');
    return;
  }
  const uid = user.id;

  // Clean up any existing test orders
  await db.delete(orders).where(eq(orders.userId, uid));

  // Insert Mock Orders
  const [orderVfExact, orderVfMismatchAmt, orderVfMismatchPhone, orderVfDup1, orderVfDup2, orderIpExact, orderIpDup1, orderIpDup2] = await db.insert(orders).values([
    // Vodafone Exact Single
    { userId: uid, packageId: 'test1', paymentMethod: 'electronic-wallet', paymentProvider: 'vodafone_cash', senderNumber: '01011111111', amount: '500', status: 'pending' },
    // Vodafone Mismatch Amount
    { userId: uid, packageId: 'test2', paymentMethod: 'electronic-wallet', paymentProvider: 'vodafone_cash', senderNumber: '01022222222', amount: '600', status: 'pending' },
    // Vodafone Mismatch Phone
    { userId: uid, packageId: 'test3', paymentMethod: 'electronic-wallet', paymentProvider: 'vodafone_cash', senderNumber: '01033333333', amount: '300', status: 'pending' },
    // Vodafone Duplicate candidates (same amount, same phone)
    { userId: uid, packageId: 'test4', paymentMethod: 'electronic-wallet', paymentProvider: 'vodafone_cash', senderNumber: '01044444444', amount: '400', status: 'pending' },
    { userId: uid, packageId: 'test5', paymentMethod: 'electronic-wallet', paymentProvider: 'vodafone_cash', senderNumber: '01044444444', amount: '400', status: 'pending' },
    // InstaPay Exact Single
    { userId: uid, packageId: 'test6', paymentMethod: 'electronic-wallet', paymentProvider: 'instapay', senderNumber: '01055555555', amount: '700', status: 'pending' },
    // InstaPay Duplicate candidates (same amount)
    { userId: uid, packageId: 'test7', paymentMethod: 'electronic-wallet', paymentProvider: 'instapay', senderNumber: '01066666666', amount: '800', status: 'pending' },
    { userId: uid, packageId: 'test8', paymentMethod: 'electronic-wallet', paymentProvider: 'instapay', senderNumber: '01077777777', amount: '800', status: 'pending' },
  ]).returning();

  // Test 1: Vodafone exact single match
  const msgVfExact: ParsedPaymentMessage = {
    provider: 'vodafone_cash', amount: '500.00', amountCents: 50000,
    senderPhone: '01011111111', transactionId: 'tx1', isMatched: false, rawMessage: 'msg'
  };
  const res1 = await matchPayment(msgVfExact);
  assert.strictEqual(res1.status, 'WOULD_AUTO_APPROVE');
  assert.strictEqual(res1.matchedOrderId, orderVfExact.id);
  console.log('✅ VODAFONE: Exact single match');

  // Test 2: Vodafone amount mismatch
  const msgVfAmtMismatch: ParsedPaymentMessage = {
    provider: 'vodafone_cash', amount: '50.00', amountCents: 5000,
    senderPhone: '01022222222', transactionId: 'tx2', isMatched: false, rawMessage: 'msg'
  };
  const res2 = await matchPayment(msgVfAmtMismatch);
  assert.strictEqual(res2.status, 'NO_MATCH'); // Specifically AMOUNT_MISMATCH
  console.log('✅ VODAFONE: Amount mismatch handled');

  // Test 3: Vodafone phone mismatch
  const msgVfPhoneMismatch: ParsedPaymentMessage = {
    provider: 'vodafone_cash', amount: '300.00', amountCents: 30000,
    senderPhone: '01099999999', transactionId: 'tx3', isMatched: false, rawMessage: 'msg'
  };
  const res3 = await matchPayment(msgVfPhoneMismatch);
  assert.strictEqual(res3.status, 'NO_MATCH'); // Specifically PHONE_MISMATCH
  console.log('✅ VODAFONE: Phone mismatch handled');

  // Test 4: Vodafone multiple matches (ambiguous)
  const msgVfDup: ParsedPaymentMessage = {
    provider: 'vodafone_cash', amount: '400.00', amountCents: 40000,
    senderPhone: '01044444444', transactionId: 'tx4', isMatched: false, rawMessage: 'msg'
  };
  const res4 = await matchPayment(msgVfDup);
  assert.strictEqual(res4.status, 'REVIEW_REQUIRED');
  console.log('✅ VODAFONE: Multiple matches handled');

  // Test 5: InstaPay exact single match
  const msgIpExact: ParsedPaymentMessage = {
    provider: 'instapay', amount: '700.00', amountCents: 70000,
    transactionId: 'tx5', isMatched: false, rawMessage: 'msg'
  };
  const res5 = await matchPayment(msgIpExact);
  assert.strictEqual(res5.status, 'WOULD_AUTO_APPROVE');
  assert.strictEqual(res5.matchedOrderId, orderIpExact.id);
  console.log('✅ INSTAPAY: Exact single match');

  // Test 6: InstaPay multiple matches
  const msgIpDup: ParsedPaymentMessage = {
    provider: 'instapay', amount: '800.00', amountCents: 80000,
    transactionId: 'tx6', isMatched: false, rawMessage: 'msg'
  };
  const res6 = await matchPayment(msgIpDup);
  assert.strictEqual(res6.status, 'REVIEW_REQUIRED');
  console.log('✅ INSTAPAY: Multiple matches handled');

  // Clean up
  await db.delete(orders).where(eq(orders.userId, uid));
  console.log('All tests passed! 🎉');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
