# 🧪 GROWIX — دليل الاختبار الشامل (Full QA Testing Guide)

> **المشروع:** GROWIX — منصة تسويق إلكتروني عربية  
> **الرابط المباشر (Production):** https://growix.belalkaram.dev  
> **الرابط البديل (Vercel):** https://grow-ix.vercel.app (يعيد التوجيه 301 إلى الدومين الرئيسي)  
> **التاريخ:** أغسطس 2026  
> **الإصدار:** 1.0  

---

## 📋 جدول المحتويات

1. [نظرة عامة على المشروع والبنية التقنية](#1-نظرة-عامة-على-المشروع-والبنية-التقنية)
2. [خريطة الصفحات والـ Routes](#2-خريطة-الصفحات-والـ-routes)
3. [اختبارات الواجهة الأمامية (Frontend Testing)](#3-اختبارات-الواجهة-الأمامية-frontend-testing)
4. [اختبارات الباك إند (Backend / API Testing)](#4-اختبارات-الباك-إند-backend--api-testing)
5. [اختبارات قاعدة البيانات (Database Testing)](#5-اختبارات-قاعدة-البيانات-database-testing)
6. [اختبارات الأمان (Security Testing)](#6-اختبارات-الأمان-security-testing)
7. [اختبارات الأداء والسرعة (Performance Testing)](#7-اختبارات-الأداء-والسرعة-performance-testing)
8. [اختبارات SEO والبيانات المنظمة (SEO & Structured Data)](#8-اختبارات-seo-والبيانات-المنظمة)
9. [اختبارات التجاوب والتوافق (Responsive & Cross-Browser)](#9-اختبارات-التجاوب-والتوافق)
10. [اختبارات التعديلات البصرية (Visual / UI Regression)](#10-اختبارات-التعديلات-البصرية)
11. [اختبارات تجربة المستخدم (UX Testing)](#11-اختبارات-تجربة-المستخدم)
12. [اختبارات الـ Deployment والبنية التحتية](#12-اختبارات-الـ-deployment-والبنية-التحتية)
13. [ملحق: بيانات الاختبار المرجعية](#13-ملحق-بيانات-الاختبار-المرجعية)

---

## 1. نظرة عامة على المشروع والبنية التقنية

### وصف المنتج
GROWIX هي منصة عربية (RTL) لبيع كورس تسويق إلكتروني شامل + 12 أداة تسويقية رقمية + هدية داتا مصر التسويقية. لا يوجد شحن فعلي — كل المنتجات رقمية يتم تسليمها عبر التحميل المباشر وروابط MEGA.

### Technology Stack

| الطبقة | التقنية | الإصدار |
|--------|---------|---------|
| **Framework** | Next.js (App Router) | 15.5.23 |
| **Runtime** | React | 19.2.1 |
| **Language** | TypeScript | 5.9.3 |
| **Styling** | Tailwind CSS | 4.1.11 |
| **ORM** | Drizzle ORM | 0.45.2 |
| **Database** | Neon PostgreSQL | Serverless |
| **Authentication** | NextAuth v5 (Auth.js) | 5.0.0-beta.32 |
| **File Storage** | Cloudflare R2 (S3-compatible) | — |
| **CAPTCHA** | Cloudflare Turnstile | — |
| **Animations** | Motion (Framer Motion) | 12.23.24 |
| **Icons** | Lucide React | 0.553.0 |
| **Hosting** | Vercel | — |
| **Domain** | growix.belalkaram.dev | — |

### Environment Variables المطلوبة

| المتغير | الوصف |
|---------|-------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `AUTH_SECRET` | مفتاح تشفير جلسات NextAuth |
| `APP_URL` | `https://growix.belalkaram.dev` |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Key |
| `R2_ENDPOINT` | Cloudflare R2 Endpoint URL |
| `R2_BUCKET_NAME` | `growix` |
| `R2_CUSTOM_DOMAIN` | (اختياري) دومين R2 المخصص |
| `TURNSTILE_SECRET_KEY` | مفتاح Cloudflare Turnstile السري |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | مفتاح Turnstile العام |

---

## 2. خريطة الصفحات والـ Routes

### صفحات عامة (Public)

| الصفحة | Route | النوع | الوصف |
|--------|-------|-------|-------|
| الرئيسية (Landing Page) | `/` | Dynamic (SSR) | صفحة الإقناع الرئيسية — Hero + 5 أدوات + أسعار + شهادات + FAQ |
| الأدوات | `/tools` | Dynamic | عرض الـ 12 أداة تسويقية مصنفة حسب الفئة |
| تفاصيل أداة | `/tools/[slug]` | SSG + ISR | صفحة أداة منفردة (12 صفحة) مثل `/tools/whatsapp-marketing` |
| الكورس | `/course` | Dynamic | تفاصيل كورس التسويق الإلكتروني |
| هدية الداتا | `/data-bonus` | Dynamic | شرح هدية داتا مصر التسويقية |
| الباقات والأسعار | `/pricing` | Dynamic | جدول مقارنة الباقات الثلاثة |
| كيف يعمل | `/how-it-works` | Dynamic | 4 خطوات للاشتراك والاستلام |
| الأسئلة الشائعة | `/faq` | Dynamic | أسئلة وأجوبة FAQ |
| من نحن | `/about` | Dynamic | معلومات عن المنصة |

### صفحات تحتاج تسجيل دخول (Authenticated)

| الصفحة | Route | الوصف |
|--------|-------|-------|
| الدفع والاشتراك | `/checkout` | اختيار الباقة + بيانات الدفع — يعيد توجيه غير المسجلين |
| طلباتي وملفاتي | `/my-orders` | لوحة الطلبات — عرض حالة الطلب + تحميل ملفات + مشاهدة فيديوهات |
| صفحة النجاح | `/success` | شاشة تأكيد بعد إرسال الطلب |
| لوحة التحكم | `/dashboard` | إعادة توجيه لـ `/my-orders` |

### صفحات المصادقة (Auth)

| الصفحة | Route |
|--------|-------|
| تسجيل الدخول | `/login` |
| إنشاء حساب | `/register` |

### لوحة الأدمن (Admin Panel) — تحتاج Role = `admin`

| الصفحة | Route | الوصف |
|--------|-------|-------|
| لوحة القيادة | `/admin` | إحصائيات شاملة (طلبات، مستخدمين، مشاهدات) |
| إدارة الطلبات | `/admin/orders` | قبول/رفض طلبات الاشتراك |
| إدارة المستخدمين | `/admin/users` | عرض وإدارة المستخدمين |
| إدارة الباقات | `/admin/packages` | تعديل الباقات والأسعار |
| إدارة الأدوات | `/admin/tools` | إدارة الأدوات الـ 12 وبيانات SEO |
| إدارة الملفات | `/admin/files` | رفع وإدارة ملفات R2 (تحميلات البرامج) |
| إدارة الفيديوهات | `/admin/videos` | إضافة/تعديل فيديوهات الشرح |
| إدارة MEGA | `/admin/mega` | إدارة روابط MEGA للكورسات |
| إدارة الإعدادات | `/admin/settings` | إعدادات الموقع (واتساب، وضع الصيانة، إلخ) |
| التحليلات | `/admin/analytics` | إحصائيات الزوار والمشاهدات |

### API Routes

| المسار | Method | الوصف |
|--------|--------|-------|
| `/api/auth/[...nextauth]` | GET/POST | نقاط نهاية المصادقة (NextAuth) |
| `/api/download` | GET | توليد رابط تحميل آمن من R2 |
| `/api/track` | POST | تسجيل زيارات الصفحات (Analytics) |

### ملفات SEO الثابتة

| المسار | الوصف |
|--------|-------|
| `/sitemap.xml` | خريطة الموقع تلقائية |
| `/robots.txt` | قواعد الزحف |
| `/manifest.webmanifest` | PWA Manifest |
| `/opengraph-image` | صورة OG ديناميكية |
| `/icon.png` | أيقونة الموقع |

---

## 3. اختبارات الواجهة الأمامية (Frontend Testing)

### 3.1 اختبارات المكونات المشتركة (Shared Components)

#### HeaderNavbar
- [ ] **التمرير (Scroll):** تأكد أن الناف بار يتحول من شفاف إلى أبيض مع ظل عند التمرير لأسفل
- [ ] **الروابط:** تأكد من أن جميع روابط التنقل تعمل وتنتقل للصفحة الصحيحة
- [ ] **حجم النص:** تأكد أن نصوص الروابط تظهر بحجم `text-sm sm:text-base font-extrabold`
- [ ] **زر اشترك الآن:** يفتح Modal الدفع في الصفحة الرئيسية، ويوجه لـ `/checkout` في الصفحات الداخلية
- [ ] **قائمة الموبايل:** تفتح/تغلق بشكل صحيح على شاشات < 1024px
- [ ] **حالة المستخدم المسجل:** يظهر زر "طلباتي" بدلاً من "تسجيل الدخول"
- [ ] **حالة الأدمن:** يظهر زر "لوحة الأدمن" الإضافي
- [ ] **تسجيل الخروج:** زر Logout يعمل ويعيد التوجيه للرئيسية

#### PromoAnnouncementBar (الشريط العلوي المتحرك)
- [ ] **الحركة:** التأكد من أن النص يتحرك من اليمين لليسار (marquee LTR) بسلاسة
- [ ] **الإيقاف:** يتوقف عند تمرير المؤشر فوقه (hover pause)
- [ ] **البيانات:** يعرض النص الصحيح: `12 أداة تسويقية` + `500 جنيه فقط`
- [ ] **الرابط:** رابط "احجز الآن مع التفعيل الفوري" يوجه لـ `/checkout?package=bundle-vip`

#### FloatingElements (العناصر العائمة)
- [ ] **زر الواتساب:** يظهر ثابت في الركن الأيمن السفلي ويفتح رابط wa.me
- [ ] **شريط الموبايل السفلي:** يظهر فقط على شاشات < 640px مع السعر `500 جنية` وزر "اشترك الآن"
- [ ] **التداخل:** لا يتداخل زر الواتساب مع شريط الموبايل

#### Footer
- [ ] **الروابط:** جميع روابط التنقل تعمل
- [ ] **معلومات الاتصال:** رقم الواتساب والتليجرام يظهران بشكل صحيح
- [ ] **حقوق النشر:** تعرض السنة الحالية

### 3.2 اختبارات الصفحة الرئيسية (Landing Page `/`)

#### HeroSection
- [ ] **العنوان الرئيسي:** يعرض العنوان والوصف بشكل صحيح
- [ ] **أزرار CTA:** "اشترك الآن" و"اعرف أكثر" يعملان
- [ ] **الأنيميشن:** تأثيرات الحركة (motion) تعمل عند التحميل الأول
- [ ] **الشارات:** تظهر شارات مثل "12 أداة تسويقية" و "تفعيل فوري"

#### ToolsGridSection (الأدوات في الرئيسية)
- [ ] **عدد الأدوات:** تعرض **5 أدوات** بالضبط في الصفحة الرئيسية
- [ ] **البطاقات:** كل بطاقة تحتوي على رقم + اسم + وصف + أيقونة
- [ ] **الروابط:** كل بطاقة توجه لصفحة الأداة المنفردة `/tools/[slug]`
- [ ] **زر "اكتشف كل الأدوات":** يوجه لصفحة `/tools`

#### PricingSection (جدول الأسعار)
- [ ] **3 باقات:** VIP (500ج) + Premium (500ج) + أداة واحدة (200ج)
- [ ] **الباقة الأكثر طلباً:** باقة VIP تحمل شارة "الأكثر طلباً"
- [ ] **الميزات:** كل باقة تعرض قائمة ميزاتها بشكل صحيح (✓ متاح / ✕ غير متاح)
- [ ] **أزرار CTA:** توجه لصفحة `/checkout` مع المعلمات الصحيحة

#### TestimonialsSection (شهادات العملاء)
- [ ] **عرض الشهادات:** تعرض 3 شهادات حقيقية مع اسم + وظيفة + تقييم نجوم
- [ ] **النجوم:** تعرض 5 نجوم لكل شهادة

#### HowItWorksSection (كيف يعمل)
- [ ] **4 خطوات:** تعرض الخطوات الأربعة بشكل صحيح
- [ ] **المحاذاة:** الرقم والعنوان Bold يظهران **بجانب بعضهما أفقياً** (flex row) وليس فوق بعض
- [ ] **الأنيميشن:** تأثيرات الظهور التدريجي تعمل عند الوصول لهذا القسم

#### TrustAboutSection (من نحن)
- [ ] **4 بطاقات:** تعرض بطاقات الثقة الأربع
- [ ] **المحاذاة:** الأيقونة والعنوان Bold يظهران **بجانب بعضهما أفقياً** (flex row)
- [ ] **المحتوى:** "+5,000 مسوّق" + "12 أداة تسويق" + "تفعيل خلال أقل من ساعة" + "دعم فني"

#### CourseDetailsSection
- [ ] **المحتوى:** يعرض ملخص كورس التسويق الإلكتروني
- [ ] **CTA:** زر الاشتراك يعمل

#### DataEgyptBonusSection
- [ ] **المحتوى:** يعرض تفاصيل هدية داتا مصر
- [ ] **CTA:** زر الاشتراك يعمل

#### FaqSection
- [ ] **الأسئلة:** تعرض قائمة FAQ وتُفتح/تُغلق بالنقر (Accordion/Details)
- [ ] **الأنيميشن:** الفتح والإغلاق سلس

#### PaymentModal (مودال الدفع السريع)
- [ ] **الفتح:** يفتح عند النقر على أزرار CTA في الرئيسية
- [ ] **الإغلاق:** يغلق بالنقر على X أو خارج المودال أو Escape
- [ ] **المحتوى:** يعرض طرق الدفع ومعلومات التحويل
- [ ] **Body Scroll Lock:** عند فتح المودال، يتوقف تمرير الصفحة خلفه

### 3.3 اختبارات صفحات الأدوات

#### `/tools` (صفحة كل الأدوات)
- [ ] **التصنيف:** الأدوات مصنفة حسب الفئات (Social, Messaging, Design, AI, Data)
- [ ] **عدد الأدوات:** تعرض الـ 12 أداة كاملة
- [ ] **CTA العلوي:** "احصل على الباقة الكاملة — 500 جنيه فقط"
- [ ] **CTA السفلي:** "احصل على الـ 12 أداة كاملة بـ 500 جنيه فقط"

#### `/tools/[slug]` (صفحة أداة منفردة)
- [ ] **الـ Slugs الـ 12:** تأكد أن كل slug يعمل:
  - `/tools/whatsapp-marketing`
  - `/tools/facebook-marketing`
  - `/tools/telegram-marketing`
  - `/tools/instagram-automation`
  - `/tools/tiktok-automation`
  - `/tools/data-scraper`
  - `/tools/canva-alternative`
  - `/tools/video-editor`
  - `/tools/ai-video-generator`
  - `/tools/reach-booster`
  - `/tools/digital-marketing-course`
  - `/tools/egypt-marketing-data`
- [ ] **Breadcrumb:** الرئيسية / الأدوات / اسم الأداة
- [ ] **H1:** يعرض عنوان الأداة الفريد
- [ ] **مميزات الأداة:** قائمة features تظهر بشكل صحيح
- [ ] **FAQ:** أسئلة شائعة خاصة بالأداة (Accordion)
- [ ] **CTA:** زر "احصل على الأداة الآن — 200 جنيه فقط" + "أو احصل على الباقة الكاملة"
- [ ] **CTA السفلي:** "احصل على الباقة الكاملة — 500 ج فقط"
- [ ] **صورة الأداة:** صورة WebP تحمل من `/images/tools/[slug].webp`

### 3.4 اختبارات صفحات المحتوى

#### `/course`
- [ ] **المحتوى:** يعرض تفاصيل الكورس (الموضوعات + الجمهور المستهدف)
- [ ] **السعر في الـ Schema:** `500` EGP وليس 300
- [ ] **CTA:** "اشترك في الباقة الكاملة (الكورس + 12 أداة) — 500 ج"
- [ ] **CTA السفلي:** "بـ 500 جنيه فقط"

#### `/data-bonus`
- [ ] **المحتوى:** يعرض تفاصيل هدية داتا مصر
- [ ] **CTA السفلي:** "بـ 500 جنيه فقط"

#### `/pricing`
- [ ] **الجدول المقارن:** يعرض 3 أعمدة (VIP 500ج + Premium 300ج + برنامج واحد 200ج)
- [ ] **PricingSection التفاعلي:** يعرض 3 بطاقات أسعار تفاعلية
- [ ] **CTA السفلي:** "اختر الباقة الكاملة VIP (500ج)"

#### `/how-it-works`
- [ ] **الخطوة الأولى:** تذكر "باقة VIP الشاملة (500 ج)"
- [ ] **محاذاة الخطوات:** الرقم والعنوان بجانب بعض أفقياً

#### `/faq`
- [ ] **الأسئلة:** جميع الأسئلة تفتح/تغلق
- [ ] **المحتوى:** لا يوجد نص فارغ أو placeholder

#### `/about`
- [ ] **المحتوى:** معلومات عن المنصة

### 3.5 اختبارات صفحة الدفع (`/checkout`)

- [ ] **إعادة التوجيه:** المستخدم غير المسجل يُعاد توجيهه لـ `/login?callbackUrl=...`
- [ ] **الباقات الثلاث:** يمكن التبديل بين VIP + Premium + أداة واحدة
- [ ] **Query Params:** `?package=bundle-vip` يختار VIP، `?package=single-tool&tool=facebook-bot` يختار الأداة المحددة
- [ ] **اختيار الأداة:** عند اختيار "أداة واحدة"، يظهر CustomToolSelector لاختيار الأداة
- [ ] **طرق الدفع:** فودافون كاش / انستاباي / تحويل بنكي — كل واحدة تعرض البيانات الصحيحة
- [ ] **نسخ الرقم:** زر النسخ ينسخ رقم فودافون كاش بنجاح
- [ ] **حقول النموذج:** رقم المرسل + المبلغ المحول — مطلوبان
- [ ] **Cloudflare Turnstile:** ويدجت CAPTCHA يظهر ويعمل
- [ ] **إرسال الطلب:** يُنشئ طلب جديد بحالة `pending` ويوجه لـ `/success`
- [ ] **Validation:** رسائل الخطأ تظهر عند إرسال نموذج فارغ
- [ ] **تكرار الإرسال:** تعطيل الزر أثناء الإرسال لمنع التكرار

### 3.6 اختبارات صفحة النجاح (`/success`)

- [ ] **العرض:** تعرض رسالة تأكيد استلام الطلب
- [ ] **رقم الطلب:** يعرض رقم الطلب للمستخدم
- [ ] **التوجيه:** رابط الانتقال لـ "طلباتي" يعمل

### 3.7 اختبارات صفحة طلباتي (`/my-orders`)

- [ ] **إعادة التوجيه:** المستخدم غير المسجل يُعاد توجيهه لتسجيل الدخول
- [ ] **عرض الطلبات:** تعرض كافة طلبات المستخدم الحالي
- [ ] **حالة الطلب:** 
  - `pending` → شارة صفراء "قيد المراجعة"
  - `approved` → شارة خضراء "مفعّل"
  - `rejected` → شارة حمراء "مرفوض"
- [ ] **تحميل الملفات (Approved فقط):**
  - زر التحميل يظهر فقط للطلبات المفعّلة
  - يولّد رابط تحميل آمن من R2
  - الطلبات من نوع `single-tool` تعرض ملفات الأداة المحددة فقط
  - الطلبات من نوع `bundle-vip` أو `bundle-premium` تعرض كل الملفات
- [ ] **مشاهدة الفيديوهات:**
  - فيديوهات الشرح تظهر وتفتح في SecureVideoModal
  - المودال يمنع النسخ والتحميل المباشر
- [ ] **روابط MEGA:**
  - تظهر فقط للباقات المؤهلة (VIP / Premium)
  - الروابط تفتح في تبويب جديد
- [ ] **البحث والفلترة:**
  - البحث في الفيديوهات يعمل
  - الفلترة حسب الفئة تعمل
- [ ] **نسخ رقم الطلب:** زر النسخ يعمل

### 3.8 اختبارات المصادقة (Authentication)

#### `/login`
- [ ] **نموذج الدخول:** البريد + كلمة المرور
- [ ] **Validation:** رسالة خطأ عند إدخال بيانات خاطئة
- [ ] **callbackUrl:** بعد النجاح يعود للصفحة المطلوبة (مثل `/checkout`)
- [ ] **رابط إنشاء حساب:** يعمل

#### `/register`
- [ ] **نموذج التسجيل:** الاسم + البريد + كلمة المرور + تأكيد كلمة المرور
- [ ] **Cloudflare Turnstile:** يظهر ويعمل
- [ ] **Validation:**
  - بريد مكرر → رسالة خطأ
  - كلمة مرور قصيرة → رسالة خطأ
  - عدم تطابق كلمتي المرور → رسالة خطأ
- [ ] **بعد التسجيل:** يسجل الدخول تلقائياً ويوجه للرئيسية

---

## 4. اختبارات الباك إند (Backend / API Testing)

### 4.1 Server Actions (lib/actions/)

> جميع Server Actions تستخدم `'use server'` وتعمل عبر استدعاءات RPC من الفرونت.

#### Orders Actions (`lib/actions/orders.ts`)
- [ ] **createOrderAction:** إنشاء طلب جديد — تأكد أن:
  - يتطلب جلسة مستخدم نشطة
  - يحفظ: `userId`, `packageId`, `toolId`, `paymentMethod`, `senderNumber`, `amount`
  - الحالة الابتدائية = `pending`
  - يرفض بيانات ناقصة مع رسالة خطأ مناسبة

#### Users Actions (`lib/actions/users.ts`)
- [ ] **registerAction:** إنشاء حساب جديد — تأكد أن:
  - يتحقق من Turnstile CAPTCHA
  - يرفض البريد المكرر
  - يشفر كلمة المرور بـ bcrypt
  - يُنشئ الحساب ويسجل الدخول تلقائياً

#### Admin Actions
- [ ] **packages.ts:** CRUD للباقات — تحقق من صلاحية الأدمن
- [ ] **tools.ts:** CRUD للأدوات — تحقق من صلاحية الأدمن
- [ ] **files.ts:** رفع/حذف ملفات R2 — تحقق من صلاحية الأدمن
- [ ] **videos.ts:** CRUD للفيديوهات — تحقق من صلاحية الأدمن
- [ ] **mega.ts:** CRUD لروابط MEGA — تحقق من صلاحية الأدمن
- [ ] **settings.ts:** تحديث إعدادات الموقع — تحقق من صلاحية الأدمن
- [ ] **orders.ts:** تحديث حالة الطلب (approve/reject) — تحقق من صلاحية الأدمن

### 4.2 API Routes

#### `GET /api/download`
- [ ] **بدون تسجيل دخول:** يرجع `401 Unauthorized`
- [ ] **بدون parameters:** يرجع `400 Bad Request`
- [ ] **طلب لا ينتمي للمستخدم:** يرجع `403 Forbidden`
- [ ] **طلب pending/rejected:** يرجع `403` مع رسالة "الطلب غير مفعّل بعد"
- [ ] **Single-tool يحاول تحميل ملف أداة أخرى:** يرجع `403`
- [ ] **طلب صحيح (approved):** يرجع URL تحميل أو يعيد التوجيه
- [ ] **format=json:** يرجع JSON مع `downloadUrl`
- [ ] **بدون format:** يعيد التوجيه مباشرة لرابط R2

#### `POST /api/track`
- [ ] **بيانات صحيحة:** يسجل الزيارة ويرجع `{ ok: true }`
- [ ] **بدون path أو sessionId:** يرجع `400`
- [ ] **Device Type:** يميز بين mobile و desktop من User-Agent
- [ ] **Country:** يقرأ من header `x-vercel-ip-country`

#### `GET/POST /api/auth/[...nextauth]`
- [ ] **تسجيل الدخول:** يتحقق من البريد وكلمة المرور
- [ ] **الجلسة:** تحتوي على `id`, `name`, `email`, `role`
- [ ] **JWT:** يخزن `role` في الـ token
- [ ] **تحديث lastLoginAt:** يُحدث عند كل تسجيل دخول ناجح

### 4.3 Middleware

- [ ] **حماية `/admin/*`:** يفحص وجود session cookie
- [ ] **بدون session:** يعيد التوجيه لـ `/login?callbackUrl=/admin/...`
- [ ] **مع session:** يسمح بالمرور (ملاحظة: التحقق من role = admin يتم في الصفحة نفسها)

---

## 5. اختبارات قاعدة البيانات (Database Testing)

### 5.1 Schema Validation (12 جدول)

| الجدول | PK | العلاقات |
|--------|-----|---------|
| `users` | `id` (UUID) | → `orders.userId`, `pageViews.userId` |
| `packages` | `id` (varchar) | — |
| `tools` | `id` (varchar) | → `toolsSeo.toolId` |
| `tools_seo` | `tool_id` (FK → tools) | CASCADE delete |
| `site_settings` | `key` (varchar) | — |
| `testimonials` | `id` (varchar) | — |
| `faqs` | `id` (serial) | — |
| `page_views` | `id` (serial) | SET NULL on user delete |
| `orders` | `id` (UUID) | CASCADE on user delete |
| `package_files` | `id` (serial) | — |
| `tool_videos` | `id` (serial) | — |
| `mega_links` | `id` (serial) | — |

### 5.2 اختبارات مقترحة

- [ ] **Unique Constraints:**
  - `users.email` فريد — تسجيل بنفس البريد يفشل
  - `tools.slug` فريد
  - `package_files.file_key` فريد
- [ ] **Cascade Delete:**
  - حذف user → حذف orders المرتبطة
  - حذف tool → حذف tools_seo المرتبط
- [ ] **Default Values:**
  - `users.role` = `'user'`
  - `orders.status` = `'pending'`
  - `packages.is_active` = `true`
- [ ] **Seed Data:** تشغيل `npm run db:seed` يعمل بدون أخطاء ويملأ البيانات الأولية

---

## 6. اختبارات الأمان (Security Testing)

### 6.1 Authentication & Authorization

- [ ] **Password Hashing:** كلمات المرور مشفرة بـ bcrypt في قاعدة البيانات (لا يوجد plain text)
- [ ] **JWT Session:** الجلسات تستخدم JWT مع `AUTH_SECRET`
- [ ] **Admin Protection:**
  - الوصول لـ `/admin` بدون تسجيل دخول → إعادة توجيه
  - الوصول لـ `/admin` بحساب `role = user` → لا يعرض محتوى الأدمن
  - Server Actions الخاصة بالأدمن ترفض الطلبات من حسابات عادية
- [ ] **Download Protection:**
  - `/api/download` يتحقق من ملكية الطلب + حالة الطلب + استحقاق الملف
  - لا يمكن لمستخدم تحميل ملفات طلب مستخدم آخر
  - لا يمكن لمشترك `single-tool` تحميل ملفات أدوات أخرى

### 6.2 CAPTCHA (Cloudflare Turnstile)

- [ ] **صفحة التسجيل:** Turnstile widget يظهر ويعمل
- [ ] **صفحة الدفع:** Turnstile widget يظهر ويعمل
- [ ] **Server-side Verification:** يتحقق من Token مع Cloudflare API
- [ ] **Dummy Tokens:** يقبل tokens تبدأ بـ `1x000000` أو `2x000000` (بيئة التطوير)

### 6.3 Security Headers (vercel.json)

- [ ] **X-Content-Type-Options:** `nosniff`
- [ ] **X-Frame-Options:** `DENY` (يمنع استخدام الموقع في iframe)
- [ ] **X-XSS-Protection:** `1; mode=block`
- [ ] **Referrer-Policy:** `strict-origin-when-cross-origin`
- [ ] **Permissions-Policy:** `camera=(), microphone=(), geolocation=()`

### 6.4 Input Validation

- [ ] **SQL Injection:** جميع الاستعلامات تمر عبر Drizzle ORM (parameterized)
- [ ] **XSS:** لا يوجد `dangerouslySetInnerHTML` مع بيانات المستخدم (ما عدا inline CSS في PromoAnnouncementBar)
- [ ] **CSRF:** NextAuth يحمي Server Actions تلقائياً
- [ ] **Path Traversal في `/api/download`:** fileKey يُمرر لـ R2 مباشرة — تأكد أنه لا يسمح بـ `../` أو مسارات خارجية

### 6.5 Secure File Downloads

- [ ] **Presigned URLs:** تنتهي صلاحيتها بعد 300 ثانية (5 دقائق)
- [ ] **R2 Bucket:** غير متاح للعموم مباشرة (بدون presigned URL)

### 6.6 Video Protection (SecureVideoModal)

- [ ] **المودال:** يمنع النقر اليمين (context menu)
- [ ] **التحميل المباشر:** لا يكشف رابط الفيديو المباشر في DOM

---

## 7. اختبارات الأداء والسرعة (Performance Testing)

### 7.1 Core Web Vitals (قياس بـ Lighthouse / PageSpeed Insights)

| المقياس | الهدف |
|---------|-------|
| **LCP** (Largest Contentful Paint) | < 2.5s |
| **FID** (First Input Delay) | < 100ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 |
| **FCP** (First Contentful Paint) | < 1.8s |
| **TTFB** (Time to First Byte) | < 600ms |
| **Total Blocking Time** | < 200ms |

### 7.2 Bundle Size

- [ ] **First Load JS shared:** ~102 kB (الحالي) — تأكد أنه لا يزيد عن 150 kB
- [ ] **أكبر صفحة (Home):** ~196 kB First Load — تأكد أنه لا يزيد عن 250 kB
- [ ] **Tree-shaking:** تأكد أن `lucide-react` و `motion` يتم تحسينهما (`optimizePackageImports`)

### 7.3 اختبارات سرعة محددة

- [ ] **الصفحة الرئيسية:** تحميل < 3 ثوانٍ على اتصال 4G
- [ ] **صفحة `/tools`:** تحميل < 2.5 ثانية
- [ ] **صفحة `/tools/[slug]`:** تحميل < 2 ثوانٍ (SSG مسبقاً)
- [ ] **صفحة `/checkout`:** تحميل < 3 ثوانٍ (Client-side)
- [ ] **صفحة `/my-orders`:** تحميل < 3 ثوانٍ مع 10+ طلبات
- [ ] **لوحة الأدمن:** تحميل < 3 ثوانٍ مع 100+ طلب في `/admin/orders`

### 7.4 صور وأصول ثابتة

- [ ] **صور الأدوات:** 12 صورة WebP في `/images/tools/` — كل واحدة < 50 KB
- [ ] **صورة الباقة:** `/images/packages/growix-vip-package.webp` < 50 KB
- [ ] **Favicon:** `/favicon.ico` و `/icon.png` — حجمهما ~858 KB (⚠️ **ضخم جداً — يحتاج تحسين**)
- [ ] **Gzip/Brotli:** تأكد أن Vercel يضغط جميع الاستجابات

### 7.5 Database Performance

- [ ] **Query Time:** استعلامات الصفحة الرئيسية < 100ms
- [ ] **N+1 Queries:** لا يوجد N+1 في صفحات القوائم
- [ ] **Connection Pool:** Neon serverless يستخدم connection pooling

### 7.6 اختبارات الحِمل (Load Testing)

- [ ] **أداة مقترحة:** k6 أو Artillery
- [ ] **السيناريو:** 100 مستخدم متزامن يتصفحون الصفحة الرئيسية + صفحات الأدوات
- [ ] **الهدف:** Response time < 500ms تحت الحِمل
- [ ] **POST /api/track:** تأكد أنه لا يتأثر بالحِمل العالي (fire-and-forget)

---

## 8. اختبارات SEO والبيانات المنظمة

### 8.1 Meta Tags

لكل صفحة عامة، تأكد من:
- [ ] **title tag:** فريد وأقل من 60 حرف
- [ ] **meta description:** فريد وبين 120-160 حرف
- [ ] **canonical URL:** يشير للـ URL الصحيح
- [ ] **Open Graph:** `og:title`, `og:description`, `og:url`, `og:type`, `og:locale`
- [ ] **lang:** `ar-EG`

### 8.2 JSON-LD Structured Data (الصفحة الرئيسية `/`)

تأكد من وجود هذه الـ schemas في `<script type="application/ld+json">`:

- [ ] **Organization Schema:** اسم GROWIX + URL + logo
- [ ] **WebSite Schema:** searchAction + URL
- [ ] **Course Schema:** سعر `500` EGP + InStock
- [ ] **Product Schema:**
  - سعر `500` EGP
  - SKU: `growix-vip-package`
  - صورة: `/images/packages/growix-vip-package.webp`
  - 3 Reviews حقيقية (وليس 128 مزيفة)
- [ ] **ItemList Schema:** 12 أداة بالروابط الكاملة
- [ ] **FAQPage Schema:** أسئلة وأجوبة

### 8.3 JSON-LD لصفحات الأدوات (`/tools/[slug]`)

- [ ] **Product Schema:** لكل أداة مع السعر الصحيح (`200` أو `500` EGP)
- [ ] **FAQPage Schema:** أسئلة خاصة بالأداة
- [ ] **BreadcrumbList:** الرئيسية → الأدوات → اسم الأداة

### 8.4 Technical SEO

- [ ] **sitemap.xml:** يحتوي على جميع الصفحات العامة + صفحات الأدوات الـ 12
- [ ] **robots.txt:** يسمح للزحف على الصفحات العامة ويمنع `/admin`, `/api`, `/checkout`, `/my-orders`
- [ ] **OG Image:** `/opengraph-image` يولّد صورة ديناميكية مع السعر `500 ج فقط`
- [ ] **301 Redirect:** `grow-ix.vercel.app` → `growix.belalkaram.dev` (permanent redirect)
- [ ] **H1 وحيد:** كل صفحة تحتوي على `<h1>` واحد فقط
- [ ] **Heading Hierarchy:** H1 → H2 → H3 بالترتيب

### 8.5 أدوات الفحص المقترحة

- [ ] **Google Rich Results Test:** https://search.google.com/test/rich-results
- [ ] **Schema Markup Validator:** https://validator.schema.org
- [ ] **Lighthouse SEO Audit**
- [ ] **Ahrefs / Screaming Frog:** للفحص الشامل

---

## 9. اختبارات التجاوب والتوافق

### 9.1 Breakpoints للاختبار

| الحجم | العرض | الأجهزة |
|-------|-------|---------|
| Mobile S | 320px | iPhone SE |
| Mobile M | 375px | iPhone 12/13 |
| Mobile L | 425px | iPhone 14 Pro Max |
| Tablet | 768px | iPad |
| Laptop | 1024px | MacBook Air |
| Desktop | 1440px | شاشة عادية |
| 4K | 2560px | شاشة كبيرة |

### 9.2 اختبارات تجاوب محددة

- [ ] **الناف بار:** القائمة تتحول لـ hamburger menu على شاشات < 1024px
- [ ] **الشريط العلوي:** يظهر ويتحرك بسلاسة على جميع الأحجام
- [ ] **الشريط السفلي (Mobile):** يظهر فقط على شاشات < 640px
- [ ] **بطاقات الأدوات:** تتحول من 3 أعمدة → 2 → 1 على الشاشات الأصغر
- [ ] **جدول المقارنة في `/pricing`:** يمكن التمرير أفقياً على الموبايل
- [ ] **النصوص العربية (RTL):** جميع النصوص محاذاة لليمين بشكل صحيح
- [ ] **الأزرار والروابط:** حجم touch target ≥ 44x44px على الموبايل

### 9.3 Cross-Browser Testing

| المتصفح | الإصدار الأدنى |
|---------|---------------|
| Chrome | 90+ |
| Edge | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Samsung Internet | آخر إصدارين |

- [ ] **الأنيميشن:** `motion` (Framer Motion) يعمل على جميع المتصفحات
- [ ] **CSS Gradients:** التدرجات تظهر بشكل صحيح
- [ ] **Backdrop Blur:** `backdrop-blur-md` يعمل (قد لا يعمل على Firefox القديم)

---

## 10. اختبارات التعديلات البصرية

### 10.1 الأسعار (Price Consistency Check)

> **القاعدة:** باقة VIP = **500 ج** | باقة Premium = **500 ج** | أداة واحدة = **200 ج**

تأكد من عدم وجود أي نص يحتوي على `300 جنيه` أو `300ج` أو `300 ج` في أي مكان بالموقع:

- [ ] الشريط العلوي: `500 جنيه فقط`
- [ ] الشريط السفلي (موبايل): `500 جنية`
- [ ] الصفحة الرئيسية — PricingSection
- [ ] صفحة `/pricing` — الجدول والـ CTA
- [ ] صفحة `/course` — Schema + CTA
- [ ] صفحة `/data-bonus` — CTA
- [ ] صفحة `/tools` — CTA
- [ ] صفحة `/tools/[slug]` — Schema + CTA
- [ ] صفحة `/how-it-works` — الخطوة الأولى
- [ ] صفحة `/checkout` — بطاقات الباقات
- [ ] صورة OG (`/opengraph-image`): `500 ج فقط`

### 10.2 عدد الأدوات (Tool Count Consistency)

> **القاعدة:** العدد = **12 أداة** في كل مكان

- [ ] لا يوجد أي نص يقول "11 أداة" أو "11 برنامج"
- [ ] الشريط العلوي: `12 أداة تسويقية`
- [ ] بطاقات الأسعار
- [ ] جميع الـ CTA banners

### 10.3 الألوان والتصميم

| العنصر | اللون |
|--------|-------|
| **الخلفية الداكنة** | `#0B1220` |
| **الأخضر الرئيسي** | `#0F9D58` |
| **الأخضر الفاتح** | `#2ECC8F` |
| **الخلفية الفاتحة** | `#F7F9FA` |
| **نص رمادي** | `text-gray-600` |
| **تأثير hover** | `text-[#2ECC8F]` |

- [ ] **التدرج الأخضر (Gradient):** `from-[#0F9D58] to-[#2ECC8F]` متسق في جميع الأزرار
- [ ] **الزوايا الدائرية:** `rounded-2xl` أو `rounded-3xl` متسقة
- [ ] **الظلال:** `shadow-md` أو `shadow-xl` متسقة

### 10.4 الخطوط والطباعة

- [ ] **حجم خط الناف بار:** `text-sm sm:text-base font-extrabold` (تم تكبيره حديثاً)
- [ ] **العناوين الرئيسية:** `font-black` مع أحجام متدرجة
- [ ] **النصوص الوصفية:** `text-gray-600` مع `leading-relaxed`
- [ ] **اتجاه النص:** `dir="rtl"` على جميع الحاويات

---

## 11. اختبارات تجربة المستخدم (UX Testing)

### 11.1 User Flows الرئيسية

#### Flow 1: زائر جديد → اشتراك VIP
1. يدخل الصفحة الرئيسية → يرى العرض
2. يتصفح الأدوات → يقرأ التفاصيل
3. يضغط "اشترك الآن" → يُطلب منه تسجيل الدخول
4. يضغط "إنشاء حساب" → يسجل حساب جديد
5. يعود تلقائياً لـ `/checkout?package=bundle-vip`
6. يختار طريقة الدفع → يدخل البيانات → يرسل
7. يرى صفحة النجاح → ينتظر التفعيل
8. الأدمن يفعّل الطلب → المستخدم يرى الملفات في `/my-orders`

#### Flow 2: مشترك حالي → تحميل ملف
1. يسجل الدخول → يذهب لـ `/my-orders`
2. يرى طلبه المفعّل → يضغط "تحميل"
3. يتم توجيهه لرابط R2 الآمن → يبدأ التحميل

#### Flow 3: أدمن → تفعيل طلب
1. يسجل الدخول بحساب أدمن → يذهب لـ `/admin`
2. يتصفح الطلبات الجديدة في `/admin/orders`
3. يضغط "قبول" على طلب → يتغير الحالة لـ `approved`
4. المستخدم الآن يمكنه تحميل ملفاته

### 11.2 Edge Cases

- [ ] **مستخدم بدون طلبات:** صفحة `/my-orders` تعرض حالة فارغة مع CTA للاشتراك
- [ ] **طلب مرفوض:** تعرض رسالة واضحة مع خيار التواصل مع الدعم
- [ ] **انتهاء الجلسة:** إعادة التوجيه سلسة مع حفظ الصفحة المطلوبة
- [ ] **وضع الصيانة:** عند تفعيل `maintenance_mode = true` في الإعدادات، تظهر شاشة الصيانة (ما عدا الأدمن)
- [ ] **خطأ شبكة أثناء الدفع:** رسالة خطأ واضحة مع إمكانية إعادة المحاولة
- [ ] **تحميل متعدد لنفس الملف:** كل ضغطة تولد رابط جديد

---

## 12. اختبارات الـ Deployment والبنية التحتية

### 12.1 Build Process

- [ ] **`npm run build`:** ينجح بدون أخطاء (Exit Code 0)
- [ ] **`npx tsc --noEmit`:** لا يوجد أخطاء TypeScript حقيقية (أخطاء `.next/types` طبيعية بعد حذف الكاش)
- [ ] **عدد الصفحات:** 46 صفحة Static/SSG/Dynamic
- [ ] **SSG Pages:** صفحات الأدوات الـ 12 تُبنى مسبقاً

### 12.2 Vercel Deployment

- [ ] **Auto Deploy:** Push إلى `main` يبدأ deployment تلقائي
- [ ] **Environment Variables:** جميع المتغيرات معرفة في Vercel
- [ ] **301 Redirect:** `grow-ix.vercel.app/*` → `growix.belalkaram.dev/*`
- [ ] **Edge Runtime:** يعمل بدون أخطاء (ملاحظة: يُعطل Static Generation للصفحات التي تستخدمه)

### 12.3 Cloudflare R2

- [ ] **Bucket Access:** الملفات قابلة للتحميل عبر presigned URLs
- [ ] **Presigned URL Expiry:** تنتهي بعد 5 دقائق
- [ ] **File Listing:** `/admin/files` يعرض الملفات الموجودة في R2

### 12.4 Neon Database

- [ ] **Connection:** الاتصال يعمل من Vercel serverless functions
- [ ] **SSL:** الاتصال مشفر (`sslmode=require`)
- [ ] **Migrations:** `npm run db:push` يعمل بدون أخطاء

---

## 13. ملحق: بيانات الاختبار المرجعية

### 13.1 حسابات الاختبار

| الدور | البريد | كلمة المرور | ملاحظات |
|-------|--------|-------------|---------|
| Admin | *(يُنشأ عبر الـ Seed)* | *(من db/seed.ts)* | `role = admin` |
| User | *(يُسجل يدوياً)* | *(اختياري)* | `role = user` |

### 13.2 باقات الاختبار

| Package ID | الاسم | السعر |
|------------|-------|-------|
| `bundle-vip` | باقة VIP (كورس + 12 أداة + داتا) | 500 ج |
| `bundle-premium` | باقة Premium (12 أداة + داتا) | 500 ج |
| `single-tool` | برنامج واحد | 200 ج |

### 13.3 طرق الدفع

| الطريقة | التفاصيل |
|---------|---------|
| فودافون كاش | رقم التحويل من إعدادات الموقع |
| انستاباي | بيانات الحساب من إعدادات الموقع |
| تحويل بنكي | بيانات الحساب البنكي من إعدادات الموقع |

### 13.4 Slugs الأدوات الـ 12

```
whatsapp-marketing
facebook-marketing
telegram-marketing
instagram-automation
tiktok-automation
data-scraper
canva-alternative
video-editor
ai-video-generator
reach-booster
digital-marketing-course
egypt-marketing-data
```

### 13.5 أدوات الاختبار المقترحة

| الفئة | الأداة |
|-------|--------|
| Performance | Google Lighthouse, PageSpeed Insights, WebPageTest |
| Security | OWASP ZAP, Burp Suite, SecurityHeaders.com |
| SEO | Google Rich Results Test, Screaming Frog, Ahrefs |
| Load Testing | k6, Artillery, JMeter |
| Cross-Browser | BrowserStack, LambdaTest |
| Accessibility | axe DevTools, WAVE |
| Visual Regression | Percy, Chromatic, BackstopJS |
| API Testing | Postman, Insomnia, REST Client (VS Code) |

---

> **ملاحظة:** هذا الدليل يغطي الحالة الحالية للمشروع اعتباراً من أغسطس 2026.
> أي تحديثات مستقبلية على الميزات أو البنية يجب أن تنعكس هنا.

---

*تم إنشاء هذا الدليل تلقائياً بناءً على تحليل كامل لشفرة مشروع GROWIX.*
