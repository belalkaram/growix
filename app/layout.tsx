import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { Suspense } from 'react';
import { GlobalNavigationLoader } from '@/components/GlobalNavigationLoader';
import './globals.css';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GROWIX | منصة التسويق الإلكتروني الشاملة وحزمة الـ 12 أداة',
  description: 'اتعلّم التسويق الإلكتروني من الصفر للاحتراف وامتلك 12 أداة تسويق ذكية مع داتا مصر التسويقية والدعم الفني المباشر.',
  keywords: [
    'GROWIX',
    'جرويكس',
    'تسويق إلكتروني',
    'أدوات تسويق',
    'واتساب سندر',
    'فايسبوك بوت',
    'تليجرام سندر',
    'انستجرام بوت',
    'كورس تسويق',
    'داتا مصر التسويقية'
  ],
  openGraph: {
    title: 'GROWIX | منصة التسويق الإلكتروني الشاملة وحزمة الـ 12 أداة',
    description: 'كورس كامل + 12 أداة تسويق وتطبيقات أتمتة مع داتا مصر التسويقية وتفعيل فوري.',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${ibmPlexSansArabic.variable}`} suppressHydrationWarning>
      <body className={`${ibmPlexSansArabic.className} bg-[#F7F9FA] text-[#0B1220] antialiased selection:bg-[#2ECC8F]/30 selection:text-[#0B1220]`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <GlobalNavigationLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
