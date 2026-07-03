CREATE TABLE `blog_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`published_at` integer,
	`author_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `blog_posts_slug_idx` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `blog_posts_status_idx` ON `blog_posts` (`status`);--> statement-breakpoint
CREATE INDEX `blog_posts_published_at_idx` ON `blog_posts` (`published_at`);--> statement-breakpoint
CREATE INDEX `blog_posts_author_id_idx` ON `blog_posts` (`author_id`);--> statement-breakpoint
CREATE TABLE `comparison_features` (
	`id` text PRIMARY KEY NOT NULL,
	`feature` text NOT NULL,
	`starter` text NOT NULL,
	`growth` text NOT NULL,
	`enterprise` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comparison_features_feature_unique` ON `comparison_features` (`feature`);--> statement-breakpoint
CREATE INDEX `comparison_features_sort_order_idx` ON `comparison_features` (`sort_order`);--> statement-breakpoint
CREATE INDEX `comparison_features_published_idx` ON `comparison_features` (`published`);--> statement-breakpoint
CREATE TABLE `contact_inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`company` text,
	`subject` text NOT NULL,
	`company_size` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'NEW' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_inquiries_email_idx` ON `contact_inquiries` (`email`);--> statement-breakpoint
CREATE INDEX `contact_inquiries_status_idx` ON `contact_inquiries` (`status`);--> statement-breakpoint
CREATE INDEX `contact_inquiries_created_at_idx` ON `contact_inquiries` (`created_at`);--> statement-breakpoint
CREATE TABLE `demo_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`country` text NOT NULL,
	`company` text,
	`business_type` text NOT NULL,
	`status` text DEFAULT 'NEW' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `demo_requests_email_idx` ON `demo_requests` (`email`);--> statement-breakpoint
CREATE INDEX `demo_requests_status_idx` ON `demo_requests` (`status`);--> statement-breakpoint
CREATE INDEX `demo_requests_created_at_idx` ON `demo_requests` (`created_at`);--> statement-breakpoint
CREATE TABLE `demo_videos` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`module_slug` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`published_at` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `demo_videos_slug_unique` ON `demo_videos` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `demo_videos_object_key_unique` ON `demo_videos` (`object_key`);--> statement-breakpoint
CREATE INDEX `demo_videos_status_idx` ON `demo_videos` (`status`);--> statement-breakpoint
CREATE INDEX `demo_videos_published_at_idx` ON `demo_videos` (`published_at`);--> statement-breakpoint
CREATE INDEX `demo_videos_module_slug_idx` ON `demo_videos` (`module_slug`);--> statement-breakpoint
CREATE TABLE `erp_modules` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`short_description` text NOT NULL,
	`image` text,
	`highlights` text NOT NULL,
	`best_for` text NOT NULL,
	`card_tagline` text,
	`icon_key` text NOT NULL,
	`video_url` text NOT NULL,
	`video_cta_title` text,
	`video_cta_description` text,
	`hero_headline` text NOT NULL,
	`hero_subheadline` text NOT NULL,
	`hero_cta_label` text,
	`about_title` text NOT NULL,
	`about_tag` text,
	`about_description` text DEFAULT '[]' NOT NULL,
	`about_contents` text,
	`features_section_title` text,
	`features` text NOT NULL,
	`problems` text NOT NULL,
	`testimonials_section_tag` text,
	`testimonials_section_title` text,
	`testimonials_section_description` text,
	`use_cases` text NOT NULL,
	`testimonials` text NOT NULL,
	`faqs` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `erp_modules_slug_unique` ON `erp_modules` (`slug`);--> statement-breakpoint
CREATE INDEX `erp_modules_slug_idx` ON `erp_modules` (`slug`);--> statement-breakpoint
CREATE INDEX `erp_modules_published_idx` ON `erp_modules` (`published`);--> statement-breakpoint
CREATE INDEX `erp_modules_sort_order_idx` ON `erp_modules` (`sort_order`);--> statement-breakpoint
CREATE TABLE `nav_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`href` text NOT NULL,
	`icon_key` text NOT NULL,
	`subtitle` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`external` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `nav_resources_visible_idx` ON `nav_resources` (`visible`);--> statement-breakpoint
CREATE INDEX `nav_resources_sort_order_idx` ON `nav_resources` (`sort_order`);--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`subscribed_at` integer NOT NULL,
	`unsubscribed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscribers_email_unique` ON `newsletter_subscribers` (`email`);--> statement-breakpoint
CREATE INDEX `newsletter_subscribers_email_idx` ON `newsletter_subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `pricing_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`monthly_price_display` integer NOT NULL,
	`yearly_price_display` integer NOT NULL,
	`popular` integer DEFAULT false NOT NULL,
	`features` text NOT NULL,
	`cta` text NOT NULL,
	`stripe_price_id_monthly` text,
	`stripe_price_id_yearly` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pricing_plans_slug_unique` ON `pricing_plans` (`slug`);--> statement-breakpoint
CREATE INDEX `pricing_plans_slug_idx` ON `pricing_plans` (`slug`);--> statement-breakpoint
CREATE INDEX `pricing_plans_published_idx` ON `pricing_plans` (`published`);--> statement-breakpoint
CREATE INDEX `pricing_plans_sort_order_idx` ON `pricing_plans` (`sort_order`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `solutions` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`audience` text NOT NULL,
	`hero_headline` text NOT NULL,
	`hero_subheadline` text NOT NULL,
	`problems` text NOT NULL,
	`recommended_modules` text NOT NULL,
	`testimonial` text NOT NULL,
	`solution_faqs` text NOT NULL,
	`use_cases` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `solutions_slug_unique` ON `solutions` (`slug`);--> statement-breakpoint
CREATE INDEX `solutions_slug_idx` ON `solutions` (`slug`);--> statement-breakpoint
CREATE INDEX `solutions_published_idx` ON `solutions` (`published`);--> statement-breakpoint
CREATE INDEX `solutions_sort_order_idx` ON `solutions` (`sort_order`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`stripe_customer_id` text NOT NULL,
	`stripe_subscription_id` text,
	`stripe_checkout_session_id` text,
	`customer_email` text NOT NULL,
	`plan_slug` text NOT NULL,
	`billing_interval` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripe_subscription_id_unique` ON `subscriptions` (`stripe_subscription_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripe_checkout_session_id_unique` ON `subscriptions` (`stripe_checkout_session_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_customer_email_idx` ON `subscriptions` (`customer_email`);--> statement-breakpoint
CREATE INDEX `subscriptions_stripe_customer_id_idx` ON `subscriptions` (`stripe_customer_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text,
	`role` text DEFAULT 'ADMIN' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);