import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  boolean, 
  timestamp, 
  jsonb, 
  serial, 
  uuid 
} from 'drizzle-orm/pg-core';

// 1. Users Table (Admin & Registered Users)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).default('user').notNull(), // 'admin' | 'user'
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
});

// 2. Packages Table (Pricing Packages)
export const packages = pgTable('packages', {
  id: varchar('id', { length: 100 }).primaryKey(), // e.g. 'bundle-vip', 'single-tool'
  name: varchar('name', { length: 255 }).notNull(),
  badge: varchar('badge', { length: 100 }),
  isPopular: boolean('is_popular').default(false).notNull(),
  originalPrice: varchar('original_price', { length: 50 }).notNull(),
  discountedPrice: varchar('discounted_price', { length: 50 }).notNull(),
  currency: varchar('currency', { length: 20 }).default('جنية').notNull(),
  period: varchar('period', { length: 100 }).notNull(),
  description: text('description').notNull(),
  features: jsonb('features').notNull(), // { text: string; included: boolean; highlight?: boolean }[]
  ctaText: varchar('cta_text', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Tools Table (The 12 Marketing Tools)
export const tools = pgTable('tools', {
  id: varchar('id', { length: 100 }).primaryKey(), // e.g. 'facebook-bot'
  slug: varchar('slug', { length: 100 }).notNull().unique(), // e.g. 'facebook-marketing'
  number: integer('number').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // social | messaging | design | ai | data
  badge: varchar('badge', { length: 100 }),
  shortDesc: text('short_desc').notNull(),
  longDesc: text('long_desc'),
  features: jsonb('features').notNull(), // string[]
  iconName: varchar('icon_name', { length: 50 }).notNull(), // Lucide icon identifier
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Tools SEO Data Table (Page-level Metadata & Schemas)
export const toolsSeo = pgTable('tools_seo', {
  toolId: varchar('tool_id', { length: 100 }).primaryKey().references(() => tools.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  metaTitle: varchar('meta_title', { length: 255 }).notNull(),
  metaDescription: text('meta_description').notNull(),
  h1: varchar('h1', { length: 255 }).notNull(),
  h2Keywords: jsonb('h2_keywords').notNull(), // string[]
  keywords: jsonb('keywords').notNull(), // string[]
  faqItems: jsonb('faq_items').notNull(), // { question: string; answer: string }[]
  schemaName: varchar('schema_name', { length: 255 }).notNull(),
  schemaDescription: text('schema_description').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Site Settings Table (Key/Value General Config)
export const siteSettings = pgTable('site_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Testimonials Table (Customer Reviews)
export const testimonials = pgTable('testimonials', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  avatar: text('avatar').notNull(),
  content: text('content').notNull(),
  rating: integer('rating').default(5).notNull(),
  verified: boolean('verified').default(true).notNull(),
  packageTaken: varchar('package_taken', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 7. FAQs Table
export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: varchar('category', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Page Views Table (Internal Analytics)
export const pageViews = pgTable('page_views', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 100 }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  path: varchar('path', { length: 500 }).notNull(),
  referrer: varchar('referrer', { length: 500 }),
  utmSource: varchar('utm_source', { length: 200 }),
  utmMedium: varchar('utm_medium', { length: 200 }),
  utmCampaign: varchar('utm_campaign', { length: 200 }),
  country: varchar('country', { length: 10 }),
  deviceType: varchar('device_type', { length: 20 }), // 'mobile' | 'desktop'
  durationSeconds: integer('duration_seconds').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Orders Table (Subscription Orders for Admin Approval)
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  packageId: varchar('package_id', { length: 100 }).notNull(),
  toolId: varchar('tool_id', { length: 100 }),
  paymentMethod: varchar('payment_method', { length: 100 }).notNull(),
  paymentProvider: varchar('payment_provider', { length: 50 }), // 'vodafone_cash' | 'instapay' | 'other'
  senderNumber: varchar('sender_number', { length: 100 }).notNull(),
  amount: varchar('amount', { length: 50 }).notNull(),
  originalAmount: varchar('original_amount', { length: 50 }),
  discountAmount: varchar('discount_amount', { length: 50 }),
  couponCode: varchar('coupon_code', { length: 50 }),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  approvalType: varchar('approval_type', { length: 20 }).default('manual'), // 'manual' | 'auto'
  matchedTransactionId: varchar('matched_transaction_id', { length: 100 }),
  receiptUrl: varchar('receipt_url', { length: 1000 }), // Cloudflare R2 public URL for payment proof
  receiptKey: varchar('receipt_key', { length: 500 }), // Cloudflare R2 object key for deletion/cleanup
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 9.1. Payment Transactions Table (Vodafone Cash & Automated Payment Ingestion)
export const paymentTransactions = pgTable('payment_transactions', {
  id: serial('id').primaryKey(),
  transactionId: varchar('transaction_id', { length: 100 }).notNull().unique(), // PostgreSQL UNIQUE constraint for idempotency
  provider: varchar('provider', { length: 50 }).default('vodafone_cash').notNull(),
  amount: varchar('amount', { length: 50 }).notNull(), // Exact string representation e.g. "320.00"
  amountCents: integer('amount_cents').notNull(), // Integer minor units e.g. 32000 (320.00 EGP) for exact arithmetic
  senderPhone: varchar('sender_phone', { length: 50 }).notNull(), // Normalized phone e.g. "01205798578"
  senderName: varchar('sender_name', { length: 255 }), // Extracted customer name
  walletPhone: varchar('wallet_phone', { length: 50 }).notNull(), // Receiving company wallet
  referenceId: varchar('reference_id', { length: 100 }), // e.g. InstaPay reference
  transactionTimestamp: timestamp('transaction_timestamp'), // Full parsed timestamp (UTC/Cairo aligned)
  rawTransactionDate: varchar('raw_transaction_date', { length: 50 }), // e.g. "26-08-09"
  rawTransactionTime: varchar('raw_transaction_time', { length: 50 }), // e.g. "13:54"
  rawMessage: text('raw_message').notNull(), // Full raw SMS text
  status: varchar('status', { length: 50 }).notNull(), // 'WOULD_AUTO_APPROVE' | 'AUTO_APPROVED' | 'REVIEW_REQUIRED' | 'DUPLICATE' | 'NO_MATCH' | 'AMBIGUOUS' | 'INVALID_MESSAGE' | 'WRONG_WALLET' | 'AMOUNT_MISMATCH' | 'PHONE_MISMATCH' | 'TIME_MISMATCH' | 'FAILED'
  matchedOrderId: uuid('matched_order_id').references(() => orders.id, { onDelete: 'set null' }),
  reviewReason: text('review_reason'), // Detailed audit reason for review or rejection
  metadata: jsonb('metadata'), // Extra payload context (client ip, candidates list, dryRun flags)
  isDryRun: boolean('is_dry_run').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
});

// 10. Package Files Table (Cloudflare R2 Files Mapping)
export const packageFiles = pgTable('package_files', {
  id: serial('id').primaryKey(),
  packageId: varchar('package_id', { length: 100 }).notNull(), // 'bundle-vip' | 'single-tool' | 'all'
  toolId: varchar('tool_id', { length: 100 }), // null for general files or specific tool ID e.g. 'facebook-bot'
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileKey: varchar('file_key', { length: 500 }).notNull().unique(), // R2 object key
  fileSize: text('file_size'), // e.g. "45 MB"
  fileType: varchar('file_type', { length: 50 }).default('zip').notNull(),
  category: varchar('category', { length: 50 }).default('tool').notNull(), // 'tool' | 'course' | 'data' | 'bonus'
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// 11. Tool Videos Table (Tutorial Videos for My-Orders Page)
export const toolVideos = pgTable('tool_videos', {
  id: serial('id').primaryKey(),
  toolId: varchar('tool_id', { length: 100 }), // null = general/course video, specific = e.g. 'facebook-bot'
  title: varchar('title', { length: 255 }).notNull(),
  videoUrl: text('video_url').notNull(), // YouTube, Vimeo, or direct link
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 12. MEGA Links Table (Courses & Content MEGA Folder Links per Package)
export const megaLinks = pgTable('mega_links', {
  id: serial('id').primaryKey(),
  packageId: varchar('package_id', { length: 100 }).notNull(), // 'bundle-vip' | 'bundle-premium' | 'all'
  title: varchar('title', { length: 255 }).notNull(), // e.g. "كورس التسويق الشامل على فيسبوك"
  description: text('description'), // e.g. "أكثر من 1 تيرابايت محتوى تعليمي حصري"
  megaUrl: text('mega_url').notNull(), // The MEGA folder/file link
  sizeLabel: varchar('size_label', { length: 50 }), // e.g. "1 TB" | "500 GB"
  contentCount: varchar('content_count', { length: 100 }), // e.g. "200+ فيديو"
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 13. Coupons Table (Admin Discount Coupons)
export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(), // e.g. 'GROWIX20'
  discountPercent: integer('discount_percent').notNull(), // Discount percentage, e.g. 20 for 20%
  validFrom: timestamp('valid_from').defaultNow().notNull(),
  validUntil: timestamp('valid_until').notNull(),
  usageLimit: integer('usage_limit').default(100), // Maximum number of users allowed to use this coupon
  usedCount: integer('used_count').default(0).notNull(), // Current count of uses
  isActive: boolean('is_active').default(true).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 14. Coupon Usages Table (Tracking which users used which coupon)
export const couponUsages = pgTable('coupon_usages', {
  id: serial('id').primaryKey(),
  couponId: uuid('coupon_id').notNull().references(() => coupons.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  discountApplied: varchar('discount_applied', { length: 50 }).notNull(),
  usedAt: timestamp('used_at').defaultNow().notNull(),
});

// 15. Security Logs & Rate Limiting Table
export const securityLogs = pgTable('security_logs', {
  id: serial('id').primaryKey(),
  ip: varchar('ip', { length: 100 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(), // 'register' | 'login' | 'order' | 'blocked'
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  identifier: varchar('identifier', { length: 255 }), // e.g. email or username attempted
  userAgent: text('user_agent'),
  status: varchar('status', { length: 20 }).default('allowed').notNull(), // 'allowed' | 'throttled' | 'blocked'
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


