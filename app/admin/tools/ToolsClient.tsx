'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToolEditRow } from './ToolEditRow';
import { AddToolModal } from './AddToolModal';
import { Wrench, Plus, Search, Filter } from 'lucide-react';

export const ToolsClient: React.FC<{ initialTools: any[] }> = ({ initialTools }) => {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTools = initialTools.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#2ECC8F]" />
            <span>إدارة الأدوات التسويقية (Full CRUD)</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            إضافة أدوات جديدة، تعديل الأسماء والوصف والمميزات، حذف، وتفعيل/تعطيل
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00FF87]/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>إضافة أداة تسويقية جديدة</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم الأداة أو الـ Slug..."
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2ECC8F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F] cursor-pointer"
          >
            <option value="all" className="bg-[#0F172A] text-white">جميع الفئات ({initialTools.length})</option>
            <option value="social" className="bg-[#0F172A] text-white">سوشيال ميديا (Social)</option>
            <option value="messaging" className="bg-[#0F172A] text-white">رسائل ومحادثات (Messaging)</option>
            <option value="design" className="bg-[#0F172A] text-white">تصميم ومونتاج (Design)</option>
            <option value="ai" className="bg-[#0F172A] text-white">ذكاء اصطناعي (AI)</option>
            <option value="data" className="bg-[#0F172A] text-white">سحب داتا (Data)</option>
          </select>
        </div>
      </div>

      {/* Tools List */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-xl divide-y divide-white/10">
        {filteredTools.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            لا توجد أدوات مطابقة للبحث
          </div>
        ) : (
          filteredTools.map((tool) => (
            <ToolEditRow key={tool.id} tool={tool} />
          ))
        )}
      </div>

      {/* Add Tool Modal */}
      <AddToolModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onToolAdded={() => router.refresh()}
      />
    </div>
  );
};
