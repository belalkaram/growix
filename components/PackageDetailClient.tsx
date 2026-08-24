'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PricingPackage, 
  MarketingTool, 
  SITE_CONFIG, 
  FAQItem 
} from '@/config/site';
import { CustomToolSelector } from '@/components/CustomToolSelector';
import { 
  Check, 
  X, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Zap, 
  FolderOpen, 
  Wrench, 
  Database, 
  Crown, 
  Video, 
  HelpCircle, 
  MessageSquare, 
  ChevronRight, 
  ChevronDown, 
  TrendingUp, 
  Lock, 
  CheckCircle2, 
  Flame, 
  Layers, 
  Send,
  Download
} from 'lucide-react';

interface PackageDetailClientProps {
  packageData: PricingPackage;
  allPackages: PricingPackage[];
  tools: MarketingTool[];
}

export const PackageDetailClient: React.FC<PackageDetailClientProps> = ({
  packageData,
  allPackages,
  tools,
}) => {
  const router = useRouter();
  const [selectedToolId, setSelectedToolId] = useState<string>(tools[0]?.id || 'facebook-bot');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const origPriceNum = parseInt(packageData.originalPrice.replace(/[^0-9]/g, '')) || 0;
  const discPriceNum = parseInt(packageData.discountedPrice.replace(/[^0-9]/g, '')) || 0;
  const savings = Math.max(0, origPriceNum - discPriceNum);
  const savingsPercent = origPriceNum > 0 ? Math.round((savings / origPriceNum) * 100) : 0;

  const isVip = packageData.id === 'bundle-vip';
  const isPremium = packageData.id === 'bundle-premium';
  const isSingle = packageData.id === 'single-tool';

  // Selected tool details for single tool package
  const activeTool = tools.find((t) => t.id === selectedToolId) || tools[0];

  // Checkout URL
  const checkoutUrl = isSingle 
    ? `/checkout?package=${packageData.id}&tool=${selectedToolId}`
    : `/checkout?package=${packageData.id}`;

  const otherPackages = allPackages.filter((p) => p.id !== packageData.id);

  return (
    <div className="space-y-16 py-8 text-[#0B1220] dir-rtl">
      
      {/* ─── 1. BREADCRUMBS ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Link href="/" className="hover:text-[#0F9D58] transition-colors">الرئيسية</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 rotate-180" />
          <Link href="/pricing" className="hover:text-[#0F9D58] transition-colors">الباقات والأسعار</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 rotate-180" />
          <span className="text-[#0F9D58] font-black">{packageData.name}</span>
        </nav>
      </div>

      {/* ─── 2. HERO SHOWCASE SECTION ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-2xl transition-all ${
          isVip 
            ? 'bg-gradient-to-br from-[#0B1220] via-[#0D192E] to-[#0B1220] text-white border-2 border-[#2ECC8F] ring-4 ring-[#2ECC8F]/10' 
            : isPremium
            ? 'bg-gradient-to-br from-emerald-950 via-[#0B1220] to-[#0B1220] text-white border-2 border-[#0F9D58]/40'
            : 'bg-[#0B1220] text-white border border-white/10'
        }`}>
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0F9D58]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#2ECC8F]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Col (Text & Badges) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                {packageData.badge && (
                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md ${
                    isVip 
                      ? 'bg-gradient-to-l from-amber-500 to-yellow-400 text-[#0B1220]'
                      : 'bg-[#0F9D58] text-white'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{packageData.badge}</span>
                  </span>
                )}
                
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/10 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#2ECC8F]" />
                  <span>تفعيل فوري مدى الحياة</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {packageData.name}
              </h1>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl font-medium">
                {packageData.description}
              </p>

              {/* Quick Feature Ticks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {packageData.features.map((feat, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-start gap-2 text-xs font-bold ${
                      feat.included ? 'text-gray-200' : 'text-gray-500 line-through'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      feat.included ? 'bg-[#0F9D58]/20 text-[#2ECC8F]' : 'bg-white/5 text-gray-600'
                    }`}>
                      {feat.included ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}
                    </div>
                    <span>{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col (Price & Checkout Card) */}
            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-xl text-center">
              
              <div className="space-y-2">
                <span className="text-xs text-gray-400 font-bold block">سعر الاشتراك لمرة واحدة فقط</span>
                <div className="flex items-baseline justify-center gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {packageData.discountedPrice}
                  </span>
                  <span className="text-sm font-bold text-gray-400">جنية مصري</span>
                  {packageData.originalPrice && (
                    <span className="text-base sm:text-lg text-gray-500 line-through">
                      {packageData.originalPrice} ج
                    </span>
                  )}
                </div>

                {savings > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-[#2ECC8F] border border-emerald-500/30 text-xs font-black">
                    <Flame className="w-3.5 h-3.5 text-[#2ECC8F]" />
                    <span>وفرت {savings} ج (خصم {savingsPercent}%)</span>
                  </div>
                )}
              </div>

              {/* If Single Tool Package, render Tool Picker */}
              {isSingle && (
                <div className="text-right">
                  <CustomToolSelector
                    id="package-detail-single-tool-selector"
                    selectedToolId={selectedToolId}
                    onSelectTool={(id) => setSelectedToolId(id)}
                    label="اختر البرنامج الذي ترغب في شرائه:"
                  />
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Link
                  href={checkoutUrl}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] hover:opacity-95 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-[#0F9D58]/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>اشترك الآن وأكد طلبك</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(`مرحباً، أستفسر عن ${packageData.name} على موقع GROWIX`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-[#2ECC8F]" />
                  <span>تحدث مع خدمة العملاء على واتساب</span>
                </a>
              </div>

              <div className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5 pt-2 border-t border-white/10">
                <ShieldCheck className="w-4 h-4 text-[#2ECC8F]" />
                <span>ضمان تفعيل آمن 100% خلال ساعة</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. WHAT'S INCLUDED DETAILED BREAKDOWN ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F9D58]/10 text-[#0F9D58] text-xs font-black">
            <Layers className="w-3.5 h-3.5" />
            <span>محتويات ومكونات الباقة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220]">
            ما الذي ستحصل عليه <span className="text-growix-gradient">بالتفصيل؟</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            استعراض شامل ودقيق لجميع الأدوات والمحتوى والخدمات المشمولة في هذه الباقة.
          </p>
        </div>

        {/* ── SECTION A: MARKETING TOOLS ── */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center font-bold">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-gray-900">
                  1. البرامج والأدوات التسويقية الذكية
                </h3>
                <p className="text-xs text-gray-500">
                  {isSingle 
                    ? `برنامجك المختار: ${activeTool.name}`
                    : 'ترسانة الـ 12 أداة تسويقية كاملة بجميع التراخيص والمميزات'}
                </p>
              </div>
            </div>

            <span className="text-xs font-black bg-emerald-50 text-[#0F9D58] px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
              {isSingle ? 'أداة واحدة من اختيارك' : '12 أداة تسويق كاملة'}
            </span>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isSingle ? [activeTool] : tools).map((tool, idx) => (
              <div 
                key={tool.id}
                className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-200/70 hover:border-[#0F9D58] transition-all space-y-3 shadow-2xs hover:shadow-sm group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#0F9D58]/10 text-[#0F9D58] text-[11px] font-black flex items-center justify-center shrink-0">
                      #{tool.number}
                    </span>
                    <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-[#0F9D58] transition-colors line-clamp-1">
                      {tool.name}
                    </h4>
                  </div>
                  {tool.badge && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0B1220] text-white shrink-0">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {tool.shortDesc}
                </p>

                <div className="space-y-1.5 pt-1 border-t border-gray-200/50">
                  {tool.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-gray-700 font-medium">
                      <Check className="w-3 h-3 text-[#0F9D58] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION B: MEGA CLOUD COURSES ── */}
        <div className={`border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm ${
          isVip 
            ? 'bg-gradient-to-l from-blue-50/80 via-indigo-50/40 to-white border-blue-200/80' 
            : 'bg-gray-50 border-gray-200/80 opacity-90'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/60 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                isVip ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-gray-200 text-gray-500'
              }`}>
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-gray-900">
                  2. كورسات التسويق الإلكتروني الشاملة السحابية (+1 TB)
                </h3>
                <p className="text-xs text-gray-500">
                  {isVip 
                    ? 'أكثر من 1000 جيجابايت كورسات متقدمة في جميع مجالات الميديا باينج والتسويق'
                    : 'غير مشمولة في هذه الباقة (متاحة حصرياً في باقة VIP الشاملة)'}
                </p>
              </div>
            </div>

            <span className={`text-xs font-black px-3 py-1 rounded-full border self-start sm:self-auto ${
              isVip 
                ? 'bg-blue-100 text-blue-700 border-blue-200' 
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              {isVip ? 'مشمولة بالكامل (+1 TB)' : 'متاحة مع باقة VIP فقط'}
            </span>
          </div>

          {isVip ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                { title: 'كورس إعلانات فيسبوك وانستجرام المتقدمة', count: '50+ درس عملي' },
                { title: 'كورس إعلانات جوجل واليوتيوب (Google Ads)', count: 'احتراف البحث والشبكة' },
                { title: 'كورس إعلانات تيك توك وسناب شات الممولة', count: 'أسرار استهداف الخليج ومصر' },
                { title: 'كورس كتابة النصوص الإعلانية (Copywriting)', count: 'صناعة الإعلانات المقنعة' },
                { title: 'كورس بناء المتاجر والفانل (Sales Funnels)', count: 'مضاعفة المبيعات تلقائياً' },
                { title: 'كورس أتمتة الرسائل والبوتات (Chatbots)', count: 'الرد الفوري على آلاف العملاء' },
              ].map((c, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-blue-100 space-y-1 shadow-2xs">
                  <span className="font-black text-gray-900 block">{c.title}</span>
                  <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    <span>{c.count}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-black text-xs sm:text-sm text-amber-950 block">
                  هل تريد الحصول على الكورسات كاملة أيضاً؟
                </span>
                <p className="text-xs text-amber-900">
                  يمكنك الترقية إلى **باقة VIP الشاملة** بسعر 500 ج فقط والحصول على مكتبة الكورسات الكاملة (+1 TB) مع جميع الأدوات.
                </p>
              </div>
              <Link
                href="/packages/bundle-vip"
                className="px-5 py-2.5 rounded-xl bg-[#0B1220] hover:bg-[#1a263d] text-white text-xs font-black shrink-0 transition-colors flex items-center gap-1.5 shadow-md"
              >
                <span>استعراض باقة VIP (500 ج)</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* ── SECTION C: EGYPT DATA BONUS ── */}
        <div className="bg-gradient-to-l from-emerald-50/80 via-teal-50/40 to-white border border-emerald-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0F9D58] text-white flex items-center justify-center font-bold shadow-md shadow-[#0F9D58]/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-gray-900">
                  3. هدية مجانية: قاعدة بيانات داتا مصر التسويقية (150+ مليون)
                </h3>
                <p className="text-xs text-gray-500">
                  مقسمة ومفلترة حسب جميع المحافظات والأنشطة التجارية جاهزة للاستهداف الفوري
                </p>
              </div>
            </div>

            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
              هدية مجانية مع الباقة
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { label: 'داتا المحافظات', desc: 'القاهرة، الجيزة، الإسكندرية، الدلتا، والصعيد' },
              { label: 'داتا الأنشطة والمحلات', desc: 'ملابس، مطاعم، سيارات، عيادات، شركات' },
              { label: 'داتا VIP والقوة الشرائية', desc: 'أطباء، مهندسين، رجال أعمال، مهتمين بالعقارات' },
              { label: 'جاهزة للواتساب وتليجرام', desc: 'ملفات Excel مرتبة وجاهزة للرفع المباشر' },
            ].map((d, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-1 shadow-2xs">
                <span className="font-black text-emerald-950 block">{d.label}</span>
                <span className="text-[11px] text-gray-600 block">{d.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ─── 4. UPGRADE / DOWNGRADE & SWITCH MATRIX ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B1220] text-white text-xs font-black">
            <TrendingUp className="w-3.5 h-3.5 text-[#2ECC8F]" />
            <span>خيارات الترقية والتبديل</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220]">
            قارن أو <span className="text-growix-gradient">قم بالترقية</span> لباقة أخرى
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            يمكنك الانتقال فوراً لأي من باقاتنا الأخرى حسب ميزانيتك واحتياجات عملك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherPackages.map((otherPkg) => {
            const isOtherVip = otherPkg.id === 'bundle-vip';

            return (
              <div
                key={otherPkg.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 border transition-all ${
                  isOtherVip
                    ? 'bg-[#0B1220] text-white border-2 border-[#2ECC8F] shadow-xl ring-4 ring-[#2ECC8F]/10'
                    : 'bg-white text-[#0B1220] border-gray-200 shadow-sm hover:border-[#0F9D58]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${
                      isOtherVip ? 'bg-[#0F9D58] text-white' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isOtherVip ? '🚀 ترقية موصى بها (Upgrade)' : '🔄 باقة بديلة'}
                    </span>
                    <span className="text-xs font-bold text-gray-400">تفعيل مدى الحياة</span>
                  </div>

                  <div>
                    <h3 className={`text-xl font-black ${isOtherVip ? 'text-white' : 'text-gray-900'}`}>
                      {otherPkg.name}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isOtherVip ? 'text-gray-300' : 'text-gray-600'}`}>
                      {otherPkg.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-black ${isOtherVip ? 'text-white' : 'text-gray-900'}`}>
                      {otherPkg.discountedPrice}
                    </span>
                    <span className="text-xs font-bold text-gray-400">جنية مصري</span>
                    {otherPkg.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {otherPkg.originalPrice} ج
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <Link
                    href={`/packages/${otherPkg.id}`}
                    className={`w-full py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                      isOtherVip
                        ? 'bg-growix-gradient hover:bg-growix-gradient-hover text-white shadow-lg shadow-[#0F9D58]/30'
                        : 'bg-[#0B1220] hover:bg-[#1a263d] text-white'
                    }`}
                  >
                    <span>استعراض تفاصيل {otherPkg.name}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ─── 5. PACKAGE FAQ SECTION ─── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-[#0B1220]">
            الأسئلة الشائعة حول <span className="text-growix-gradient">{packageData.name}</span>
          </h2>
          <p className="text-xs text-gray-600">إجابات واضحة ومباشرة لأكثر الأسئلة تكراراً</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'كيف يتم تفعيل الباقة واستلام البرامج بعد الدفع؟',
              a: 'بمجرد تأكيد طلبك في صفحة الشيك أوت وإرفاق إيصال التحويل، يقوم فريق الدعم الفني بتفعيل حسابك فوراً وإرسال روابط الوصول المباشرة إلى البرامج والكورسات والداتا على واتساب خلال أقل من 60 دقيقة.'
            },
            {
              q: 'هل البرامج والأدوات تعمل مدى الحياة بدون اشتراك شهري؟',
              a: 'نعم تماماً! الاشتراك يُدفع لمرة واحدة فقط مدى الحياة (Lifetime License)، وبدون أي مصاريف شهرية أو تجديدات سنوية إضافية نهائياً.'
            },
            {
              q: 'هل يتوفر دعم فني ومساعدة في التثبيت؟',
              a: 'نعم، يتوفر فريق دعم فني متخصص على مدار 24/7 عبر الواتساب للمساعدة في تثبيت وتشغيل الأدوات والإجابة عن أي استفسار خطوة بخطوة.'
            },
            {
              q: 'هل يمكنني ترقية باقتي لاحقاً؟',
              a: 'نعم بكل سهولة! يمكنك الترقية في أي وقت من باقة أداة واحدة أو Premium إلى باقة VIP الشاملة مع دفع فارق السعر فقط.'
            }
          ].map((faq, fIdx) => {
            const isOpen = openFaqIndex === fIdx;

            return (
              <div 
                key={fIdx}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                  className="w-full p-4 sm:p-5 text-right font-bold text-xs sm:text-sm text-[#0B1220] flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0F9D58]/10 text-[#0F9D58] text-xs font-black flex items-center justify-center shrink-0">
                      ؟
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-[#0F9D58]' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
