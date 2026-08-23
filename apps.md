Searched for "r2"
Listed directory growix
Searched for "download"
Searched for "download"
Viewed files.ts:1-582
Viewed site.ts:1-483
Viewed r2.ts:1-104
Listed directory db
Viewed seed.ts:1-221
Searched for "packageFiles"
Searched for "fileKey"
Viewed seed_real_files.js:1-227
Viewed mega.ts:1-115

إليك الجدول الكامل والمفصل الذي يربط بين **اسم الأداة في الموقع** و**اسم الملف الفعلي (File Key) المرفوع على Cloudflare R2** مع الاسم والنسخة الحقيقية للبرنامج:

---

### 📌 إجابة سريعة على مثالك (واتساب سندر):
عند الضغط على تحميل **واتساب سندر (Anti-Block)**، يقوم الموقع بتحميل ملف اسمه في R2:
> **`WhatBotPlus_Business_Sender_v4_6_5_Full_Activated_ChatGPT_.zip`**  
> وهو برنامج: **WhatBotPlus Business Sender v4.6.5** (مفعل بالكامل ويدعم الذكاء الاصطناعي ChatGPT - حجمه حوالي 384.5 ميجابايت).

---

### 📋 جدول الربط الكامل لجميع برامج وأدوات GrowiX في R2:

| # | اسم الأداة في الموقع | اسم الملف في Cloudflare R2 (`fileKey`) | الاسم الفعلي للبرنامج والنسخة | الحجم |
|---|----------------------|-----------------------------------------|--------------------------------|-------|
| **1** | **برنامج التسويق المجاني على فيسبوك** | `FeedBolt_Facebook_Automation_Enterprise_v1_0_0_Full_Activated_.zip` | **FeedBolt Enterprise v1.0.0** | ~224 MB |

| **2** | **واتساب سندر (Anti-Block)** | `WhatBotPlus_Business_Sender_v4_6_5_Full_Activated_ChatGPT_.zip` | **WhatBotPlus Business Sender v4.6.5** | ~384.5 MB |

| **3** | **تليجرام سندر (Telegram Sender)** | `Telegram Sender Pro v9.0.0 Full Activated -.zip` | **Telegram Sender Pro v9.0.0** | ~60.3 MB |

| **4** | **انستجرام بوت (Instagram Bot)** | `Instagram Bot Pro v7.3.1 Full Activated -.zip` | **Instagram Bot Pro v7.3.1** | ~50 MB |

| **5** | **تيك توك بوت (TikTok Bot)** | `TikTok Bot Pro v3.7.0 Full Activated - .zip` | **TikTok Bot Pro v3.7.0** | ~49.6 MB |

| **6** | **أداة زيادة نسبة الوصول (Reach Booster)** | `Keyword Researcher Pro v13.259 Full Activated - .zip` | **Keyword Researcher Pro v13.259** | ~61.6 MB |

| **7** | **بديل كانفا + أتمتة السوشيال ميديا** | `Socinator Dominator Enterprise v1.0.0.172 Full Activated - .zip` | **Socinator Dominator Enterprise v1.0.0** | ~222.6 MB |

| **8** | **أداة مونتاج وتعديل الفيديو** | `Video Spin Blaster Pro Plus v2.45 Full Activated -.zip` | **Video Spin Blaster Pro Plus v2.45** | ~58.2 MB |

| **9** | **VideoScribe (موشن جرافيك ووايت بورد)** | `Sparkol_VideoScribe_Pro_3_14_2_x64_Full_Activated_Animated_Video.zip` | **Sparkol VideoScribe Pro v3.14.2 (x64)** | ~145.2 MB |

| **10** | **أداة سحب الداتا (Data Scraper Pro)** | `Social Phone Extractor Pro v7.0.0 Full Activated - W..zip` | **Social Phone Extractor Pro v7.0.0** | ~51.6 MB |

| **11** | **دولينجو مفتوح كل المميزات** | `Duolingo Max Premium v6.35.3 Full Activated - new  (2).apk` | **Duolingo Max Premium v6.35.3 (APK)** | ~88.9 MB |

| **🎁** | **هدية داتا مصر التسويقية الشاملة** | `data/Data masr.rar` | **قاعدة بيانات داتا مصر التسويقية** | ~106.1 MB |

---

### 💡 ملاحظة تقنية:
* يتم تخزين هذه الملفات داخل جدول [`package_files`](file:///d:/projects/growix/lib/actions/files.ts#L13-L28) في قاعدة البيانات.
* مسار التحميل التلقائي عبر المنصة يكون عبر الرابط الآمن:  
  `https://yourdomain.com/api/download?orderId=...&fileKey=...`  
  والذي يقوم بدوره بإنشاء رابط تحميل مؤقت محمي وموقّع (Presigned URL) مباشرة من Cloudflare R2 عبر دالة [`generatePresignedDownloadUrl`](file:///d:/projects/growix/lib/r2.ts#L76-L84).