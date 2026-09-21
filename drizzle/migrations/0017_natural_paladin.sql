CREATE TABLE `chatbot_knowledge` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`category` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chatbot_knowledge_enabled_idx` ON `chatbot_knowledge` (`enabled`);--> statement-breakpoint
CREATE INDEX `chatbot_knowledge_sort_order_idx` ON `chatbot_knowledge` (`sort_order`);