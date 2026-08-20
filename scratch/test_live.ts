async function testLiveWebhookWithRealSms() {
  try {
    const vfSms = `تم استلام مبلغ 320.00 جنيه من 01205798578؛
المسجل بإسم OMAR ASHRAF ABDLTAWAB ABDLRAZIK
على رقم محفظتك 01019033661 بتاريخ 13:54 26-08-09.
رصيدك الحالي: 335.56 جنيه
رقم العملية: 999921856691
تقدر تتابع كل مصروفاتك من تاريخ المعاملات على أبلكيشن أنا فودافون http://vf.eg/vfcash`;

    const res = await fetch('https://growix.belalkaram.dev/api/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer my_super_secret_token_2026'
      },
      body: JSON.stringify({
        message: vfSms,
        device: 'iphone'
      })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

testLiveWebhookWithRealSms();
