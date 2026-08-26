import React from 'react';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/site';
import { getFaqs, getSiteSettings } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { MaintenanceScreen } from '@/components/MaintenanceScreen';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { HelpCircle, MessageSquare, Sparkles, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة والإجابات الشاملة | GROWIX',
  description: 'إجابات كاملة لكل الأسئلة الشائعة حول منصة GROWIX — طرق الدفع، خطوات التفعيل، كفاءة الأدوات، التحديثات، والدعم الفني المباشر.',
  keywords: [
    'أسئلة شائعة growix', 'تفعيل أدوات growix', 'طريقة استخدام الأدوات',
    'أمان البرامج growix', 'دعم الفني growix'
  ],
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'الأسئلة الشائعة والإجابات | GROWIX',
    description: 'إجابات تفصيلية لكل استفساراتك حول الباقات، التفعيل، والأدوات.',
    url: 'https://growix.belalkaram.dev/faq',
    siteName: 'GROWIX',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default async function FaqPage() {
  const [faqsFromDb, siteSettings, session] = await Promise.all([
    getFaqs(),
    getSiteSettings(),
    auth(),
  ]);

  if (siteSettings?.maintenance_mode === 'true' && (session?.user as { role?: string })?.role !== 'admin') {
    return (
      <MaintenanceScreen
        message={siteSettings.maintenance_message}
        whatsappNumber={siteSettings.whatsapp_number}
        telegramUsername={siteSettings.telegram_username}
      />
    );
  }

  const faqList = faqsFromDb && faqsFromDb.length > 0 ? faqsFromDb : SITE_CONFIG.faqs;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="min-h-screen bg-[#F7F9FA] text-[#0B1220] font-sans" dir="rtl">
        <HeaderNavbar session={session} settings={siteSettings} />

        {/* Hero Banner */}
        <section className="bg-[#0B1220] text-white pt-32 pb-20 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            
            <nav className="mb-6 text-xs sm:text-sm text-gray-400" aria-label="Breadcrumb">
              <ol className="flex items-center justify-center gap-2">
                <li><a href="/" className="hover:text-[#2ECC8F] transition-colors">الرئيسية</a></li>
                <li className="text-gray-600">/</li>
                <li className="text-[#2ECC8F] font-semibold">الأسئلة الشائعة</li>
              </ol>
            </nav>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F9D58]/20 text-[#2ECC8F] text-xs font-black border border-[#2ECC8F]/30 mb-5">
              <HelpCircle className="w-4 h-4" />
              <span>مركز المساعدة والإجابات</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 leading-tight text-white">
              الأسئلة الشائعة حول <span className="text-[#2ECC8F]">منصة GROWIX</span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              تجد هنا إجابات وافية ومفصلة لجميع التساؤلات المتعلقة بالطرق، التفعيل، البرامج، والدعم الفني.
            </p>
          </div>
        </section>

        {/* FAQs List Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {faqList.map((faq, idx) => (
                <details
                  key={idx}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 transition-all hover:border-[#0F9D58]"
                >
                  <summary className="cursor-pointer font-extrabold text-[#0B1220] text-base sm:text-lg flex items-center justify-between gap-4 list-none">
                    <span className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#0F9D58]/10 text-[#0F9D58] text-xs flex items-center justify-center shrink-0 font-extrabold">
                        0{idx + 1}
                      </span>
                      {faq.question}
                    </span>
                    <span className="text-[#0F9D58] font-bold text-xl shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 leading-relaxed font-medium">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="mt-16 bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 shadow-sm">
              <h3 className="text-xl font-extrabold text-[#0B1220]">
                هل لديك سؤال إضافي لم تجده هنا؟
              </h3>
              <p className="text-sm text-gray-600 max-w-lg mx-auto">
                فريق الدعم الفني متواجد عبر الواتساب للإجابة على كافة أسئلتك قبل الشراء وبعد التفعيل.
              </p>
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-growix-gradient text-white font-extrabold text-sm shadow-lg hover:scale-105 transition-transform"
              >
                <MessageSquare className="w-4 h-4" />
                <span>تحدث معنا مباشرة على الواتساب</span>
              </a>
            </div>

          </div>
        </section>

        <Footer settings={siteSettings} />
      </main>
    </>
  );
}
