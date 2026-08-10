'use client';

import React from 'react';
import { motion } from 'motion/react';
import { SITE_CONFIG } from '@/config/site';
import { Database, Gift, Check, Sparkles, MapPin, Briefcase, ArrowLeft } from 'lucide-react';

interface DataEgyptBonusSectionProps {
  onOpenPaymentModal: () => void;
}

export const DataEgyptBonusSection: React.FC<DataEgyptBonusSectionProps> = ({ onOpenPaymentModal }) => {
  const governorates = [
    'القاهرة والجيزة',
    'الإسكندرية والساحل',
    'محافظات الدلتا والوجه البحري',
    'محافظات القناة والشرقية',
    'محافظات الصعيد والوجه القبلي'
  ];

  const sectors = [
    'قطاع العقارات والمطوّرين',
    'أصحاب محلات الملابس والموضة',
    'التجارة الإلكترونية والمتاجر',
    'الأطباء والعيادات والمراكز الطبية',
    'المهندسين والمكاتب والخدمات'
  ];

  return (
    <section id="data-bonus" className="py-20 bg-[#0B1220] text-white relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[#0F9D58]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Gift Container */}
        <div className="bg-gradient-to-b from-white/10 to-white/5 border border-[#2ECC8F]/30 rounded-3xl p-8 sm:p-12 backdrop-blur-xl shadow-2xl glow-navy">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Right Side: Text & Highlights */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2ECC8F]/20 text-[#2ECC8F] text-xs font-black border border-[#2ECC8F]/40">
                <Gift className="w-4 h-4 text-[#2ECC8F]" />
                <span>بونص مجاني 100% مع الباقة</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white">
                {SITE_CONFIG.bonus.title}
              </h2>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {SITE_CONFIG.bonus.subtitle}. قاعدة بيانات حقيقية تم تجميعها ومراجعتها بعناية لتخدم جميع حملاتك الإعلانية والرسائل المباشرة بفاعلية قصوى.
              </p>

              {/* Bullet Points */}
              <div className="space-y-3 pt-2">
                {SITE_CONFIG.bonus.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#2ECC8F] text-[#0B1220] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-200 font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onOpenPaymentModal()}
                  className="py-4 px-8 rounded-2xl bg-growix-gradient hover:bg-growix-gradient-hover text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-[#0F9D58]/30 transition-all hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>احصل على الباقة ومعه هدية الداتا مجاناً</span>
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

            </div>

            {/* Left Side: Visual Breakdown Box */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0B1220]/90 rounded-2xl p-6 border border-white/10 space-y-5">
                
                {/* Governorates Classification */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2ECC8F] mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>مقسمة بدقة حسب المحافظات:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {governorates.map((gov, i) => (
                      <span key={i} className="text-[11px] font-semibold bg-white/5 border border-white/10 text-gray-200 px-3 py-1.5 rounded-lg">
                        {gov}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Business Sectors Classification */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2ECC8F] mb-3">
                    <Briefcase className="w-4 h-4" />
                    <span>مصنّفة حسب القطاعات والأنشطة:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sectors.map((sec, i) => (
                      <span key={i} className="text-[11px] font-semibold bg-white/5 border border-white/10 text-gray-200 px-3 py-1.5 rounded-lg">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-[#0F9D58]/20 rounded-xl border border-[#0F9D58]/30 text-xs text-emerald-200 flex items-center justify-between">
                  <span>صيغة الملفات:</span>
                  <span className="font-mono font-bold text-white">Excel / CSV جاهزة فوراً</span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
