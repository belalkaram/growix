'use client';

import React from 'react';
import { GrowixLogo } from '@/components/GrowixLogo';
import { 
  Sparkles, 
  CheckCircle2, 
  Wrench, 
  GraduationCap, 
  Database, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Star,
  Users
} from 'lucide-react';

export function AuthBrandShowcase() {
  const benefits = [
    {
      icon: Wrench,
      title: '12+ أداة تسويق وأتمتة شاملة',
      desc: 'واتساب سندر، فيسبوك بوت، تليجرام، انستجرام، تيك توك، سحب داتا، وتصميم ومونتاج احترافي.',
      badge: 'مفعلة بالكامل',
      badgeColor: 'text-[#2ECC8F] bg-[#2ECC8F]/10 border-[#2ECC8F]/30',
    },
    {
      icon: GraduationCap,
      title: '+1 تيرابايت كورسات سحابية حصرية',
      desc: 'مكتبة كورسات MEGA شاملة في الميديا باينج، الإعلانات الممولة، التجارة الإلكترونية وصناعة المحتوى.',
      badge: '+1 TB محتوى',
      badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    },
    {
      icon: Database,
      title: 'هدية داتا مصر التسويقية الشاملة',
      desc: 'ملايين أرقام وبيانات العملاء وأصحاب الأنشطة التجارية محدثة ومقسمة بالمحافظات والأنشطة.',
      badge: 'هدية مجانية',
      badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    },
    {
      icon: ShieldCheck,
      title: 'تفعيل دائم مدى الحياة + دعم 24/7',
      desc: 'استمتع بكافة البرامج بدون اشتراكات شهرية متكررة مع تحديثات مستمرة ودعم فني مخصص.',
      badge: 'تفعيل دائم',
      badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    },
  ];

  return (
    <div className="relative h-full flex flex-col justify-between p-8 sm:p-12 lg:p-14 text-white overflow-hidden select-none">
      
      {/* Background Animated Glows & Shapes */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00FF87]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* Top Section: Logo & Badge */}
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <GrowixLogo theme="dark" iconSize={38} />
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>الترسانة التسويقية المتكاملة</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight tracking-wide">
            انطلق بأعمالك ومبيعاتك إلى القمة مع{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF87] via-[#2ECC8F] to-[#38BDF8]">
              GROWIX
            </span>
          </h2>
          <p className="text-xs lg:text-sm text-gray-300 font-medium leading-relaxed max-w-lg">
            المنصة الأولى لأتمتة الحملات التسويقية، سحب الداتا المستهدفة، وتعلم أقوى استراتيجيات الميديا باينج والمبيعات بدون مجهود.
          </p>
        </div>
      </div>

      {/* Middle Section: 4 Feature Highlights */}
      <div className="relative z-10 my-8 space-y-3.5">
        {benefits.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 lg:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 backdrop-blur-md transition-all duration-300 group shadow-sm"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-[#00FF87]/20 text-[#00FF87] flex items-center justify-center shrink-0 transition-colors shadow-inner">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-extrabold text-xs lg:text-sm text-white group-hover:text-[#00FF87] transition-colors truncate">
                      {item.title}
                    </h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Trust Proof Stats */}
      <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-lg lg:text-xl font-black text-[#00FF87] block font-mono">+5,000</span>
          <span className="text-[10px] text-gray-400 font-bold block">مسوق وعميل</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-lg lg:text-xl font-black text-[#38BDF8] block font-mono">12+</span>
          <span className="text-[10px] text-gray-400 font-bold block">أداة احترافية</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-lg lg:text-xl font-black text-amber-400 block font-mono">99.8%</span>
          <span className="text-[10px] text-gray-400 font-bold block">نسبة الرضا</span>
        </div>
      </div>

    </div>
  );
}
