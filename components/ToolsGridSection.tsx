'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SITE_CONFIG, SITE_PRICING, MarketingTool, PricingPackage } from '@/config/site';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { 
  Check, 
  Sparkles, 
  ArrowLeft, 
  Video, 
  Search, 
  Info, 
  X, 
  PlayCircle,
  Facebook,
  MessageSquare,
  Send,
  Instagram,
  TrendingUp,
  Palette,
  Film,
  Database,
  Wand2,
  Languages,
  Grid
} from 'lucide-react';

interface ToolsGridSectionProps {
  tools?: MarketingTool[];
  onOpenPaymentModal?: (pkg?: PricingPackage, toolId?: string) => void;
  isHomepage?: boolean;
}

const toolSlugMap: Record<string, string> = {
  'whatsapp-sender': 'whatsapp-marketing',
  'telegram-sender': 'telegram-marketing',
  'facebook-bot': 'facebook-marketing',
  'instagram-bot': 'instagram-automation',
  'tiktok-bot': 'tiktok-automation',
  'data-scraper': 'data-scraper',
  'reach-booster': 'reach-booster',
  'canva-pro': 'canva-pro-alternative',
  'video-editor': 'ai-video-editor',
  'ai-marketing': 'ai-content-generator',
  'design-pack': 'graphics-design-pack',
  'translator-pro': 'auto-translator-pro',
};

