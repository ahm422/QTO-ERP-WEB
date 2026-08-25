ALTER TABLE `blog_posts` ADD `cover_image_url` text;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `tags` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `is_featured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `meta_title` text;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `meta_description` text;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `read_time_minutes` integer;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `view_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `blog_posts_is_featured_idx` ON `blog_posts` (`is_featured`);--> statement-breakpoint
CREATE INDEX `blog_posts_category_idx` ON `blog_posts` (`category`);