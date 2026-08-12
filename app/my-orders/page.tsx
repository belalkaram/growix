import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserOrders } from '@/lib/actions/orders';
import { getUserDownloadableFilesAction } from '@/lib/actions/files';
import { getVideosForOrderAction } from '@/lib/actions/videos';
import { getSiteSettingsAction } from '@/lib/actions/settings';
import { MaintenanceScreen } from '@/components/MaintenanceScreen';
import { MyOrdersPageClient } from './MyOrdersPageClient';

export default async function MyOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/my-orders');
  }

  const userRole = (session.user as { role?: string }).role || 'user';

  // Check Maintenance Mode
  const settings = await getSiteSettingsAction();
  if (settings.maintenance_mode === 'true' && userRole !== 'admin') {
    return (
      <MaintenanceScreen
        message={
          settings.maintenance_message ||
          'صفحة الطلبات والخدمات قيد الصيانة والتحديثات المباشرة. سنعود للعمل خلال دقائق!'
        }
      />
    );
  }

  const ordersList = await getUserOrders();

  const ordersWithFiles = await Promise.all(
    ordersList.map(async (ord) => {
      if (ord.status === 'approved') {
        const [filesRes, videosRes] = await Promise.all([
          getUserDownloadableFilesAction(ord.id),
          getVideosForOrderAction(ord.packageId, ord.toolId),
        ]);

        return {
          ...ord,
          files: filesRes.files || [],
          videos: videosRes.videos || [],
        };
      }
      return { ...ord, files: [], videos: [] };
    })
  );

  const userSession = {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: userRole,
    },
  };

  return <MyOrdersPageClient orders={ordersWithFiles} userSession={userSession} />;
}
