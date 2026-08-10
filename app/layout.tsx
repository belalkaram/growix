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
  metadataBase: new URL('https://growix.belalkaram.dev'),
  title: {
    default: 'GROWIX | منصة التسويق الإلكتروني الشاملة وحزمة الـ 12 أداة',
    template: '%s | GROWIX',
  },
  description: 'اتعلّم التسويق الإلكتروني من الصفر للاحتراف وامتلك 12 أداة تسويق ذكية — واتساب سندر، تليجرام ماركتنج، فيسبوك بوت، انستجرام بوت، سحب داتا، مع داتا مصر التسويقية والدعم الفني المباشر.',
  keywords: [
    // Brand
    'GROWIX', 'Growix', 'جرويكس',
    // Core - P1
    'أدوات التسويق الإلكتروني', 'أدوات التسويق الرقمي', 'منصة التسويق الإلكتروني',
    'برامج التسويق الإلكتروني', 'أتمتة التسويق', 'برنامج تسويق إلكتروني',
    // WhatsApp - P1
    'واتساب ماركتنج', 'واتساب سندر', 'برنامج واتساب ماركتنج', 'واتساب سنتر',
    'إرسال رسائل واتساب جماعية', 'WhatsApp Marketing', 'WhatsApp Sender',
    // Telegram - P1
    'تليجرام ماركتنج', 'برنامج تليجرام ماركتنج', 'تليجرام سندر',
    'Telegram Marketing', 'Telegram Sender',
    // Social - P1
    'فيسبوك بوت', 'انستجرام بوت', 'تيك توك بوت', 'أتمتة السوشيال ميديا',
    'Facebook Marketing', 'Instagram Automation', 'TikTok Bot',
    // Data - P1
    'سحب الداتا', 'برنامج سحب داتا', 'Data Scraper', 'Google Maps Scraper',
    'سحب بيانات فيسبوك', 'استخراج أرقام العملاء',
    // Course - P1
    'كورس التسويق الإلكتروني', 'كورس تسويق رقمي', 'Digital Marketing Course',
    // Egypt Data - P1
    'داتا مصر التسويقية', 'بيانات العملاء في مصر', 'Egypt Marketing Data',
    // Lead Gen
    'توليد العملاء المحتملين', 'Lead Generation', 'جذب العملاء',
    // AI
    'أدوات الذكاء الاصطناعي للتسويق', 'AI Marketing Tools', 'توليد فيديو بالذكاء الاصطناعي',
    // Design
    'بديل كانفا', 'برنامج مونتاج فيديو', 'Canva Alternative',
    // Reach
    'زيادة الريتش', 'Reach Booster', 'زيادة وصول المنشورات',
  ],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'GROWIX | منصة التسويق الإلكتروني الشاملة وحزمة الـ 12 أداة',
    description: 'كورس كامل + 12 أداة تسويق وتطبيقات أتمتة مع داتا مصر التسويقية وتفعيل فوري.',
    url: 'https://growix.belalkaram.dev',
    siteName: 'GROWIX',
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GROWIX | منصة التسويق الإلكتروني الشاملة وحزمة الـ 12 أداة',
    description: 'اتعلّم التسويق الإلكتروني من الصفر للاحتراف وامتلك 12 أداة تسويق ذكية مع داتا مصر التسويقية.',
  },
  other: {
    'geo.region': 'EG',
    'geo.placename': 'Egypt',
    'geo.position': '26.820553;30.802498',
    'ICBM': '26.820553, 30.802498',
  },
  verification: {
    google: 'LOY1lke8addkKUUUCoOQ-SMNjP6mLooSJdrU3PEUMxI',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${ibmPlexSansArabic.variable} font-sans`} suppressHydrationWarning>
      <body className={`${ibmPlexSansArabic.className} font-sans bg-[#F7F9FA] text-[#0B1220] antialiased selection:bg-[#2ECC8F]/30 selection:text-[#0B1220]`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <GlobalNavigationLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
