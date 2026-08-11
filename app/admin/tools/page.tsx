import React from 'react';
import { db } from '@/db';
import { tools } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { ToolEditRow } from './ToolEditRow';
import { Wrench } from 'lucide-react';

export default async function AdminToolsPage() {
  const allTools = await db.select().from(tools).orderBy(asc(tools.number));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-[#2ECC8F]" />
          <span>إدارة الـ 12 أداة التسويقية</span>
        </h1>
        <p className="text-xs text-gray-400">تعديل أسماء البرامج، الوصف، الشارات، الأيقونات، وحالة تفعيل كل أداة</p>
      </div>

      <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="divide-y divide-white/10">
          {allTools.map((tool) => (
            <ToolEditRow key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}
