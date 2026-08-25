ALTER TABLE `blog_posts` ADD `is_company_news` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `blog_posts_is_company_news_idx` ON `blog_posts` (`is_company_news`);