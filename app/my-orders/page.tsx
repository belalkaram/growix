import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserOrders } from '@/lib/actions/orders';
import { MyOrdersPageClient } from './MyOrdersPageClient';

export default async function MyOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/my-orders');
  }

  const orders = await getUserOrders();

  const userSession = {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: (session.user as { role?: string }).role || 'user',
    },
  };

  return <MyOrdersPageClient orders={orders} userSession={userSession} />;
}
