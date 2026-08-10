CREATE TABLE `industry_domains` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`order_index` text NOT NULL,
	`systems_count` integer NOT NULL,
	`icon_key` text NOT NULL,
	`description` text NOT NULL,
	`leaders` text NOT NULL,
	`cta_label` text,
	`cta_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `industry_domains_slug_unique` ON `industry_domains` (`slug`);--> statement-breakpoint
CREATE INDEX `industry_domains_published_idx` ON `industry_domains` (`published`);--> statement-breakpoint
CREATE INDEX `industry_domains_sort_order_idx` ON `industry_domains` (`sort_order`);