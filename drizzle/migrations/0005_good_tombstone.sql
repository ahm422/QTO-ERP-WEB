CREATE TABLE `faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`page_key` text NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`category` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `faqs_page_key_idx` ON `faqs` (`page_key`);--> statement-breakpoint
CREATE INDEX `faqs_page_key_published_idx` ON `faqs` (`page_key`,`published`);--> statement-breakpoint
CREATE INDEX `faqs_page_key_sort_order_idx` ON `faqs` (`page_key`,`sort_order`);--> statement-breakpoint
CREATE TABLE `footer_content` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_blurb` text NOT NULL,
	`built_by_label` text NOT NULL,
	`built_by_url` text NOT NULL,
	`newsletter_heading` text NOT NULL,
	`newsletter_copy` text NOT NULL,
	`link_groups` text NOT NULL,
	`copyright_text` text NOT NULL,
	`bottom_links` text NOT NULL,
	`updated_at` integer NOT NULL
);
