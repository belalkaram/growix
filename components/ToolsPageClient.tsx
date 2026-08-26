'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  Video, 
  ArrowLeft, 
  Check, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  HelpCircle,
  X,
  ExternalLink,
  Facebook,
  MessageSquare,
  Send,
  Instagram,
  TrendingUp,
  Palette,
  Film,
  Database,
  Wand2,
  Languages
} from 'lucide-react';
import { MarketingTool, PricingPackage } from '@/config/site';

interface ToolWithSlug extends MarketingTool {
  slug?: string;
}

interface ToolsPageClientProps {
  tools: ToolWithSlug[];
  packages?: PricingPackage[];
}

export const ToolsPageClient: React.FC<ToolsPageClientProps> = ({ tools, packages }) => {
  const vipPkg = packages?.find((p) => p.id === 'bundle-vip');
  const vipPrice = vipPkg?.discountedPrice || '500';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'جميع الأدوات', icon: Layers },
    { id: 'messaging', label: 'المراسلات الجماعية', icon: MessageSquare },
    { id: 'social', label: 'السوشيال ميديا', icon: TrendingUp },
    { id: 'data', label: 'سحب وتوليد الداتا', icon: Database },
    { id: 'design', label: 'التصميم والمونتاج', icon: Palette },
    { id: 'ai', label: 'الذكاء الاصطناعي', icon: Wand2 },
  ];

  const categoryLabels: Record<string, string> = {
    messaging: 'أدوات المراسلة والإرسال الجماعي',
    social: 'أدوات السوشيال ميديا والأتمتة',
    data: 'أدوات سحب الداتا وتوليد العملاء',
    design: 'أدوات التصميم والمونتاج',
    ai: 'أدوات الذكاء الاصطناعي',
  };

  const renderToolIcon = (iconName: string) => {
    const iconClass = "w-6 h-6 text-white";
    switch (iconName) {
      case 'facebook': return <Facebook className={iconClass} />;
      case 'message-square': return <MessageSquare className={iconClass} />;
      case 'send': return <Send className={iconClass} />;
      case 'instagram': return <Instagram className={iconClass} />;
      case 'video': return <Video className={iconClass} />;
      case 'trending-up': return <TrendingUp className={iconClass} />;
      case 'palette': return <Palette className={iconClass} />;
      case 'film': return <Film className={iconClass} />;
      case 'database': return <Database className={iconClass} />;
      case 'wand2': return <Wand2 className={iconClass} />;
      case 'languages': return <Languages className={iconClass} />;
      default: return <Sparkles className={iconClass} />;
    }
  };

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        tool.name.toLowerCase().includes(q) ||
        tool.shortDesc.toLowerCase().includes(q) ||
        (tool.features && tool.features.some(f => f.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [tools, selectedCategory, searchQuery]);

  return (
    <div className="space-y-16">
      
      {/* 📊 Top Feature Stats Counters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-lg text-[#0B1220]">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black block text-[#0B1220]">12 أداة</span>
              <span className="text-xs text-gray-500 font-bold">تسويق متكاملة</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black block text-[#0B1220]">5 فئات</span>
              <span className="text-xs text-gray-500 font-bold">لجميع منصات العمل</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black block text-[#0B1220]">مدى الحياة</span>
              <span className="text-xs text-gray-500 font-bold">تحديثات مجانية مستمرة</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black block text-[#0B1220]">دعم مباشر</span>
              <span className="text-xs text-gray-500 font-bold">24/7 عبر الواتساب</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Search & Category Filters Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          {/* Search Input and Results Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث عن أداة معينة، ميزة، منصة (واتساب، فيسبوك، داتا...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-11 pl-10 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-bold text-[#0B1220] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <span className="text-xs font-extrabold text-gray-600 bg-gray-100 px-3.5 py-2.5 rounded-xl self-start sm:self-center shrink-0">
              المعروض: {filteredTools.length} من {tools.length} أداة
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = cat.id === 'all' 
                ? tools.length 
                : tools.filter(t => t.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B1220] text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 🛠️ Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-[#0B1220]">لا توجد نتائج مطابقة لبحثك</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              لم نعثر على أي أدوات تطابق &quot;{searchQuery}&quot;. جرب البحث بكلمات أخرى أو اختر فئة مختلفة.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-6 py-2.5 rounded-xl bg-[#0F9D58] text-white text-xs font-bold shadow-md hover:bg-[#0D8B4E] transition-colors cursor-pointer"
            >
              عرض جميع الأدوات الـ 12
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="group bg-white rounded-3xl p-6 border border-gray-200 hover:border-[#0F9D58] hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  {/* Top Bar: Number & Category Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-mono font-black text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                      #{tool.number}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {tool.badge && (
                        <span className="text-[11px] font-black px-2.5 py-0.5 bg-[#0F9D58] text-white rounded-full">
                          {tool.badge}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                        {categoryLabels[tool.category] || tool.category}
                      </span>
                    </div>
                  </div>

                  {/* Tool Icon & Title */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F9D58] to-[#2ECC8F] flex items-center justify-center shrink-0 shadow-md shadow-[#0F9D58]/20 group-hover:scale-105 transition-transform">
                      {renderToolIcon(tool.iconName || (tool as any).icon)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-[#0B1220] text-base group-hover:text-[#0F9D58] transition-colors leading-snug">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {tool.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* Key Features List */}
                  {tool.features && tool.features.length > 0 && (
                    <div className="space-y-1.5 my-4 pt-3 border-t border-gray-100">
                      {tool.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                          <Check className="w-3.5 h-3.5 text-[#0F9D58] shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Bottom CTA Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  {tool.slug ? (
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="text-xs font-black text-[#0F9D58] hover:text-[#0D8B4E] flex items-center gap-1.5 transition-transform hover:-translate-x-1"
                    >
                      <span>شرح وتفاصيل الأداة</span>
                      <span>←</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">متاحة فوراً</span>
                  )}

                  <Link
                    href={`/checkout?package=single-tool&tool=${tool.id}`}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-[#0F9D58] text-gray-800 hover:text-white text-xs font-black transition-colors"
                  >
                    شراء هذه الأداة
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 🚀 Bottom VIP Promotion Banner */}
      <section className="bg-[#0B1220] text-white rounded-3xl p-8 sm:p-12 text-center max-w-6xl mx-auto px-4 relative overflow-hidden border border-gray-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0F9D58]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2ECC8F]/10 text-[#2ECC8F] border border-[#2ECC8F]/30 text-xs font-black">
            <Sparkles className="w-4 h-4" />
            <span>عرض التوفير الأكبر</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white">
            احصل على الـ <span className="text-[#2ECC8F]">12 أداة كاملة</span> بسعر {vipPrice} جنيه فقط
          </h2>

          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            بدلاً من شراء كل أداة بمفردها، احصل على الباقة الشاملة VIP متضمنة كورس التسويق التطبيقي وهدية داتا مصر مع تفعيل فوري وتحديثات مدى الحياة.
          </p>

          <div className="pt-3">
            <a
              href="/checkout?package=bundle-vip"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#0F9D58]/30 hover:scale-105 transition-transform"
            >
              <span>اشترك في باقة VIP واستلم الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
