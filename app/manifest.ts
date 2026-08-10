import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GROWIX | منصة التسويق الإلكتروني الشاملة وحزمة الـ 12 أداة',
    short_name: 'GROWIX',
    description: 'اتعلّم التسويق الإلكتروني من الصفر للاحتراف وامتلك 12 أداة تسويق ذكية مع داتا مصر التسويقية والدعم الفني المباشر.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B1220',
    theme_color: '#0F9D58',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
