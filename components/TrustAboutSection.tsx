'use client';

import React from 'react';
import { motion } from 'motion/react';
import { SITE_CONFIG } from '@/config/site';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Clock, 
  ShieldCheck, 
  Headphones, 
  Sparkles, 
  ArrowLeft,
  CheckCircle2,
  Award
} from 'lucide-react';

interface TrustAboutSectionProps {
  onOpenPaymentModal?: () => void;
}

export const TrustAboutSection: React.FC<TrustAboutSectionProps> = ({ onOpenPaymentModal }) => {
  const router = useRouter();

  const handleSubscribe = () => {
    if (onOpenPaymentModal) {
      onOpenPaymentModal();
    } else {
      router.push('/checkout?package=bundle-vip');
    }
  };
  const trustCards = [
    {
      icon: Users,
      title: '+5,000 مسوّق وطالب',
      desc: 'حققوا نتائج حقيقية وتضاعفت مبيعات متاجرهم وأعمالهم باستخدام أدوات وكورس GROWIX.'
    },
    {
      icon: Award,
      title: '12 أداة تسويق في مكان واحد',
      desc: 'تغنيك عن الاشتراكات الشهرية المكلفة، وتضمن لك أتمتة كاملة لحملاتك على كل المنصات.'
    },
    {
      icon: Clock,
      title: 'تفعيل خلال أقل من ساعة',
      desc: 'بمجرد تحويل المبلغ وإرسال الإيصال، يتولى فريقنا تفعيل حسابك وإرسال كافة الشروحات فوراً.'
    },
    {
      icon: Headphones,
      title: 'دعم فني وتدريب شامل',
      desc: 'فريق دعم فني متواجد معك دائماً للإجابة على استفساراتك وتوجيهك خطوة بخطوة للوصول لأفضل نتائج.'
    }
  ];

  return (
    <section id="about" className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1220] text-[#2ECC8F] text-xs font-black shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#2ECC8F]" />
            <span>من نحن ولماذا تختار GROWIX؟</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#0B1220]">
            منصة GROWIX... شركاؤك في صناعة <span className="text-growix-gradient">النجاح الرقمي</span>
          </h2>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            تم إنشاء منصة GROWIX بهدف واحد: تمكين أصحاب المشاريع، المسوّقين، والفريلانسرز في الوطن العربي من امتلاك أدوات التسويق الاحترافية التي تستخدمها كبرى الشركات، دون الحاجة لدفع اشتراكات شهرية باهظة أو تعقيدات برمجية.
          </p>
        </div>

        {/* 4 Trust Cards Grid (2x2 on mobile, 4-cols on lg) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12">
          {trustCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#F7F9FA] border border-gray-200/80 hover:border-[#0F9D58]/40 hover:shadow-lg transition-all group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5 sm:gap-3.5 mb-2.5 sm:mb-4">
                    <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-growix-gradient text-white flex items-center justify-center shadow-md shadow-[#0F9D58]/20 group-hover:scale-110 transition-transform shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-xs sm:text-base font-black text-[#0B1220] leading-snug">
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-[11px] sm:text-sm text-gray-600 leading-normal sm:leading-relaxed font-medium">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Story Summary Card */}
        <div className="bg-[#0B1220] text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-[#2ECC8F] text-xs font-bold tracking-wider uppercase block">تفعيل يدوي وسريع بدون تعقيد</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold leading-snug">
              كل ما تحتاجه لإطلاق حملاتك وتكبير مبيعاتك متوفر الآن بين يديك
            </h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              نوفر لك الكورس الشامل بصوت وصورة + الـ 12 أداة تسويقية + داتا مصر التسويقية + فيديوهات الشرح والدعم الفني المباشر لضمان وصولك إلى القمة.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3">
            <button
              onClick={handleSubscribe}
              className="w-full py-4 px-8 rounded-2xl bg-growix-gradient hover:bg-growix-gradient-hover text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-[#0F9D58]/30 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
              <span>احصل على الباقة الكاملة الآن</span>
            </button>

            <a
              href="/about"
              className="w-full py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-white/20"
            >
              <span>تعرف على قصة GROWIX ورؤيتنا</span>
              <ArrowLeft className="w-4 h-4 text-[#2ECC8F]" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
