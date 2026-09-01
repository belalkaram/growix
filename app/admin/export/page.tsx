import React from 'react';
import { getQuickExportStats } from '@/lib/actions/export';
import { ExportClient } from './ExportClient';

export const dynamic = 'force-dynamic';

export default async function AdminExportPage() {
  const stats = await getQuickExportStats();

  return <ExportClient stats={stats} />;
}
