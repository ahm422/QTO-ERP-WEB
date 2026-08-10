CREATE TABLE `contact_channels` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`label` text NOT NULL,
	`value` text NOT NULL,
	`icon_key` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_channels_published_idx` ON `contact_channels` (`published`);--> statement-breakpoint
CREATE INDEX `contact_channels_sort_order_idx` ON `contact_channels` (`sort_order`);--> statement-breakpoint
CREATE INDEX `contact_channels_type_idx` ON `contact_channels` (`type`);--> statement-breakpoint
CREATE TABLE `contact_page_content` (
	`id` text PRIMARY KEY NOT NULL,
	`side_title` text NOT NULL,
	`side_description` text NOT NULL,
	`form_field_options` text NOT NULL,
	`faq_tag` text NOT NULL,
	`faq_title` text NOT NULL,
	`faq_description` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact_support_content` (
	`id` text PRIMARY KEY NOT NULL,
	`tag` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`cards` text NOT NULL,
	`response_times` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `erp_modules` ADD `capabilities` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `erp_modules` ADD `rollout_tag` text;--> statement-breakpoint
ALTER TABLE `erp_modules` ADD `rollout_title_template` text;--> statement-breakpoint
ALTER TABLE `erp_modules` ADD `rollout_description` text;--> statement-breakpoint
ALTER TABLE `erp_modules` ADD `rollout_steps` text DEFAULT '[]' NOT NULL;