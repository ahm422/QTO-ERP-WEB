CREATE TABLE `built_for_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon_key` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `built_for_cards_published_idx` ON `built_for_cards` (`published`);--> statement-breakpoint
CREATE INDEX `built_for_cards_sort_order_idx` ON `built_for_cards` (`sort_order`);--> statement-breakpoint
CREATE TABLE `home_sections` (
	`section_key` text PRIMARY KEY NOT NULL,
	`tag` text NOT NULL,
	`title` text NOT NULL,
	`accent` text NOT NULL,
	`description` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `home_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`value` real NOT NULL,
	`suffix` text NOT NULL,
	`icon_key` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `home_stats_published_idx` ON `home_stats` (`published`);--> statement-breakpoint
CREATE INDEX `home_stats_sort_order_idx` ON `home_stats` (`sort_order`);--> statement-breakpoint
CREATE TABLE `trusted_logos` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`logo_image_key` text,
	`link_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `trusted_logos_published_idx` ON `trusted_logos` (`published`);--> statement-breakpoint
CREATE INDEX `trusted_logos_sort_order_idx` ON `trusted_logos` (`sort_order`);