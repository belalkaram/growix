export interface MarketingTool {
  id: string;
  number: number;
  name: string;
  category: 'social' | 'messaging' | 'design' | 'ai' | 'data';
  badge?: string;
  shortDesc: string;
  longDesc?: string;
  features: string[];
  iconName: string; // Lucide icon identifier
}

export interface PricingPackage {
  id: string;
  name: string;
  badge?: string;
  isPopular?: boolean;
  originalPrice: string;
  discountedPrice: string;
  currency: string;
  period: string;
  description: string;
  features: { text: string; included: boolean; highlight?: boolean }[];
  ctaText: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar: string;
  content: string;
  rating: number;
  verified: boolean;
  packageTaken: string;
}

export const SITE_PRICING = {
  // Baket VIP (الجديدة - كورسات + أدوات + داتا)
  vipPackagePrice: '500',
  vipPackageOriginalPrice: '2000',
  vipPackageCtaText: 'احصل على الباقة VIP بـ 500 ج',

  // Baket Premium (الـ 12 أداة + الداتا)
  fullPackagePrice: '300',
  fullPackageOriginalPrice: '1200',
  fullPackageCtaText: 'احصل على باقة Premium بـ 300 ج',

  // Baket Single Tool
  singleToolPrice: '200',
  singleToolOriginalPrice: '700',
  singleToolCtaText: 'اختر برنامجك واشترك بـ 200 ج',

  currency: 'جنية',
};

export const PROMO_BAR_CONFIG = {
  enabled: true,
  discount: '75%',
  customerLimit: '100 عميل',
  toolCount: '12 أداة تسويقية',
  price: '500 جنيه فقط',
  textPart1: '🔥 خصم 75% لأول 100 عميل فقط — الحق بسرعة!',
  textPart2: 'احصل على الكورس الشامل و 12 أداة بسعر 500 جنيه فقط.',
  badgeText: 'عرض لفترة محدودة',
  animationDurationSeconds: 22,
};

