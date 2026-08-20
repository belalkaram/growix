CREATE TABLE "coupon_usages" (
	"id" serial PRIMARY KEY NOT NULL,
	"coupon_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"discount_applied" varchar(50) NOT NULL,
	"used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"discount_percent" integer NOT NULL,
	"valid_from" timestamp DEFAULT now() NOT NULL,
	"valid_until" timestamp NOT NULL,
	"usage_limit" integer DEFAULT 100,
	"used_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mega_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"mega_url" text NOT NULL,
	"size_label" varchar(50),
	"content_count" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"package_id" varchar(100) NOT NULL,
	"tool_id" varchar(100),
	"payment_method" varchar(100) NOT NULL,
	"payment_provider" varchar(50),
	"sender_number" varchar(100) NOT NULL,
	"amount" varchar(50) NOT NULL,
	"original_amount" varchar(50),
	"discount_amount" varchar(50),
	"coupon_code" varchar(50),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"approval_type" varchar(20) DEFAULT 'manual',
	"matched_transaction_id" varchar(100),
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" varchar(100) NOT NULL,
	"tool_id" varchar(100),
	"file_name" varchar(255) NOT NULL,
	"file_key" varchar(500) NOT NULL,
	"file_size" text,
	"file_type" varchar(50) DEFAULT 'zip' NOT NULL,
	"category" varchar(50) DEFAULT 'tool' NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "package_files_file_key_unique" UNIQUE("file_key")
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"badge" varchar(100),
	"is_popular" boolean DEFAULT false NOT NULL,
	"original_price" varchar(50) NOT NULL,
	"discounted_price" varchar(50) NOT NULL,
	"currency" varchar(20) DEFAULT 'جنية' NOT NULL,
	"period" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"features" jsonb NOT NULL,
	"cta_text" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"user_id" uuid,
	"path" varchar(500) NOT NULL,
	"referrer" varchar(500),
	"utm_source" varchar(200),
	"utm_medium" varchar(200),
	"utm_campaign" varchar(200),
	"country" varchar(10),
	"device_type" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" varchar(100) NOT NULL,
	"provider" varchar(50) DEFAULT 'vodafone_cash' NOT NULL,
	"amount" varchar(50) NOT NULL,
	"amount_cents" integer NOT NULL,
	"sender_phone" varchar(50) NOT NULL,
	"sender_name" varchar(255),
	"wallet_phone" varchar(50) NOT NULL,
	"transaction_timestamp" timestamp,
	"raw_transaction_date" varchar(50),
	"raw_transaction_time" varchar(50),
	"raw_message" text NOT NULL,
	"status" varchar(50) NOT NULL,
	"matched_order_id" uuid,
	"review_reason" text,
	"metadata" jsonb,
	"is_dry_run" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	CONSTRAINT "payment_transactions_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "security_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"user_id" uuid,
	"identifier" varchar(255),
	"user_agent" text,
	"status" varchar(20) DEFAULT 'allowed' NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"company" varchar(255),
	"avatar" text NOT NULL,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"verified" boolean DEFAULT true NOT NULL,
	"package_taken" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_id" varchar(100),
	"title" varchar(255) NOT NULL,
	"video_url" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"number" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"badge" varchar(100),
	"short_desc" text NOT NULL,
	"long_desc" text,
	"features" jsonb NOT NULL,
	"icon_name" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tools_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tools_seo" (
	"tool_id" varchar(100) PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"meta_title" varchar(255) NOT NULL,
	"meta_description" text NOT NULL,
	"h1" varchar(255) NOT NULL,
	"h2_keywords" jsonb NOT NULL,
	"keywords" jsonb NOT NULL,
	"faq_items" jsonb NOT NULL,
	"schema_name" varchar(255) NOT NULL,
	"schema_description" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tools_seo_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"phone" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_matched_order_id_orders_id_fk" FOREIGN KEY ("matched_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_logs" ADD CONSTRAINT "security_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools_seo" ADD CONSTRAINT "tools_seo_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;