import React from 'react';
import { getAllPackageFilesForAdminAction } from '@/lib/actions/files';
import { AdminFilesClient } from './AdminFilesClient';

export default async function AdminFilesPage() {
  const filesList = await getAllPackageFilesForAdminAction();

  return <AdminFilesClient filesList={filesList} />;
}
