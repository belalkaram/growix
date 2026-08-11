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
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Orders Table (Subscription Orders for Admin Approval)
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  packageId: varchar('package_id', { length: 100 }).notNull(),
  toolId: varchar('tool_id', { length: 100 }),
  paymentMethod: varchar('payment_method', { length: 100 }).notNull(),
  senderNumber: varchar('sender_number', { length: 100 }).notNull(),
  amount: varchar('amount', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

