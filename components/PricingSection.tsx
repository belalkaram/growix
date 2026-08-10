'use client';

import React from 'react';
import { motion } from 'motion/react';
import { SITE_CONFIG, PricingPackage } from '@/config/site';
import { Check, X as XIcon, Sparkles, ArrowLeft, ShieldCheck, Clock, Zap } from 'lucide-react';

interface PricingSectionProps {
  onSelectPackage: (pkg: PricingPackage, toolId?: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPackage }) => {
  const [selectedToolId, setSelectedToolId] = React.useState<string>(SITE_CONFIG.tools[0].id);

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
            اختر الباقة الكاملة الشاملة لتوفير أقصى قدر من المال، أو اختر أداة واحدة فقط تناسب احتياجك الحالي.
          </p>
        </div>

        {/* 2 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {SITE_CONFIG.packages.map((pkg) => {
            const isPopular = pkg.isPopular;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  isPopular
                    ? 'bg-[#0B1220] text-white border-2 border-[#2ECC8F] shadow-2xl scale-102 lg:scale-105 z-10 glow-navy'
                    : 'bg-[#F7F9FA] text-[#0B1220] border border-gray-200 hover:border-[#0F9D58] hover:shadow-xl'
                }`}
              >
                {/* Popular Badge Floating Top */}
                {pkg.badge && (
                  <div className="absolute -top-4 right-1/2 translate-x-1/2 bg-growix-gradient text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg border border-white/20 whitespace-nowrap flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{pkg.badge}</span>
                  </div>
                )}

                <div>
                  {/* Package Title */}
                  <div className="mb-4">
                    <h3 className={`text-2xl font-black mb-1 ${isPopular ? 'text-white' : 'text-[#0B1220]'}`}>
                      {pkg.name}
                    </h3>
                    <p className={`text-xs ${isPopular ? 'text-gray-300' : 'text-gray-500'}`}>
                      {pkg.description}
                    </p>
                  </div>

                  {/* Pricing Box */}
                  <div className="my-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-growix-gradient">{pkg.discountedPrice}</span>
                    <span className={`text-sm font-bold ${isPopular ? 'text-gray-200' : 'text-gray-700'}`}>{pkg.currency}</span>
                    <span className={`text-xs line-through mr-auto ${isPopular ? 'text-gray-400' : 'text-gray-400'}`}>
                      {pkg.originalPrice} {pkg.currency}
                    </span>
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

                  {/* Optional Tool Selector for Single Tool Package */}
                  {pkg.id === 'single-tool' && (
                    <div className="mb-6 p-3 bg-white border border-gray-200 rounded-2xl shadow-sm">
                      <label htmlFor="pricing-single-tool-select" className="block text-xs font-extrabold text-[#0B1220] mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#0F9D58]" />
                        <span>اختر البرنامج المفضل لديك من بين الـ 12 أداة:</span>
                      </label>
                      <select
                        id="pricing-single-tool-select"
                        aria-label="اختر البرنامج المفضل لديك من بين الـ 12 أداة"
                        suppressHydrationWarning
                        value={selectedToolId}
                        onChange={(e) => setSelectedToolId(e.target.value)}
                        className="w-full py-2.5 px-3 bg-[#F7F9FA] border border-gray-300 rounded-xl text-xs font-bold text-[#0B1220] focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]"
                      >
                        {SITE_CONFIG.tools.map((tool) => (
                          <option key={tool.id} value={tool.id}>
                            {tool.number}. {tool.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div>
                  <button
                    onClick={() => onSelectPackage(pkg, pkg.id === 'single-tool' ? selectedToolId : undefined)}
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
