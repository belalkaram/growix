import React from 'react';
import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { SettingsEditForm } from './SettingsEditForm';
import { Settings } from 'lucide-react';

export default async function AdminSettingsPage() {
  const settingsRows = await db.select().from(siteSettings);
  const settingsMap: Record<string, string> = {};
  settingsRows.forEach((r) => {
    settingsMap[r.key] = r.value;
  });

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#2ECC8F]" />
          <span>إعدادات الموقع المباشرة</span>
        </h1>
        <p className="text-xs text-gray-400">تحديث رقم الواتساب، يوزر التليجرام، وساعات الدعم فوراً دون التعديل في الكود</p>
      </div>

      <SettingsEditForm initialSettings={settingsMap} />
    </div>
  );
}
