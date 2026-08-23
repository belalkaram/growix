'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { SITE_CONFIG, PricingPackage, MarketingTool } from '@/config/site';
import { CustomToolSelector } from '@/components/CustomToolSelector';
import { Check, X as XIcon, Sparkles, ArrowLeft, ShieldCheck, Clock, Zap } from 'lucide-react';

interface PricingSectionProps {
  packages?: PricingPackage[];
  tools?: MarketingTool[];
  onSelectPackage?: (pkg: PricingPackage, toolId?: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ packages, tools, onSelectPackage }) => {
  const router = useRouter();
  const packageList = packages && packages.length > 0 ? packages : SITE_CONFIG.packages;
  const initialToolId = tools && tools.length > 0 ? tools[0].id : SITE_CONFIG.tools[0].id;
  const [selectedToolId, setSelectedToolId] = React.useState<string>(initialToolId);

  const handleSelectPackage = (pkg: PricingPackage, toolId?: string) => {
    if (onSelectPackage) {
      onSelectPackage(pkg, toolId);
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

  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      {/* Subtle Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-[#0F9D58]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F9D58]/10 text-[#0F9D58] text-xs font-black">
            <Zap className="w-4 h-4" />
            <span>اختر خطة الاشتراك المناسبة لك</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1220]">
            باقات <span className="text-growix-gradient">GROWIX المتاحة</span>
          </h2>

          <p className="text-gray-600 text-base sm:text-lg">
            اختر من بين 3 باقات مصممة لكل الاحتياجات: باقة VIP الشاملة بالكورسات، أو Premium بالأدوات، أو باقة برنامج واحد.
          </p>
        </div>

        {/* 3 Pricing Cards Grid (Side by side on medium and large screens) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8 max-w-7xl mx-auto items-stretch">
          {packageList.map((pkg) => {
            const isPopular = pkg.isPopular;
            const origNum = parseInt(pkg.originalPrice) || 0;
            const discNum = parseInt(pkg.discountedPrice) || 0;
            const savings = origNum - discNum;
            const savingsPercent = origNum > 0 ? Math.round((savings / origNum) * 100) : 0;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  isPopular
                    ? 'bg-[#0B1220] text-white border-2 border-[#2ECC8F] shadow-2xl z-10 glow-navy ring-4 ring-[#2ECC8F]/10 scale-[1.02]'
                    : pkg.id === 'bundle-premium'
                    ? 'bg-gradient-to-b from-[#F0FDF6] to-white text-[#0B1220] border-2 border-[#0F9D58]/30 hover:border-[#0F9D58] hover:shadow-xl'
                    : 'bg-[#F7F9FA] text-[#0B1220] border border-gray-200 hover:border-[#0F9D58] hover:shadow-xl'
                }`}
              >
                {/* Popular Badge Floating Top */}
                {pkg.badge && (
                  <div className={`absolute -top-4 right-1/2 translate-x-1/2 text-xs font-black px-4 py-1.5 rounded-full shadow-lg border whitespace-nowrap flex items-center gap-1.5 ${
                    pkg.id === 'bundle-vip'
                      ? 'bg-gradient-to-l from-amber-500 to-yellow-400 text-[#0B1220] border-amber-300/30'
                      : pkg.id === 'bundle-premium'
                      ? 'bg-growix-gradient text-white border-white/20'
                      : 'bg-gray-700 text-white border-white/10'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{pkg.badge}</span>
                  </div>
                )}

                <div>
                  {/* Package Title & Social Proof Tag */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`text-2xl font-black ${isPopular ? 'text-white' : 'text-[#0B1220]'}`}>
                        {pkg.name}
                      </h3>
                      {pkg.id === 'bundle-vip' && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#2ECC8F]/20 text-[#2ECC8F] border border-[#2ECC8F]/30">
                          🔥 الأكثر طلباً (+250)
                        </span>
                      )}
                      {pkg.id === 'bundle-premium' && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#0F9D58]/10 text-[#0F9D58] border border-[#0F9D58]/20">
                          ⚡ قيمة ممتازة
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isPopular ? 'text-gray-300' : 'text-gray-500'}`}>
                      {pkg.description}
                    </p>
                  </div>

                  {/* Pricing Box & Savings Badge */}
                  <div className={`my-5 p-4 rounded-2xl border flex flex-col gap-2 ${
                    isPopular 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-emerald-50/50 border-emerald-100'
                  }`}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-growix-gradient">{pkg.discountedPrice}</span>
                      <span className={`text-sm font-bold ${isPopular ? 'text-gray-200' : 'text-gray-700'}`}>{pkg.currency}</span>
                      <span className={`text-xs line-through mr-auto ${isPopular ? 'text-gray-400' : 'text-gray-400'}`}>
                        {pkg.originalPrice} {pkg.currency}
                      </span>
                    </div>

                    {savings > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
                        <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                          isPopular 
                            ? 'bg-[#2ECC8F]/20 text-[#2ECC8F]' 
                            : 'bg-[#0F9D58]/10 text-[#0F9D58]'
                        }`}>
                          وفرت {savings} {pkg.currency} ({savingsPercent}% خصم)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={`text-xs font-semibold mb-6 flex items-center gap-1.5 ${isPopular ? 'text-[#2ECC8F]' : 'text-[#0F9D58]'}`}>
                    <Clock className="w-4 h-4" />
                    <span>{pkg.period}</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed">
                        {feat.included ? (
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isPopular ? 'bg-[#2ECC8F] text-[#0B1220]' : 'bg-[#0F9D58] text-white'
                          }`}>
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center shrink-0 mt-0.5">
                            <XIcon className="w-3 h-3" />
                          </div>
                        )}

                        <span className={`font-semibold ${
                          !feat.included
                            ? 'line-through text-gray-400'
                            : feat.highlight
                            ? isPopular ? 'text-[#2ECC8F] font-bold' : 'text-[#0F9D58] font-bold'
                            : isPopular ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Custom Tool Selector for Single Tool Package */}
                  {pkg.id === 'single-tool' && (
                    <div className="mb-6">
                      <CustomToolSelector
                        id="pricing-single-tool-selector"
                        selectedToolId={selectedToolId}
                        onSelectTool={(toolId) => setSelectedToolId(toolId)}
                        label="اختر البرنامج المفضل لديك من بين الـ 12 أداة:"
                      />
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div>
                  <button
                    onClick={() => handleSelectPackage(pkg, pkg.id === 'single-tool' ? selectedToolId : undefined)}
                    className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] ${
                      isPopular
                        ? 'bg-growix-gradient hover:bg-growix-gradient-hover text-white shadow-[#0F9D58]/30'
                        : 'bg-[#0B1220] hover:bg-[#1a263d] text-white'
                    }`}
                  >
                    <span>{pkg.ctaText}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className={`text-[11px] text-center mt-3 flex items-center justify-center gap-1 ${
                    isPopular ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D58]" />
                    <span>تفعيل فور التحويل عبر الواتساب</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
