/**
 * seed_real_files.js
 * Seeds the package_files DB table with the ACTUAL Cloudflare R2 file keys & real sizes.
 * Run: node scratch/seed_real_files.js
 */

const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const FILE_RECORDS = [
  {
    packageId: 'bundle-vip',
    toolId: 'facebook-bot',
    fileName: 'برنامج التسويق المجاني على فيسبوك (FeedBolt Enterprise)',
    fileKey: 'FeedBolt_Facebook_Automation_Enterprise_v1_0_0_Full_Activated_.zip',
    fileSize: '224.0 MB',
    fileType: 'zip',
    category: 'tool',
    description: 'نشر وجدولة وإدارة الحملات المجانية على مئات المجموعات والصفحات.',
    isActive: true,
    sortOrder: 1,
  },
  {
    packageId: 'bundle-vip',
    toolId: 'whatsapp-sender',
    fileName: 'واتساب سندر Anti-Block (WhatBotPlus Business)',
    fileKey: 'WhatBotPlus_Business_Sender_v4_6_5_Full_Activated_ChatGPT_.zip',
    fileSize: '384.5 MB',
    fileType: 'zip',
    category: 'tool',
    description: 'إرسال حملات واتساب حتى 1000 رسالة يومياً بدون حظر.',
    isActive: true,
    sortOrder: 2,
  },
  {
    packageId: 'bundle-vip',
    toolId: 'telegram-sender',
    fileName: 'تليجرام سندر Pro (Telegram Sender Pro)',
    fileKey: 'Telegram Sender Pro v9.0.0 Full Activated -.zip',
    fileSize: '60.3 MB',
    fileType: 'zip',
    category: 'tool',
    description: 'إرسال رسائل بكميات ضخمة وزيادة أعضاء القنوات.',
    isActive: true,
    sortOrder: 3,
  },
  {
    packageId: 'bundle-vip',
    toolId: 'instagram-bot',
    fileName: 'انستجرام بوت Pro (Instagram Bot Pro)',
    fileKey: 'Instagram Bot Pro v7.3.1 Full Activated -.zip',
    fileSize: '50.0 MB',
    fileType: 'zip',
    category: 'tool',
    description: 'زيادة المتابعين المستهدفين ورد تلقائي على الرسائل والكومنتات.',
    isActive: true,
    sortOrder: 4,
  },
  {
    packageId: 'bundle-vip',
    toolId: 'tiktok-bot',
    fileName: 'تيك توك بوت Pro (TikTok Bot Pro)',
    fileKey: 'TikTok Bot Pro v3.7.0 Full Activated - .zip',
    fileSize: '49.6 MB',
    fileType: 'zip',
    category: 'tool',
    description: 'تكبير حساب التيك توك وأتمتة الردود والرسائل المباشرة.',
    isActive: true,
    sortOrder: 5,
  },
  {
    packageId: 'bundle-vip',
    toolId: 'reach-booster',
    fileName: 'Keyword Researcher Pro (باحث الكلمات المفتاحية)',
    fileKey: 'Keyword Researcher Pro v13.259 Full Activated - .zip',
    fileSize: '61.6 MB',
    fileType: 'zip',
    category: 'tool',
    description: 'استخراج أسرار الكلمات المفتاحية لمضاعفة الريتش والوصول المجاني.',
    isActive: true,
    sortOrder: 6,
  },
  {
    packageId: 'bundle-vip',
    toolId: 'canva-alternative',
    fileName: 'Socinator Dominator Enterprise (أتمتة السوشيال ميديا الشاملة)',
    fileKey: 'Socinator Dominator Enterprise v1.0.0.172 Full Activated - .zip',
    fileSize: '222.6 MB',
    fileType: 'zip',
    category: 'tool',
    description: 'إنشاء وجدولة المحتوى والتصاميم على كل منصات السوشيال ميديا تلقائياً.',
    isActive: true,
    sortOrder: 7,
  },
  {
    packageId: 'bundle-vip',
    toolId: 'video-editor',
    fileName: 'أداة مونتاج وتعديل الفيديو (Video Spin Blaster Pro)',
    fileKey: 'Video Spin Blaster Pro Plus v2.45 Full Activated -.zip',
    fileSize: '58.2 MB',
    fileType: 'zip',
    category: 'tool',
    description: 'صناعة ومونتاج الفيديوهات التسويقية والـ Reels بأسلوب جذاب.',
    isActive: true,
    sortOrder: 8,
  },
  {
    packageId: 'bundle-vip',
    toolId: 'videoscribe-ai',
    fileName: 'VideoScribe موشن جرافيك ووايت بورد (Sparkol VideoScribe)',
    fileKey: 'Sparkol_VideoScribe_Pro_3_14_2_x64_Full_Activated_Animated_Video.zip',
    fileSize: '145.2 MB',
    fileType: 'zip',
    category: 'tool',
    description: 'صناعة فيديوهات الرسوم المتحركة والـ Whiteboard بأسلوب شائق.',
    isActive: true,
    sortOrder: 9,
  },
  {
    packageId: 'bundle-vip',
    toolId: 'data-scraper',
    fileName: 'أداة سحب الداتا Pro (Social Phone Extractor Pro)',
    fileKey: 'Social Phone Extractor Pro v7.0.0 Full Activated - W..zip',
    fileSize: '51.6 MB',
    fileType: 'zip',
    category: 'tool',
    description: 'سحب أرقام وداتا العملاء من فيسبوك وانستجرام وجوجل مابس.',
    isActive: true,
    sortOrder: 10,
  },
  {
    packageId: 'bundle-vip',
    toolId: 'duolingo-unlocked',
    fileName: 'دولينجو مفتوح كل المميزات (Duolingo Max Premium)',
    fileKey: 'Duolingo Max Premium v6.35.3 Full Activated - new  (2).apk',
    fileSize: '88.9 MB',
    fileType: 'apk',
    category: 'tool',
    description: 'تعلم جميع اللغات بكل المميزات المدفوعة مفتوحة بالكامل.',
    isActive: true,
    sortOrder: 12,
  },
  // BONUS DATA
  {
    packageId: 'all',
    toolId: null,
    fileName: 'هدية داتا مصر التسويقية الشاملة',
    fileKey: 'data/Data masr.rar',
    fileSize: '106.1 MB',
    fileType: 'rar',
    category: 'data',
    description: 'قاعدة بيانات تسويقية ضخمة محدثة ومقسمة بدقة عالية حسب المحافظات والأنشطة.',
    isActive: true,
    sortOrder: 99,
  },
];

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to DB');

  await client.query(`
    CREATE TABLE IF NOT EXISTS package_files (
      id SERIAL PRIMARY KEY,
      package_id VARCHAR(100) NOT NULL,
      tool_id VARCHAR(100),
      file_name VARCHAR(255) NOT NULL,
      file_key VARCHAR(500) NOT NULL UNIQUE,
      file_size TEXT,
      file_type VARCHAR(50) DEFAULT 'zip' NOT NULL,
      category VARCHAR(50) DEFAULT 'tool' NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true NOT NULL,
      sort_order INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  let inserted = 0;
  let updated = 0;

  for (const rec of FILE_RECORDS) {
    const { rows } = await client.query(
      'SELECT id FROM package_files WHERE file_key = $1',
      [rec.fileKey]
    );

    if (rows.length > 0) {
      await client.query(
        `UPDATE package_files SET
          file_name=$1, file_size=$2, tool_id=$3, category=$4,
          description=$5, sort_order=$6, file_type=$7, is_active=$8,
          updated_at=NOW()
        WHERE file_key=$9`,
        [rec.fileName, rec.fileSize, rec.toolId, rec.category,
         rec.description, rec.sortOrder, rec.fileType, rec.isActive,
         rec.fileKey]
      );
      console.log('Updated:', rec.fileName);
      updated++;
    } else {
      await client.query(
        `INSERT INTO package_files
          (package_id,tool_id,file_name,file_key,file_size,file_type,category,description,is_active,sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [rec.packageId, rec.toolId, rec.fileName, rec.fileKey,
         rec.fileSize, rec.fileType, rec.category, rec.description,
         rec.isActive, rec.sortOrder]
      );
      console.log('Inserted:', rec.fileName);
      inserted++;
    }
  }

  await client.end();
  console.log(`\nDone! Inserted: ${inserted}, Updated: ${updated}`);
  console.log('NOTE: "ai-video-gen" tool has NO file in R2 yet. Upload it and re-run this script.');
}

seed().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
