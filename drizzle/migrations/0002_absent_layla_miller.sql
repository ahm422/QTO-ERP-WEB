CREATE TABLE `home_hero` (
	`id` text PRIMARY KEY NOT NULL,
	`eyebrow_text` text NOT NULL,
	`title_line1` text NOT NULL,
	`title_accent` text NOT NULL,
	`subtitle` text NOT NULL,
	`bullets` text NOT NULL,
	`primary_cta_label` text NOT NULL,
	`primary_cta_url` text NOT NULL,
	`secondary_cta_label` text NOT NULL,
	`secondary_cta_url` text NOT NULL,
	`powered_by_text` text NOT NULL,
	`powered_by_url` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `erp_modules` ADD `orbit_radius` real;--> statement-breakpoint
ALTER TABLE `erp_modules` ADD `orbit_tilt` real;--> statement-breakpoint
ALTER TABLE `erp_modules` ADD `orbit_phase` real;--> statement-breakpoint
ALTER TABLE `erp_modules` ADD `orbit_speed` real;--> statement-breakpoint
ALTER TABLE `erp_modules` ADD `show_in_hero_orbit` integer DEFAULT true NOT NULL;