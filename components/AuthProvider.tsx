'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { syncDevicePushSubscription } from '@/lib/push-client';

function PushDeviceSync() {
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      // Background sync device token with the user session
      syncDevicePushSubscription().catch(() => {});
    }
  }, [status]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PushDeviceSync />
      {children}
    </SessionProvider>
  );
}

