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
  description: 'اتعلّم التسويق الإلكتروني من الصفر للاحتراف وامتلك 12 أداة تسويق ذكية مع داتا مصر التسويقية والدعم الفني المباشر.',
  keywords: [
    'GROWIX',
    'جرويكس',
    'تسويق إلكتروني مصر',
    'أدوات تسويق إلكتروني',
    'واتساب سندر',
    'فايسبوك بوت',
    'تليجرام سندر',
    'انستجرام بوت',
    'كورس تسويق إلكتروني',
    'داتا مصر التسويقية',
    'برنامج سحب داتا',
    'أتمتة السوشيال ميديا'
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
