import { NextResponse } from 'next/server';
import { getVapidCredentials } from '@/lib/push';

export async function GET() {
  try {
    const { publicKey, configured } = await getVapidCredentials();
    if (!configured || !publicKey) {
      return NextResponse.json(
        { success: false, error: 'Web Push (VAPID) is not configured' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      publicKey,
    });
  } catch (err: any) {
    console.error('Error in GET /api/push/public-key:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve public key' },
      { status: 500 }
    );
  }
}