export const SITE_CONFIG = {
  name: 'GROWIX',
  tagline: 'منصة التسويق الإلكتروني الشاملة وحزمة الـ 12 أداة تسويقية',
  heroTitle: 'اتعلّم التسويق الإلكتروني... وامتلك 12 أداة تسويق ذكية في مكان واحد',
  heroSubtitle: ' احصل على أقوى كورس تسويق إلكتروني عملي في الوطن العربي + 12 برنامج وأداة تسويقية احترافية لزيادة مبيعاتك وتكبير عملك تلقائياً + هدية داتا مصر التسويقية.',

  // Contact & Payment Details
  whatsappNumber: '966507988705', // رقم الواتساب الموحد
  whatsappDisplayNumber: '+966507988705',
  telegramUsername: 'growix_official',
  supportEmail: 'growix@belalkaram.dev',
  workingHours: 'تفعيل فوري خلال أقل من ساعة | دعم فني على مدار 24/7',

  // Payment Numbers (محفظة إلكترونية / إنستاباي)
  paymentMethods: [
    {
      id: 'electronic-wallet',
      name: 'محفظة إلكترونية (فودافون كاش / اتصالات / أورنج / وي)',
      number: '01019033661',
      type: 'رقم المحفظة الإلكترونية',
      icon: 'smartphone',
      instructions: 'قم بتحويل المبلغ المطلوبة من أي محفظة إلكترونية إلى الرقم أعلاه.'
    },
    {
      id: 'instapay',
      name: 'إنستاباي (InstaPay)',
      number: '01019033661',
      type: 'رقم حساب أو عنوان إنستاباي (IPA)',
      icon: 'credit-card',
      instructions: 'قم بالتحويل اللحظي المباشر عبر تطبيق إنستاباي إلى رقم الهاتف أو العنوان أعلاه.'
    }
  ],

  // Trust Statistics
  stats: [
    { value: '+5,000', label: 'طالب ومسوق ناجح' },
    { value: '11', label: 'أداة وتسويق تلقائي' },
    { value: '100%', label: 'شرح فيديو + دعم فني' },
    { value: '< 60 دقيقة', label: 'تفعيل وتدريب فوري' },
  ],

  // Tools List
  tools: [
    {
      id: 'facebook-bot',
      number: 1,
      name: 'برنامج التسويق المجاني على فيسبوك',
      category: 'social',
      badge: 'الأكثر استخدماً',
      shortDesc: 'نشر وجدولة وإدارة الحملات المجانية على مئات المجموعات والصفحات.',
      features: [
        'نشر وجدولة بوستات وفيديوهات على مئات المجموعات والصفحات بضغطة واحدة',
        'زيادة متابعين وتفاعل الصفحات والمجموعات بشكل ملحوظ',
        'حملات رسائل ماسنجر غير محدودة يومياً + إعادة إرسال للمراسلين السابقين',
        'رد تلقائي ذكي على التعليقات والرسائل في ثوانٍ'
      ],
      iconName: 'facebook'
    },
    {
      id: 'whatsapp-sender',
      number: 2,
      name: 'واتساب سندر (Anti-Block)',
      category: 'messaging',
      badge: 'ضد الحظر',
      shortDesc: 'إرسال حملات واتساب حتى 1000 رسالة يومياً بدون حظر وسحب داتا الجروبات.',
      features: [
        'إرسال حتى 1000 رسالة واتساب يومياً بأمان تام وتقنية Anti-Block',
        'سحب أرقام الأعضاء وداتا المجموعات المهتمة بمجالك المستهدف',
        'جدولة الرسائل وإرسال الوسائط والملفات والروابط',
        'تخصيص الرسائل بأسماء العملاء تلقائياً'
      ],
      iconName: 'message-square'
    },
    {
      id: 'telegram-sender',
      number: 3,
      name: 'تليجرام سندر (Telegram Sender)',
      category: 'messaging',
      badge: 'عملاء مستهدفين',
      shortDesc: 'إرسال رسائل بكميات ضخمة وزيادة أعضاء القنوات وسحب داتا الجروبات.',
      features: [
        'إرسال رسائل بكميات كبيرة جداً بضغطة زر واحدة',
        'زيادة أعضاء مجموعات وقنوات التليجرام الخاصة بك',
        'سحب داتا وأعضاء الجروبات المنافسة والمهتمة بنشاطك',
        'إدارة عدة حسابات تليجرام في نفس الوقت'
      ],
      iconName: 'send'
    },
    {
      id: 'instagram-bot',
      number: 4,
      name: 'انستجرام بوت (Instagram Bot)',
      category: 'social',
      badge: 'تفاعل تلقائي',
      shortDesc: 'زيادة المتابعين المستهدفين ورد تلقائي على الرسائل والكومنتات.',
      features: [
        'زيادة متابعين انستجرام الحقيقيين حسب مجالك المستهدف',
        'رد تلقائي فوري على التعليقات وعلى رسائل الخاص (DM)',
        'إرسال رسائل تسويقية جماعية للعملاء والمتابعين',
        'أتمتة الفولو واللايك للجمهور المستهدف'
      ],
      iconName: 'instagram'
    },
    {
      id: 'tiktok-bot',
      number: 5,
      name: 'تيك توك بوت (TikTok Bot)',
      category: 'social',
      badge: 'انتشار سريع',
      shortDesc: 'تكبير حساب التيك توك وأتمتة الردود والرسائل المباشرة.',
      features: [
        'زيادة متابعين تيك توك وتوسيع قاعدة جمهورك المهتم',
        'رد تلقائي على تعليقات الفيديوهات والرسائل بذكاء',
        'إرسال رسائل جماعية للجمهور المهتم بمنتجك',
        'رفع نسبة وصول الفيديوهات وتصدر النتائج'
      ],
      iconName: 'video'
    },
    {
      id: 'reach-booster',
      number: 6,
      name: 'Keyword Researcher Pro (باحث الكلمات المفتاحية)',
      category: 'social',
      badge: 'تصدر النتائج',
      shortDesc: 'استخراج أسرار الكلمات المفتاحية لمضاعفة الريتش والوصول المجاني.',
      features: [
        'استخراج الكلمات المفتاحية والدلالية الأكثر بحثاً لأي مجال',
        'توليد هاشتاجات وكلمات سرية لزيادة الـ Reach والظهور',
        'تضمين الكلمات في المنشورات لتصدر محركات البحث',
        'تحليل المنافسين ومعرفة سبب تصدر منشوراتهم'
      ],
      iconName: 'trending-up'
    },
    {
      id: 'canva-alternative',
      number: 7,
      name: 'Socinator Dominator Enterprise (أتمتة السوشيال ميديا الشاملة)',
      category: 'design',
      badge: 'تصميم + أتمتة',
      shortDesc: 'إنشاء وجدولة المحتوى والتصاميم على كل منصات السوشيال ميديا تلقائياً مع تصميم الإعلانات.',
      features: [
        'عمل أفضل التصميمات التسويقية والإعلانات الجذابة',
        'التعديل على الصور وإزالة الخلفيات باحترافية بضغطة زر',
        'قوالب جاهزة للسوشيال ميديا، اللوجوهات، والمطبوعات',
        'بدون اشتراكات شهرية مكلفة - جميع المميزات متاحة'
      ],
      iconName: 'palette'
    },
    {
      id: 'video-editor',
      number: 8,
      name: 'أداة مونتاج وتعديل الفيديو',
      category: 'design',
      badge: 'فيديوهات احترافية',
      shortDesc: 'صناعة ومونتاج الفيديوهات التسويقية والـ Reels والـ Shorts بأسلوب جذاب.',
      features: [
        'عمل فيديوهات تسويقية احترافية مع التعديل والمونتاج السريع',
        'إضافة المؤثرات، النصوص المتحركة، والانتقالات البصرية',
        'تفريغ وتعديل الصوت وإضافة الموسيقى والإضاءة',
        'تصدير الفيديوهات بأعلى جودة لمختلف المنصات'
      ],
      iconName: 'film'
    },
    {
      id: 'videoscribe-ai',
      number: 9,
      name: 'VideoScribe (موشن جرافيك ووايت بورد)',
      category: 'design',
      badge: 'ذكاء اصطناعي',
      shortDesc: 'صناعة فيديوهات الرسوم المتحركة والـ Whiteboard بأسلوب شائق.',
      features: [
        'إنشاء فيديوهات رسوم متحركة بالذكاء الاصطناعي بسهولة',
        'صناعة فيديوهات وايت بورد (Whiteboard Animation) احترافية',
        'مكتبة رسم وأشكال وصور متحركة ضخمة جاهزة للاستخدام',
        'مناسب جداً لصناع المحتوى والإعلانات التوضيحية'
      ],
      iconName: 'sparkles'
    },
    {
      id: 'data-scraper',
      number: 10,
      name: 'أداة سحب الداتا (Data Scraper Pro)',
      category: 'data',
      badge: 'كنز تسويقي',
      shortDesc: 'سحب أرقام وداتا العملاء من فيسبوك وانستجرام وجوجل مابس وجروبات.',
      features: [
        'سحب أرقام الموبايل والبيانات من صفحات ومجموعات وبوستات الفيسبوك',
        'استخراج داتا المستهدفين من انستجرام ويلوبيدج (Yellow Pages)',
        'سحب أرقام وأنشطة المحلات والشركات من جوجل مابس (Google Maps)',
        'تصدير الداتا المستخرجة إلى ملفات Excel مرتبة وجاهزة للاستخدام'
      ],
      iconName: 'database'
    },
    {
      id: 'duolingo-unlocked',
      number: 12,
      name: 'دولينجو مفتوح (كل المستويات والمميزات المدفوعة)',
      category: 'ai',
      badge: 'هدية تعليمية',
      shortDesc: 'تعلم جميع اللغات بكل المميزات المدفوعة مفتوحة بالكامل بدون حدود.',
      features: [
        'تعلم الإنجليزية وجميع لغات العالم بطلاقة',
        'فتح جميع المستويات والدروس والاختبارات المدفوعة (Super Unlocked)',
        'قلوب غير محدودة وبدون إعلانات مزعجة نهائياً',
        'ميزة إضافية ممتعة لتطوير مهاراتك اللغوية والشخصية'
      ],
      iconName: 'languages'
    }
  ] as MarketingTool[],

  // Bonus Item Details
  bonus: {
    title: 'هدية إضافية حصريّة: داتا مصر التسويقية',
    subtitle: 'قاعدة بيانات تسويقية ضخمة محدثة ومقسمة بدقة عالية',
    features: [
      'مقسمة ومفلترة حسب جميع المحافظات المصرية (القاهرة، الجيزة، الإسكندرية، الدلتا، الصعيد...)',
      'مصنفة حسب مجالات وأنشطة تجارية متخصصة (عقارات، ملابس، سيارات، أطباء، مهندسين، تجارة إلكترونية...)',
      'جاهزة فوراً للاستخدام المباشر في حملات واتساب سندر، تليجرام، وإعلانات فيسبوك الموجهة',
      'توفّر عليك شهور من البحث والمجهود وتمنحك الوصول الفوري للعميل المهتم بمجالك'
    ]
  },

  // Course Details
  course: {
    title: 'كورس التسويق الإلكتروني الكامل من الصفر للاحتراف',
    subtitle: 'أقوى كورس تسويق إلكتروني عملي تطبيقي بفيديوهات مسجلة شرح صوت وصورة خطوة بخطوة',
    description: 'كورس مرن وشامل يعلّمك كيف تخطط، تنفذ، وتدير حملات إعلانية ناجحة تحقق لك أعلى عائد على الاستثمار (ROI). لا تحتاج لأي خبرة سابقة، فنحن نأخذ بيديك من الأساسيات وحتى احتراف إعلانات منصات التواصل وإدارة الحملات.',
    topics: [
      'أساسيات التسويق الرقمي وبناء الاستراتيجية التسويقية الناجحة',
      'إنشاء وحماية إدارة الأعمال (Meta Business Manager) والحسابات الإعلانية',
      'كتابة النصوص الإعلانية (Copywriting) وصناعة المحتوى البيعي المؤثر',
      'استهداف الجمهور الصح وتحديد العميل المثالي بدقة عالية',
      'إدارة وتنفيذ إعلانات فيسبوك وانستجرام المتقدمة وتحسين ميزانية الحملات',
      'إعلانات جوجل، تيك توك، وتفريغ نتائج الحملات وتحليل البيانات',
      'كيفية استخدام أدوات الـ 12 الذكية المرفقة لربطها بالحملات ومضاعفة النتائج'
    ],
    audience: [
      {
        title: 'المبتدئون والشغوفون',
        desc: 'تريد دخول مجال التسويق الرقمي والعمل أونلاين أو الربح كفريلانسر بدون خبرة سابقة.'
      },
      {
        title: 'أصحاب المشاريع والشركات',
        desc: 'تريد زيادة مبيعات متجرك أو شركتك وتقليل تكلفة الإعلانات بدون الاعتماد على وكالات مكلفة.'
      },
      {
        title: 'أصحاب الصفحات والمتاجر الإلكترونية',
        desc: 'تريد أتمتة الردود والرسائل وسحب داتا المنافسين وتكبير وصول منشوراتك.'
      },
      {
        title: 'المسوّقون والفريلانسرز',
        desc: 'تريد امتلك أدوات احترافية سريعة تنجز لك عمل عملائك في دقائق وتمنحك ميزة تنافسية.'
      }
    ]
  },

  // How it works steps
  steps: [
    {
      number: '01',
      title: 'اختر الباقة المناسبة',
      desc: 'اضغط على زر "اشترك الآن" واختر الباقة التي تلبي احتياجاتك وأهدافك التسويقية.'
    },
    {
      number: '02',
      title: 'حوّل المبلغ بسهولة',
      desc: 'استخدم رقم التحويل الخاص بـ (فودافون كاش أو إنستاباي أو المحفظة البنكية).'
    },
    {
      number: '03',
      title: 'أرسل إثبات الدفع',
      desc: 'اضغط زر الواتساب ليفتح معك مباشرة محادثة جاهزة مرفقاً بها صورة إيصال التحويل.'
    },
    {
      number: '04',
      title: 'استلم وتفعّل خلال ساعة',
      desc: 'يقوم فريق GROWIX بتفعيل الكورس والأدوات وإرسال روابط الوصول والدعم الفني فوراً.'
    }
  ],

  // Pricing Packages
  packages: [
    {
      id: 'bundle-vip',
      name: 'باقة VIP الشاملة (كورسات + الـ 12 أداة + الداتا)',
      badge: '💎 الأقوى - الكل في واحد',
      isPopular: true,
      originalPrice: SITE_PRICING.vipPackageOriginalPrice,
      discountedPrice: SITE_PRICING.vipPackagePrice,
      currency: SITE_PRICING.currency,
      period: 'تفعيل مدى الحياة بدون اشتراكات',
      description: 'الباقة الذهبية الشاملة: كورسات التسويق الكاملة (أكثر من 1 تيرابايت) + جميع الأدوات الـ 12 + هدية داتا مصر. كل ما تحتاجه في مكان واحد.',
      features: [
        { text: 'أكثر من 1 تيرابايت كورسات تسويق إلكتروني متكاملة وسحابية', included: true, highlight: true },
        { text: 'جميع الأدوات التسويقية الـ 12 كاملة بجميع مميزاتها', included: true, highlight: true },
        { text: 'شرح فيديو بصوت وصورة عملي لكل أداة وطريقة ربطها بالحملات', included: true },
        { text: 'هدية مجانية: داتا مصر التسويقية (مقسمة بالمحافظات والأنشطة)', included: true, highlight: true },
        { text: 'دعم فني مباشر 24/7 عبر الواتساب وتحديثات مجانية مستمرة', included: true }
      ],
      ctaText: SITE_PRICING.vipPackageCtaText
    },
    {
      id: 'bundle-premium',
      name: 'باقة Premium (الـ 12 أداة + الداتا)',
      badge: '⭐ الأكثر طلباً - وفّر أكثر',
      isPopular: false,
      originalPrice: SITE_PRICING.fullPackageOriginalPrice,
      discountedPrice: SITE_PRICING.fullPackagePrice,
      currency: SITE_PRICING.currency,
      period: 'تفعيل مدى الحياة بدون اشتراكات',
      description: 'احصل على جميع الأدوات الـ 12 بالكامل + هدية داتا مصر التسويقية. بدون الكورسات.',
      features: [
        { text: 'جميع الأدوات التسويقية الـ 12 كاملة بجميع مميزاتها', included: true, highlight: true },
        { text: 'شرح فيديو بصوت وصورة عملي لكل أداة وطريقة ربطها بالحملات', included: true },
        { text: 'هدية مجانية: داتا مصر التسويقية (مقسمة بالمحافظات والأنشطة)', included: true, highlight: true },
        { text: 'دعم فني مباشر 24/7 عبر الواتساب وتحديثات مجانية مستمرة', included: true },
        { text: 'كورسات التسويق الإلكتروني الشاملة (+1 TB)', included: false }
      ],
      ctaText: SITE_PRICING.fullPackageCtaText
    },
    {
      id: 'single-tool',
      name: 'باقة برنامج واحد فقط',
      badge: 'اختر برنامجك المفضل',
      isPopular: false,
      originalPrice: SITE_PRICING.singleToolOriginalPrice,
      discountedPrice: SITE_PRICING.singleToolPrice,
      currency: SITE_PRICING.currency,
      period: 'تفعيل دائم للبرنامج المختار',
      description: 'اختر أي أداة واحدة محددة من ترسانة أدواتنا الـ 12 المتاحة واحصل على تفعيلها وشرحها فوراً.',
      features: [
        { text: 'برنامج واحد فقط من اختيارك (من بين الـ 12 أداة)', included: true, highlight: true },
        { text: 'فيديو شرح كامل للبرنامج المختار خطوة بخطوة', included: true },
        { text: 'دعم فني وتفعيل سريع للبرنامج المختار', included: true },
        { text: 'هدية مجانية: داتا مصر التسويقية', included: true, highlight: true },
        { text: 'باقي البرامج الـ 11 والكورسات الشاملة', included: false }
      ],
      ctaText: SITE_PRICING.singleToolCtaText
    }
  ] as PricingPackage[],

  // Frequently Asked Questions
  faqs: [
    {
      question: 'كيف أحصل على الكورس والأدوات بعد التحويل؟',
      answer: 'بمجرد تحويل المبلغ وإرسال صورة إيصال التحويل عبر الواتساب، يتلقى فريق الدعم الطلب ويتم تفعيل حسابك وإرسال روابط الكورس وتنزيل الأدوات مع السيريال والشرح خلال أقل من 60 دقيقة.'
    },
    {
      question: 'هل الأدوات والبرامج سهلة الاستخدام وتتضمن شرحاً؟',
      answer: 'نعم بالتأكيد! كل أداة من الأدوات الـ 12 مرفق معها فيديو شرح عملي ومفصل بصوت وصورة يوضح كيفية تثبيتها وتشغيلها خطوة بخطوة بكل سهولة، بالإضافة لوجود الدعم الفني لمساعدتك.'
    },
    {
      question: 'هل تحتاج أدوات الإرسال مثل واتساب وتليجرام لخبرة برمجية؟',
      answer: 'لا أبداً! جميع الأدوات مصممة بواجهات بسيطة جداً وتعمل بنقرة زر واحدة بدون أي أكواد أو برمجة، وتناسب الجميع سواء مبتدئ أو محترف.'
    },
    {
      question: 'ما هي طرق الدفع المتاحة للتحويل؟',
      answer: 'يمكنك التحويل عبر فودافون كاش (Vodafone Cash)، أو إنستاباي (InstaPay)، أو أي محفظة إلكترونية بنكية أو هاتفية في مصر. الدفع يدوي بآمان وسهولة.'
    },
    {
      question: 'هل الأدوات آمنة ولا تسبب حظر لحساباتي؟',
      answer: 'نعم، تم تزويد أدوات مثل واتساب سندر بتقنيات المحاكاة البشرية والـ Anti-Block والفواصل الزمنية الذكية لحماية حساباتك والعمل بأمان تام.'
    },
    {
      question: 'ما هي "داتا مصر التسويقية" الهدية؟',
      answer: 'هي قاعدة بيانات ضخمة ومقسمة وفقاً للمحافظات المصرية والأنشطة التجارية المختلفة (عقارات، تجارة، أطباء، الخ)، تمكنك من توجيه حملاتك الإعلانية والرسائل المباشرة لعملاء مهتمين فعلياً.'
    },
    {
      question: 'هل يضم الكورس والأدوات أي اشتراكات شهرية متكررة؟',
      answer: 'لا! الاشتراك لمرة واحدة فقط وتحصل على وصول دائم وتحديثات مستمرة بدون أي مصاريف إضافية أو اشتراكات شهرية.'
    }
  ] as FAQItem[],

  // Testimonials
  testimonials: [
    {
      id: '1',
      name: 'مهندس أحمد مصطفى',
      role: 'صاحب شركة تسويق وتجارة إلكترونية',
      avatar: 'https://picsum.photos/seed/user1/150/150',
      content: 'أداة واتساب سندر وفايسبوك بوت اختصروا عليّ عمل فريق كامل! المبيعات تضاعفت 3 أضعاف خلال أول أسبوع استخدام، والجميل إن الشرح الفيديو سهل جداً والدعم معيا خطوة بخطوة.',
      rating: 5,
      verified: true,
      packageTaken: 'الباقة الشاملة VIP'
    },
    {
      id: '2',
      name: 'سارة إبراهيم',
      role: 'صانعة محتوى ومسوّقة فريلانسر',
      avatar: 'https://picsum.photos/seed/user2/150/150',
      content: 'الكورس شرحه ممتاز ومباشر من غير رغي، وSocinator Dominator وأداة مونتاج الفيديو ساعدوني جداً في إنجاز إعلانات عملائي بسرعة وبدون اشتراكات شهرية. أفضل استثمار عملته في شغلي.',
      rating: 5,
      verified: true,
      packageTaken: 'الباقة الشاملة VIP'
    },
    {
      id: '3',
      name: 'محمود العطار',
      role: 'صاحب معرض ملابس ومحل تجاري',
      avatar: 'https://picsum.photos/seed/user3/150/150',
      content: 'داتا مصر التسويقية المرفقة كانت هدية قيمة جداً! قدرت أوصل لعملاء محافظتي بسهولة من خلال الواتساب سندر، وفعلوا لي الحساب في أقل من نص ساعة بعد التحويل.',
      rating: 5,
      verified: true,
      packageTaken: 'باقة الأدوات الـ 12'
    }
  ] as Testimonial[]
};
