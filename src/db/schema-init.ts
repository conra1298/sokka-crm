import { db } from './index';
import { sql } from 'drizzle-orm';

export async function ensureSchemaExists() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "password_hash" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'salesperson',
      "is_active" INTEGER NOT NULL DEFAULT 1,
      "created_at" TEXT NOT NULL,
      "updated_at" TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS "companies" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "domain" TEXT,
      "industry" TEXT,
      "phone" TEXT,
      "address" TEXT,
      "website" TEXT,
      "linkedin_url" TEXT,
      "instagram_url" TEXT,
      "facebook_url" TEXT,
      "tiktok_url" TEXT,
      "owner_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
      "is_archived" INTEGER NOT NULL DEFAULT 0,
      "created_at" TEXT NOT NULL,
      "updated_at" TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS "contacts" (
      "id" TEXT PRIMARY KEY,
      "first_name" TEXT NOT NULL,
      "last_name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "normalized_email" TEXT NOT NULL,
      "phone" TEXT,
      "job_title" TEXT,
      "company_id" TEXT REFERENCES "companies"("id") ON DELETE SET NULL,
      "owner_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
      "has_duplicates" INTEGER NOT NULL DEFAULT 0,
      "duplicate_count" INTEGER NOT NULL DEFAULT 0,
      "is_archived" INTEGER NOT NULL DEFAULT 0,
      "merged_into_id" TEXT REFERENCES "contacts"("id") ON DELETE SET NULL,
      "created_at" TEXT NOT NULL,
      "updated_at" TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS "pipeline_stages" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "display_order" INTEGER NOT NULL,
      "is_terminal" INTEGER NOT NULL DEFAULT 0,
      "is_won" INTEGER NOT NULL DEFAULT 0,
      "created_at" TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS "deals" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL,
      "value" REAL,
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "website" TEXT,
      "linkedin_url" TEXT,
      "instagram_url" TEXT,
      "facebook_url" TEXT,
      "tiktok_url" TEXT,
      "stage_id" TEXT NOT NULL REFERENCES "pipeline_stages"("id") ON DELETE RESTRICT,
      "company_id" TEXT REFERENCES "companies"("id") ON DELETE SET NULL,
      "contact_id" TEXT REFERENCES "contacts"("id") ON DELETE SET NULL,
      "owner_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "expected_close_date" TEXT,
      "is_archived" INTEGER NOT NULL DEFAULT 0,
      "closed_at" TEXT,
      "created_at" TEXT NOT NULL,
      "updated_at" TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS "activities" (
      "id" TEXT PRIMARY KEY,
      "type" TEXT NOT NULL,
      "content" TEXT,
      "metadata" TEXT,
      "contact_id" TEXT REFERENCES "contacts"("id") ON DELETE CASCADE,
      "deal_id" TEXT REFERENCES "deals"("id") ON DELETE CASCADE,
      "company_id" TEXT REFERENCES "companies"("id") ON DELETE CASCADE,
      "created_by" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "created_at" TEXT NOT NULL,
      "is_correction" INTEGER NOT NULL DEFAULT 0,
      "corrects_id" TEXT REFERENCES "activities"("id") ON DELETE SET NULL,
      "correction_reason" TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS "tasks" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "due_date" TEXT,
      "is_completed" INTEGER NOT NULL DEFAULT 0,
      "completed_at" TEXT,
      "contact_id" TEXT REFERENCES "contacts"("id") ON DELETE CASCADE,
      "deal_id" TEXT REFERENCES "deals"("id") ON DELETE CASCADE,
      "company_id" TEXT REFERENCES "companies"("id") ON DELETE CASCADE,
      "assigned_to" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "created_by" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "created_at" TEXT NOT NULL,
      "updated_at" TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS "audit_log" (
      "id" TEXT PRIMARY KEY,
      "action" TEXT NOT NULL,
      "entity_type" TEXT,
      "entity_id" TEXT,
      "actor_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "details" TEXT,
      "ip_address" TEXT,
      "created_at" TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS "import_jobs" (
      "id" TEXT PRIMARY KEY,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "file_key" TEXT NOT NULL,
      "file_name" TEXT NOT NULL,
      "entity_type" TEXT NOT NULL,
      "column_mapping" TEXT,
      "total_rows" INTEGER,
      "valid_rows" INTEGER,
      "error_rows" INTEGER,
      "duplicate_rows" INTEGER,
      "errors" TEXT,
      "duplicates" TEXT,
      "created_by" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "created_at" TEXT NOT NULL,
      "completed_at" TEXT,
      "idempotency_key" TEXT UNIQUE
    )`,

    `CREATE TABLE IF NOT EXISTS "email_ingestion_log" (
      "id" TEXT PRIMARY KEY,
      "message_id" TEXT NOT NULL UNIQUE,
      "from_address" TEXT NOT NULL,
      "to_addresses" TEXT NOT NULL,
      "subject" TEXT,
      "body_preview" TEXT,
      "matched_contact_id" TEXT REFERENCES "contacts"("id") ON DELETE SET NULL,
      "activity_id" TEXT REFERENCES "activities"("id") ON DELETE SET NULL,
      "status" TEXT NOT NULL,
      "raw_payload_key" TEXT,
      "created_at" TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS "tags" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "color" TEXT NOT NULL DEFAULT '#5CB2D4',
      "created_by" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
      "created_at" TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS "contact_tags" (
      "contact_id" TEXT NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
      "tag_id" TEXT NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
      PRIMARY KEY ("contact_id", "tag_id")
    )`,

    `CREATE TABLE IF NOT EXISTS "company_tags" (
      "company_id" TEXT NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
      "tag_id" TEXT NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
      PRIMARY KEY ("company_id", "tag_id")
    )`,

    `CREATE TABLE IF NOT EXISTS "services" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "default_price" REAL NOT NULL DEFAULT 0,
      "category" TEXT NOT NULL DEFAULT 'social_media',
      "is_active" INTEGER NOT NULL DEFAULT 1,
      "created_at" TEXT NOT NULL,
      "updated_at" TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS "deal_service_items" (
      "id" TEXT PRIMARY KEY,
      "deal_id" TEXT NOT NULL REFERENCES "deals"("id") ON DELETE CASCADE,
      "service_id" TEXT REFERENCES "services"("id") ON DELETE SET NULL,
      "custom_name" TEXT NOT NULL,
      "unit_price" REAL NOT NULL,
      "quantity" INTEGER NOT NULL DEFAULT 1,
      "created_at" TEXT NOT NULL
    )`,
  ];

  for (const stmt of statements) {
    try {
      await db.run(sql.raw(stmt));
    } catch (e) {
      console.warn('Statement execution notice:', e);
    }
  }

  // Schema migrations for social columns and Phase 1 marketing agency fields
  const alterStatements = [
    `ALTER TABLE "companies" ADD COLUMN "website" TEXT;`,
    `ALTER TABLE "companies" ADD COLUMN "linkedin_url" TEXT;`,
    `ALTER TABLE "companies" ADD COLUMN "instagram_url" TEXT;`,
    `ALTER TABLE "companies" ADD COLUMN "facebook_url" TEXT;`,
    `ALTER TABLE "companies" ADD COLUMN "tiktok_url" TEXT;`,
    `ALTER TABLE "companies" ADD COLUMN "client_status" TEXT DEFAULT 'prospect';`,
    `ALTER TABLE "companies" ADD COLUMN "brief_notes" TEXT;`,

    `ALTER TABLE "contacts" ADD COLUMN "lead_source" TEXT;`,

    `ALTER TABLE "deals" ADD COLUMN "website" TEXT;`,
    `ALTER TABLE "deals" ADD COLUMN "linkedin_url" TEXT;`,
    `ALTER TABLE "deals" ADD COLUMN "instagram_url" TEXT;`,
    `ALTER TABLE "deals" ADD COLUMN "facebook_url" TEXT;`,
    `ALTER TABLE "deals" ADD COLUMN "tiktok_url" TEXT;`,
    `ALTER TABLE "deals" ADD COLUMN "lead_source" TEXT;`,
    `ALTER TABLE "deals" ADD COLUMN "deal_type" TEXT DEFAULT 'project';`,
    `ALTER TABLE "deals" ADD COLUMN "monthly_value" REAL;`,
    `ALTER TABLE "deals" ADD COLUMN "retainer_start_date" TEXT;`,
    `ALTER TABLE "deals" ADD COLUMN "retainer_renewal_date" TEXT;`,
    `ALTER TABLE "deals" ADD COLUMN "brief_notes" TEXT;`,
  ];

  for (const stmt of alterStatements) {
    try {
      await db.run(sql.raw(stmt));
    } catch (e) {
      // Ignore "duplicate column name" error if column already exists
    }
  }

  console.log('✅ Tablas y esquema de base de datos SQLite verificados/creados exitosamente.');
}