export const ToolsGridSection: React.FC<ToolsGridSectionProps> = ({ 
  tools, 
  onOpenPaymentModal, 
  isHomepage = false 
}) => {
  const router = useRouter();
  const toolsList = tools && tools.length > 0 ? tools : SITE_CONFIG.tools;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'جميع الأدوات الـ 12' },
    { id: 'social', label: 'السوشيال ميديا' },
    { id: 'messaging', label: 'حملات المراسلات' },
    { id: 'design', label: 'التصميم والمونتاج' },
    { id: 'data', label: 'سحب الداتا' },
    { id: 'ai', label: 'الذكاء الاصطناعي' },
  ];

  const handleOpenPayment = (pkg?: PricingPackage, toolId?: string) => {
    if (onOpenPaymentModal) {
      onOpenPaymentModal(pkg, toolId);
    } else {
      let url = '/checkout';
      const params = new URLSearchParams();
      if (pkg && pkg.id) params.set('package', pkg.id);
      if (toolId) params.set('tool', toolId);
      const query = params.toString();
      if (query) url += `?${query}`;
      router.push(url);
    }
  };

  const renderToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'facebook': return <Facebook className="w-6 h-6" />;
      case 'message-square': return <MessageSquare className="w-6 h-6" />;
      case 'send': return <Send className="w-6 h-6" />;
      case 'instagram': return <Instagram className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'trending-up': return <TrendingUp className="w-6 h-6" />;
      case 'palette': return <Palette className="w-6 h-6" />;
      case 'film': return <Film className="w-6 h-6" />;
      case 'sparkles': return <Sparkles className="w-6 h-6" />;
      case 'database': return <Database className="w-6 h-6" />;
      case 'wand2': return <Wand2 className="w-6 h-6" />;
      case 'languages': return <Languages className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  const getToolSlug = (toolId: string) => {
    return toolSlugMap[toolId] || 'whatsapp-marketing';
  };

  // On homepage, display 5 featured tools
  const displayedTools = isHomepage 
    ? toolsList.slice(0, 5) 
    : toolsList.filter((tool) => {
        const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      });

  return (
    <section id="tools" className="py-24 bg-[#F7F9FA] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1220] text-[#2ECC8F] text-xs font-black shadow-sm">
            <Sparkles className="w-4 h-4 text-[#2ECC8F]" />
            <span>باقة الـ 12 أداة تسويقية المتكاملة</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1220]">
            {isHomepage ? (
              <>أقوى أدوات التسويق <span className="text-growix-gradient">لأتمتة وتكبير مبيعاتك</span></>
            ) : (
              <>12 أداة تسويق <span className="text-growix-gradient">هتغيّر شكل شغلك</span> وتضاعف مبيعاتك</>
            )}
          </h2>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            مجموعة من أقوى البرامج والتطبيقات التسويقية المصممة لأتمتة أعمالك، سحب الداتا، المونتاج، وزيادة متابعينك بدون اشتراكات شهرية.
          </p>
        </div>

        {/* Support Banner */}
        <div className="mb-10 bg-[#0B1220] text-white p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-growix-gradient flex items-center justify-center text-white shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5 flex-wrap">
                <Video className="w-4 h-4 text-[#2ECC8F] shrink-0" />
                <span>مرفق فيديو شرح طريقة الاستخدام لكل أداة + دعم فني متاح لحل أي مشكلة</span>
              </span>
              <span className="text-xs text-[#2ECC8F]">شرح صوت وصورة خطوة بخطوة باللغة العربية مع كل أداة</span>
            </div>
          </div>

          <button
            onClick={() => handleOpenPayment()}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-growix-gradient hover:bg-growix-gradient-hover text-white text-xs font-extrabold shrink-0 shadow-md transition-all hover:scale-105"
          >
            احصل على الباقة كاملة
          </button>
        </div>

        {/* Category Filters (Only on Full /tools Page) */}
        {!isHomepage && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#0B1220] text-[#2ECC8F] shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="ابحث عن أداة أو ميزة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
                className="w-full py-2.5 pr-10 pl-4 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
            </div>
          </div>
        )}

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTools.map((tool) => (
            <motion.div
              key={tool.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-6 border border-gray-200/80 hover:border-[#0F9D58] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B1220] text-[#2ECC8F] flex items-center justify-center shadow-md group-hover:bg-growix-gradient group-hover:text-white transition-colors">
                    {renderToolIcon(tool.iconName)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                      #{tool.number}
                    </span>
                    {tool.badge && (
                      <span className="text-[11px] font-extrabold px-2.5 py-1 bg-[#0F9D58] text-white rounded-full shadow-xs">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#0B1220] mb-2 group-hover:text-[#0F9D58] transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-gray-600 mb-5 leading-relaxed font-medium">
                  {tool.shortDesc}
                </p>

                <ul className="space-y-2.5 mb-6">
                  {tool.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 leading-normal">
                      <div className="w-4 h-4 rounded-full bg-[#0F9D58]/15 text-[#0F9D58] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <Link
                  href={`/tools/${getToolSlug(tool.id)}`}
                  className="text-xs font-bold text-[#0F9D58] hover:text-[#0B1220] flex items-center gap-1 py-1 transition-colors"
                >
                  <Info className="w-4 h-4" />
                  <span>تفاصيل الأداة</span>
                </Link>

                <button
                  onClick={() => handleOpenPayment(SITE_CONFIG.packages[1], tool.id)}
                  className="py-2 px-3.5 rounded-xl bg-gray-100 group-hover:bg-growix-gradient text-[#0B1220] group-hover:text-white font-bold text-xs flex items-center gap-1 transition-all shadow-sm"
                >
                  <span>شراء بـ {SITE_PRICING.singleToolPrice}ج</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Homepage Card for "Explore all 12 tools" */}
          {isHomepage && (
            <div className="bg-[#0B1220] text-white rounded-3xl p-6 border border-[#2ECC8F]/30 shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2ECC8F]/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-growix-gradient text-white flex items-center justify-center mb-4 shadow-md">
                  <Grid className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">
                  استكشف كل أدوات GROWIX الـ 12
                </h3>
                <p className="text-xs text-gray-300 mb-4 leading-relaxed font-medium">
                  مجموعات المراسلات، أتمتة السوشيال، سحب الداتا، المونتاج بالذكاء الاصطناعي، Socinator Dominator والمزيد.
                </p>
                <div className="space-y-2 text-xs text-emerald-300 font-semibold mb-6">
                  <div className="flex items-center gap-2">✓ البحث والتصفية حسب الفئة</div>
                  <div className="flex items-center gap-2">✓ صفحات مستقّلة لكل أداة وشروحاتها</div>
                </div>
              </div>

              <Link
                href="/tools"
                className="w-full py-3.5 px-5 rounded-2xl bg-growix-gradient hover:bg-growix-gradient-hover text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
              >
                <span>استعرض كل الـ 12 أداة الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Homepage Bottom CTA Button */}
        {isHomepage && (
          <div className="mt-12 text-center">
            <Link
              href="/tools"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border-2 border-[#0F9D58] text-[#0F9D58] font-extrabold text-sm sm:text-base hover:bg-[#0F9D58] hover:text-white shadow-md transition-all hover:scale-105"
            >
              <span>شاهد جميع أدوات GROWIX الـ 12 مع الفلاتر والشروحات</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};
