/**
 * lib/turnstile.ts
 * Server-side verification for Cloudflare Turnstile "I am human" CAPTCHA tokens.
 */

export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || '';

  if (!token) {
    return { success: false, error: 'يرجى إكمال التحقق الأمني (أنا لست روبوت)' };
  }

  // Handle Cloudflare official dummy testing keys strictly in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    if (token.startsWith('1x000000') || token.startsWith('2x000000') || token === 'XXXX.DUMMY.TOKEN.XXXX') {
      return { success: true };
    }
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json();

    if (data.success) {
      return { success: true };
    } else {
      console.error('Turnstile verification failed:', data['error-codes']);
      return {
        success: false,
        error: 'فشل إثبات أنك إنسان (Cloudflare CAPTCHA). يرجى المحاولة مرة أخرى.',
      };
    }
  } catch (error: any) {
    console.error('Turnstile fetch error:', error);
    if (process.env.NODE_ENV !== 'production') {
      return { success: true };
    }
    return {
      success: false,
      error: 'تعذر التحقق من اختبار الأمان في الوقت الحالي. يرجى إعادة المحاولة.',
    };
  }
}
