CREATE TABLE `about_story` (
	`id` text PRIMARY KEY NOT NULL,
	`image_key` text,
	`image_alt` text NOT NULL,
	`badge` text NOT NULL,
	`title` text NOT NULL,
	`paragraph_1` text NOT NULL,
	`paragraph_2` text NOT NULL,
	`callout_icon_key` text NOT NULL,
	`callout_title` text NOT NULL,
	`callout_body` text NOT NULL,
	`callout_link_label` text NOT NULL,
	`callout_link_url` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `about_values` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `about_values_published_idx` ON `about_values` (`published`);--> statement-breakpoint
CREATE INDEX `about_values_sort_order_idx` ON `about_values` (`sort_order`);