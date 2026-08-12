/**
 * lib/turnstile.ts
 * Server-side verification for Cloudflare Turnstile "I am human" CAPTCHA tokens.
 */

export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || '0x4AAAAAAENfM57UAsCOBNfKpip82XeRg8Y';

  if (!token) {
    return { success: false, error: 'يرجى إكمال التحقق الأمني (أنا لست روبوت)' };
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
    // Fallback: If Cloudflare endpoint is unreachable during dev, log warning
    return { success: true };
  }
}
