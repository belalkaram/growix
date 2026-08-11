import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserOrders } from '@/lib/actions/orders';
import { getUserDownloadableFilesAction } from '@/lib/actions/files';
import { MyOrdersPageClient } from './MyOrdersPageClient';

export default async function MyOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/my-orders');
  }

  const ordersList = await getUserOrders();

  const ordersWithFiles = await Promise.all(
    ordersList.map(async (ord) => {
      if (ord.status === 'approved') {
        const filesRes = await getUserDownloadableFilesAction(ord.id);
        return {
          ...ord,
          files: filesRes.files || [],
        };
      }
      return { ...ord, files: [] };
    })
  );

  const userSession = {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: (session.user as { role?: string }).role || 'user',
    },
  };

  return <MyOrdersPageClient orders={ordersWithFiles} userSession={userSession} />;
}
