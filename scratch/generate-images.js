const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, '..', 'public', 'images', 'tools');
const packagesDir = path.join(__dirname, '..', 'public', 'images', 'packages');

fs.mkdirSync(toolsDir, { recursive: true });
fs.mkdirSync(packagesDir, { recursive: true });

const generateImage = async (filename, title, subtitle, badge, accentColor, outputDir) => {
  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0B1220" />
          <stop offset="100%" stop-color="#152136" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0F9D58" />
          <stop offset="100%" stop-color="#2ECC8F" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="30" result="blur" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGrad)" />

      <!-- Glowing Accent Spheres -->
      <circle cx="1050" cy="150" r="220" fill="${accentColor}" opacity="0.15" filter="url(#glow)" />
      <circle cx="150" cy="500" r="180" fill="#0F9D58" opacity="0.12" filter="url(#glow)" />

      <!-- Outer Frame -->
      <rect x="40" y="40" width="1120" height="550" rx="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" />

      <!-- Brand Top Header -->
      <g transform="translate(80, 100)">
        <!-- GROWIX Logo Icon -->
        <rect x="0" y="0" width="56" height="56" rx="16" fill="url(#accentGrad)" />
        <path d="M 28 12 L 40 40 L 16 40 Z" fill="#0B1220" />
        <text x="74" y="38" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" letter-spacing="2">GROWIX</text>
        <text x="210" y="38" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#2ECC8F">| MARKETING SUITE</text>
      </g>

      <!-- Badge Pill -->
      <g transform="translate(80, 190)">
        <rect x="0" y="0" width="${badge.length * 16 + 40}" height="40" rx="20" fill="${accentColor}" fill-opacity="0.2" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="1.5" />
        <text x="20" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="${accentColor}">${badge}</text>
      </g>

      <!-- Main Title -->
      <text x="80" y="310" font-family="Arial, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF">${title}</text>

      <!-- Subtitle -->
      <text x="80" y="380" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="#9CA3AF">${subtitle}</text>

      <!-- Feature Card Box Right Side -->
      <g transform="translate(760, 160)">
        <rect x="0" y="0" width="340" height="340" rx="28" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
        <circle cx="170" cy="130" r="60" fill="${accentColor}" fill-opacity="0.2" stroke="${accentColor}" stroke-width="3" />
        <text x="170" y="142" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle">⚡</text>
        <text x="170" y="240" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">تفعيل فوري</text>
        <text x="170" y="275" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#2ECC8F" text-anchor="middle">دعم فني 24/7</text>
      </g>

      <!-- Bottom Footer Bar -->
      <g transform="translate(80, 500)">
        <text x="0" y="20" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#2ECC8F">✓ بدون اشتراكات شهرية</text>
        <text x="260" y="20" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#2ECC8F">✓ فيديو شرح مرفق</text>
        <text x="480" y="20" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#2ECC8F">✓ تحديثات مجانية</text>
      </g>
    </svg>
  `;

  const outputPath = path.join(outputDir, filename);
  await sharp(Buffer.from(svg))
    .webp({ quality: 90 })
    .toFile(outputPath);

  console.log(`Generated: ${outputPath}`);
};

const main = async () => {
  // VIP Package Image
  await generateImage(
    'growix-vip-package.webp',
    'GROWIX VIP Package',
    'كورس التسويق الإلكتروني الشامل + 12 أداة تسويق + داتا مصر',
    'باقة النجاح المتكاملة',
    '#2ECC8F',
    packagesDir
  );

  // 12 Tools Images
  const tools = [
    {
      file: 'whatsapp-marketing.webp',
      title: 'WhatsApp Marketing Sender',
      sub: 'إرسال حتى 1000 رسالة واتساب يومياً بدون حظر وسحب داتا الجروبات',
      badge: 'برنامج واتساب ماركتنج'
    },
    {
      file: 'telegram-marketing.webp',
      title: 'Telegram Sender Pro',
      sub: 'إرسال رسائل جماعية وزيادة أعضاء القنوات وسحب داتا المنافسين',
      badge: 'برنامج تليجرام ماركتنج'
    },
    {
      file: 'facebook-marketing.webp',
      title: 'Facebook Marketing Bot',
      sub: 'نشر وجدولة البوستات في مئات المجموعات والرد التلقائي وحملات ماسنجر',
      badge: 'برنامج فيسبوك ماركتنج'
    },
    {
      file: 'instagram-automation.webp',
      title: 'Instagram Automation Bot',
      sub: 'زيادة المتابعين المستهدفين ورد تلقائي على الكومنتات ورسائل الخاص',
      badge: 'برنامج انستجرام بوت'
    },
    {
      file: 'tiktok-automation.webp',
      title: 'TikTok Automation Bot',
      sub: 'تكبير حساب تيك توك وزيادة المشاهدات والتفاعل التلقائي مع الجمهور',
      badge: 'برنامج تيك توك بوت'
    },
    {
      file: 'data-scraper.webp',
      title: 'Data Scraper Pro',
      sub: 'استخراج أرقام وداتا العملاء والشركات من فيسبوك وجوجل مابس',
      badge: 'برنامج سحب الداتا'
    },
    {
      file: 'reach-booster.webp',
      title: 'Keyword Researcher Pro',
      sub: 'استخراج الكلمات المفتاحية والهاشتاجات لمضاعفة الريتش والوصول',
      badge: 'باحث الكلمات المفتاحية'
    },
    {
      file: 'canva-alternative.webp',
      title: 'Socinator Dominator Enterprise',
      sub: 'أتمتة السوشيال ميديا الشاملة مع تصميم الإعلانات والمحتوى',
      badge: 'أتمتة + تصميم'
    },
    {
      file: 'video-editor.webp',
      title: 'AI Video Editor Pro',
      sub: 'مونتاج وصناعة الفيديوهات التسويقية والـ Reels والـ Shorts احترافياً',
      badge: 'برنامج مونتاج فيديو'
    },
    {
      file: 'ai-video-generator.webp',
      title: 'AI Video Generator',
      sub: 'تحويل الصور الثابتة إلى فيديوهات متحركة ومبهرة بالذكاء الاصطناعي',
      badge: 'توليد فيديو بالذكاء الاصطناعي'
    },
    {
      file: 'digital-marketing-course.webp',
      title: 'Digital Marketing Course',
      sub: 'كورس التسويق الإلكتروني الشامل من الصفر للاحتراف بفيديوهات HD',
      badge: 'كورس التسويق الشامل'
    },
    {
      file: 'egypt-marketing-data.webp',
      title: 'Egypt Marketing Database',
      sub: 'أكثر من 500,000 رقم وجهة اتصال مصنفة حسب المحافظات والأنشطة',
      badge: 'هدية داتا مصر'
    }
  ];

  for (const t of tools) {
    await generateImage(t.file, t.title, t.sub, t.badge, '#0F9D58', toolsDir);
  }
};

main().catch(console.error);
