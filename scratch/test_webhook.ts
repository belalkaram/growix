import { POST } from '@/app/api/payments/webhook/route';
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { orders, paymentTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import assert from 'assert';

const SECRET = 'test_secret_123';
process.env.PAYMENT_WEBHOOK_SECRET = SECRET;
// @ts-ignore
process.env.NODE_ENV = 'development';

async function createMockRequest(body: any, auth: string | null = `Bearer ${SECRET}`, headers: Record<string, string> = {}) {
  const defaultHeaders: Record<string, string> = {
    'content-type': 'application/json',
    'x-forwarded-for': '127.0.0.1',
    'user-agent': 'ios-shortcut/1.0',
    ...headers
  };
  
  if (auth) defaultHeaders['authorization'] = auth;

  return new NextRequest('http://localhost/api/payments/webhook', {
    method: 'POST',
    headers: new Headers(defaultHeaders),
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function runTests() {
  console.log('--- Starting Webhook Phase 6 Tests ---');

  // Create Mock orders for matching tests
  const user = await db.query.users.findFirst();
  if (!user) {
    console.log('No user found, skipping DB matching tests.');
    return;
  }
  
  // Cleanup test orders
  await db.delete(orders).where(eq(orders.userId, user.id));

  const [orderVf, orderIp] = await db.insert(orders).values([
    { userId: user.id, packageId: 'test1', paymentMethod: 'electronic-wallet', paymentProvider: 'vodafone_cash', senderNumber: '01205798578', amount: '320', status: 'pending' },
    { userId: user.id, packageId: 'test2', paymentMethod: 'electronic-wallet', paymentProvider: 'instapay', senderNumber: 'unknown', amount: '550', status: 'pending' }
  ]).returning();

  // 1. Invalid Secret
  const req1 = await createMockRequest({ message: 'test' }, 'Bearer WRONG');
  const res1 = await POST(req1);
  assert.strictEqual(res1.status, 401);
  console.log('✅ Invalid secret blocked');

  // 2. Vodafone Real Message
  const msgVf = `تم استلام مبلغ 320.00 جنيه من 01205798578؛
المسجل بإسم OMAR ASHRAF ABDLTAWAB ABDLRAZIK
على رقم محفظتك 01019033661 بتاريخ 13:54 26-08-09.
رصيدك الحالي: 335.56 جنيه
رقم العملية: 022521856691
تقدر تتابع كل مصروفاتك من تاريخ المعاملات على أبلكيشن أنا فودافون http://vf.eg/vfcash`;
  
  const req2 = await createMockRequest({ message: msgVf, device: 'iphone' });
  const res2 = await POST(req2);
  const json2 = await res2.json();
  assert.strictEqual(json2.status, 'WOULD_AUTO_APPROVE');
  console.log('✅ Vodafone Real Message processed correctly (WOULD_AUTO_APPROVE)');

  // 3. InstaPay Real Message
  const msgIp = `تم إضافة تحويل لحظي لبطاقتكم مسبقة الدفع بمبلغ 550.00 جم من محمد لطفى مفيد رجب رقم مرجعي 448940145821 يوم 08-12 الساعة 10:38 للمزيد اتصل بـ 19623`;
  const req3 = await createMockRequest({ message: msgIp, device: 'iphone' });
  const res3 = await POST(req3);
  const json3 = await res3.json();
  assert.strictEqual(json3.status, 'WOULD_AUTO_APPROVE');
  console.log('✅ InstaPay Real Message processed correctly (WOULD_AUTO_APPROVE)');

  // 4. Duplicate Transaction
  const req4 = await createMockRequest({ message: msgIp, device: 'iphone' }); // Same reference
  const res4 = await POST(req4);
  const json4 = await res4.json();
  assert.strictEqual(json4.status, 'DUPLICATE');
  console.log('✅ Duplicate transaction blocked correctly');

  // 5. Unsupported / Invalid message
  const req5 = await createMockRequest({ message: 'Hello this is spam', device: 'iphone' });
  const res5 = await POST(req5);
  const json5 = await res5.json();
  assert.strictEqual(res5.status, 400); // INVALID_MESSAGE
  assert.strictEqual(json5.status, 'INVALID_MESSAGE');
  console.log('✅ Unsupported message blocked correctly');

  // Clean up
  await db.delete(orders).where(eq(orders.userId, user.id));
  await db.delete(paymentTransactions).where(eq(paymentTransactions.transactionId, '022521856691'));
  await db.delete(paymentTransactions).where(eq(paymentTransactions.transactionId, '448940145821'));

  console.log('All Webhook Phase 6 tests passed successfully! 🎉');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
