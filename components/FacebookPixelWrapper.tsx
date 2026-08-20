import React from 'react';
import { getSiteSettingsAction } from '@/lib/actions/settings';
import { FacebookPixel } from './FacebookPixel';

export async function FacebookPixelWrapper() {
  try {
    const settings = await getSiteSettingsAction();
    const pixelId = settings.facebook_pixel_id || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    const enabled = settings.facebook_pixel_enabled !== 'false';
    return <FacebookPixel pixelId={pixelId} enabled={enabled} />;
  } catch {
    return null;
  }
}
