CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`content` text,
	`metadata` text,
	`contact_id` text,
	`deal_id` text,
	`company_id` text,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`is_correction` integer DEFAULT false NOT NULL,
	`corrects_id` text,
	`correction_reason` text,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`corrects_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `activities_contact_created_idx` ON `activities` (`contact_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `activities_deal_created_idx` ON `activities` (`deal_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `activities_company_created_idx` ON `activities` (`company_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` text,
	`actor_id` text NOT NULL,
	`details` text,
	`ip_address` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `audit_actor_created_idx` ON `audit_log` (`actor_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_log` (`action`);--> statement-breakpoint
CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`domain` text,
	`industry` text,
	`phone` text,
	`address` text,
	`website` text,
	`linkedin_url` text,
	`instagram_url` text,
	`facebook_url` text,
	`tiktok_url` text,
	`client_status` text DEFAULT 'prospect' NOT NULL,
	`brief_notes` text,
	`owner_id` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `companies_domain_idx` ON `companies` (`domain`);--> statement-breakpoint
CREATE INDEX `companies_owner_idx` ON `companies` (`owner_id`);--> statement-breakpoint
CREATE TABLE `company_tags` (
	`company_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`company_id`, `tag_id`),
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contact_tags` (
	`contact_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`contact_id`, `tag_id`),
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`normalized_email` text NOT NULL,
	`phone` text,
	`job_title` text,
	`lead_source` text,
	`company_id` text,
	`owner_id` text,
	`has_duplicates` integer DEFAULT false NOT NULL,
	`duplicate_count` integer DEFAULT 0 NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`merged_into_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`merged_into_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `contacts_email_idx` ON `contacts` (`email`);--> statement-breakpoint
CREATE INDEX `contacts_normalized_email_idx` ON `contacts` (`normalized_email`);--> statement-breakpoint
CREATE INDEX `contacts_company_idx` ON `contacts` (`company_id`);--> statement-breakpoint
CREATE INDEX `contacts_owner_idx` ON `contacts` (`owner_id`);--> statement-breakpoint
CREATE INDEX `contacts_merged_into_idx` ON `contacts` (`merged_into_id`);--> statement-breakpoint
CREATE TABLE `deal_service_items` (
	`id` text PRIMARY KEY NOT NULL,
	`deal_id` text NOT NULL,
	`service_id` text,
	`custom_name` text NOT NULL,
	`unit_price` real NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `deals` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`value` real,
	`currency` text DEFAULT 'ARS' NOT NULL,
	`lead_source` text,
	`deal_type` text DEFAULT 'project' NOT NULL,
	`monthly_value` real,
	`retainer_start_date` text,
	`retainer_renewal_date` text,
	`brief_notes` text,
	`website` text,
	`linkedin_url` text,
	`instagram_url` text,
	`facebook_url` text,
	`tiktok_url` text,
	`stage_id` text NOT NULL,
	`company_id` text,
	`contact_id` text,
	`owner_id` text NOT NULL,
	`expected_close_date` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`closed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`stage_id`) REFERENCES `pipeline_stages`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `deals_stage_idx` ON `deals` (`stage_id`);--> statement-breakpoint
CREATE INDEX `deals_owner_idx` ON `deals` (`owner_id`);--> statement-breakpoint
CREATE INDEX `deals_company_idx` ON `deals` (`company_id`);--> statement-breakpoint
CREATE INDEX `deals_contact_idx` ON `deals` (`contact_id`);--> statement-breakpoint
CREATE TABLE `email_ingestion_log` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`from_address` text NOT NULL,
	`to_addresses` text NOT NULL,
	`subject` text,
	`body_preview` text,
	`matched_contact_id` text,
	`activity_id` text,
	`status` text NOT NULL,
	`raw_payload_key` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`matched_contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_ingestion_log_message_id_unique` ON `email_ingestion_log` (`message_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_message_id_idx` ON `email_ingestion_log` (`message_id`);--> statement-breakpoint
CREATE TABLE `import_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`file_key` text NOT NULL,
	`file_name` text NOT NULL,
	`entity_type` text NOT NULL,
	`column_mapping` text,
	`total_rows` integer,
	`valid_rows` integer,
	`error_rows` integer,
	`duplicate_rows` integer,
	`errors` text,
	`duplicates` text,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`completed_at` text,
	`idempotency_key` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `import_jobs_idempotency_key_unique` ON `import_jobs` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `import_jobs_created_by_idx` ON `import_jobs` (`created_by`);--> statement-breakpoint
CREATE TABLE `pipeline_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_order` integer NOT NULL,
	`is_terminal` integer DEFAULT false NOT NULL,
	`is_won` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pipeline_stages_order_idx` ON `pipeline_stages` (`display_order`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`default_price` real DEFAULT 0 NOT NULL,
	`category` text DEFAULT 'social_media' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#5CB2D4' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`due_date` text,
	`is_completed` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`contact_id` text,
	`deal_id` text,
	`company_id` text,
	`assigned_to` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `tasks_assigned_completed_due_idx` ON `tasks` (`assigned_to`,`is_completed`,`due_date`);--> statement-breakpoint
CREATE INDEX `tasks_deal_idx` ON `tasks` (`deal_id`);--> statement-breakpoint
CREATE INDEX `tasks_contact_idx` ON `tasks` (`contact_id`);--> statement-breakpoint
CREATE TABLE `transaction_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`color` text DEFAULT '#5CB2D4' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`date` text,
	`period_month` integer,
	`period_year` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`billing_status` text DEFAULT 'unbilled',
	`notes` text,
	`company_id` text,
	`deal_id` text,
	`category_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`category_id`) REFERENCES `transaction_categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `transactions_company_idx` ON `transactions` (`company_id`);--> statement-breakpoint
CREATE INDEX `transactions_deal_idx` ON `transactions` (`deal_id`);--> statement-breakpoint
CREATE INDEX `transactions_category_idx` ON `transactions` (`category_id`);--> statement-breakpoint
CREATE INDEX `transactions_date_idx` ON `transactions` (`date`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'salesperson' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);