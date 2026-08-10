'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG, MarketingTool } from '@/config/site';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { 
  Wrench, 
  ChevronDown, 
  Check, 
  Search, 
  X, 
  Sparkles, 
  Facebook, 
  MessageSquare, 
  Send, 
  Instagram, 
  Video, 
  TrendingUp, 
  Palette, 
  Film, 
  Database, 
  Wand2, 
  Languages 
} from 'lucide-react';

interface CustomToolSelectorProps {
  selectedToolId: string;
  onSelectTool: (toolId: string) => void;
  label?: string;
  id?: string;
}

export const CustomToolSelector: React.FC<CustomToolSelectorProps> = ({
  selectedToolId,
  onSelectTool,
  label = 'حدد البرنامج المطلوب من الـ 12 أداة المتاحة:',
  id = 'custom-tool-selector',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling on mobile when modal is open
  useBodyScrollLock(isOpen);

  // Find currently selected tool
  const currentTool = SITE_CONFIG.tools.find((t) => t.id === selectedToolId) || SITE_CONFIG.tools[0];

  // Helper to render matching icon
  const renderToolIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'facebook': return <Facebook className={className} />;
      case 'message-square': return <MessageSquare className={className} />;
      case 'send': return <Send className={className} />;
      case 'instagram': return <Instagram className={className} />;
      case 'video': return <Video className={className} />;
      case 'trending-up': return <TrendingUp className={className} />;
      case 'palette': return <Palette className={className} />;
      case 'film': return <Film className={className} />;
      case 'sparkles': return <Sparkles className={className} />;
      case 'database': return <Database className={className} />;
      case 'wand2': return <Wand2 className={className} />;
      case 'languages': return <Languages className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  // Filter tools by search query
  const filteredTools = SITE_CONFIG.tools.filter((t) => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.badge && t.badge.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelect = (toolId: string) => {
    onSelectTool(toolId);
    setIsOpen(false);
  };

  return (
    <div className="w-full relative">
      {/* Label Header */}
      <div className="flex items-center justify-between mb-2">
        <label 
          htmlFor={id} 
          className="block text-xs sm:text-sm font-extrabold text-[#0B1220] flex items-center gap-1.5 cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Wrench className="w-4 h-4 text-[#0F9D58]" />
          <span>{label}</span>
        </label>
        <span className="text-[11px] bg-[#0F9D58] text-white px-2.5 py-0.5 rounded-full font-extrabold shadow-xs">
          12 أداة متاحة
        </span>
      </div>

      {/* Main Trigger Button (High visual quality) */}
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="افتخ قائمة اختيار البرامج الـ 12"
        onClick={() => setIsOpen(true)}
        className="w-full bg-white border-2 border-emerald-300 hover:border-[#0F9D58] rounded-2xl p-3.5 sm:p-4 text-right flex items-center justify-between gap-3 shadow-md hover:shadow-lg transition-all duration-200 group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#0B1220] text-[#2ECC8F] group-hover:bg-[#0F9D58] group-hover:text-white flex items-center justify-center shrink-0 shadow-sm transition-colors">
            {renderToolIcon(currentTool.iconName)}
          </div>
          <div className="min-w-0 text-right">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-mono font-extrabold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                #{currentTool.number}
              </span>
              {currentTool.badge && (
                <span className="text-[10px] font-extrabold bg-[#0F9D58] text-white px-2 py-0.5 rounded-full">
                  {currentTool.badge}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-black text-[#0B1220] truncate block leading-tight">
              {currentTool.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-[#0F9D58] group-hover:translate-y-0.5 transition-transform">
          <span className="text-xs font-bold text-gray-500 hidden sm:inline">تغيير</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Modern Pop-up Modal (النافذة المنبثقة الاحترافية) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#0B1220]/75 backdrop-blur-md">
            {/* Modal Overlay backdrop click */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0"
            />

            {/* Modal Card Box */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] z-10"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-[#0B1220] text-white flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0F9D58] text-white flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      اختر برنامجك المفضل
                    </h3>
                    <p className="text-xs text-gray-300">
                      متاح 12 برنامج تسويقي احترافي — اختر واحداً للتفعيل الفوري
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="إغلاق النافذة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar Input inside Popup */}
              <div className="p-4 bg-[#F7F9FA] border-b border-gray-200 shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث عن أداة أو ميزة (مثل: واتساب، سحب داتا، مونتاج...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2.5 pr-10 pl-4 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 shadow-xs"
                    autoFocus
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-3 text-xs text-gray-400 hover:text-gray-600 font-bold"
                    >
                      مسح
                    </button>
                  )}
                </div>
              </div>

              {/* Tools List Grid (Scrollable inside Modal) */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3 max-h-[55vh] custom-scrollbar">
                {filteredTools.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-sm font-bold text-gray-500">لا توجد أداة تطابق بحثك &quot;{searchQuery}&quot;</p>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-black text-[#0F9D58] underline"
                    >
                      عرض جميع الـ 12 أداة
                    </button>
                  </div>
                ) : (
                  filteredTools.map((tool) => {
                    const isSelected = tool.id === selectedToolId;
                    return (
                      <div
                        key={tool.id}
                        onClick={() => handleSelect(tool.id)}
                        className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/90 border-[#0F9D58] shadow-md ring-2 ring-[#0F9D58]/20'
                            : 'bg-white border-gray-200/80 hover:border-gray-300 hover:bg-[#F7F9FA]'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Tool Icon */}
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                            isSelected 
                              ? 'bg-[#0F9D58] text-white' 
                              : 'bg-[#0B1220] text-[#2ECC8F]'
                          }`}>
                            {renderToolIcon(tool.iconName, 'w-5 h-5')}
                          </div>

                          {/* Tool Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[11px] font-mono font-extrabold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                                #{tool.number}
                              </span>
                              {tool.badge && (
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  isSelected 
                                    ? 'bg-[#0F9D58] text-white' 
                                    : 'bg-[#0F9D58]/15 text-[#086337]'
                                }`}>
                                  {tool.badge}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs sm:text-sm font-black text-[#0B1220] mb-1 leading-snug">
                              {tool.name}
                            </h4>

                            <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed line-clamp-2">
                              {tool.shortDesc}
                            </p>
                          </div>
                        </div>

                        {/* Radio Check Circle */}
                        <div className="shrink-0 pt-1">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#0F9D58] border-[#0F9D58] text-white'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#F7F9FA] border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
                <div className="text-xs font-bold text-gray-600 truncate">
                  البرنامج المختار: <span className="text-[#0F9D58] font-black">{currentTool.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 px-6 rounded-xl bg-[#0B1220] hover:bg-[#111c30] text-white font-extrabold text-xs shadow-md transition-transform hover:scale-105 shrink-0"
                >
                  تأكيد الاختيار
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
