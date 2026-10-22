ALTER TABLE "organization_domains"
  ADD COLUMN IF NOT EXISTS "connection_status" text DEFAULT 'connected' NOT NULL,
  ADD COLUMN IF NOT EXISTS "dns_mode" text DEFAULT 'external' NOT NULL,
  ADD COLUMN IF NOT EXISTS "expected_nameservers" text[],
  ADD COLUMN IF NOT EXISTS "last_dns_check_at" timestamp,
  ADD COLUMN IF NOT EXISTS "last_dns_error" text,
  ADD COLUMN IF NOT EXISTS "registrar_provider" text,
  ADD COLUMN IF NOT EXISTS "verified_at" timestamp,
  ADD COLUMN IF NOT EXISTS "cloudflare_zone_id" text,
  ADD COLUMN IF NOT EXISTS "cloudflare_zone_status" text,
  ADD COLUMN IF NOT EXISTS "dns_import_status" text DEFAULT 'not_started' NOT NULL,
  ADD COLUMN IF NOT EXISTS "dns_scan_started_at" timestamp,
  ADD COLUMN IF NOT EXISTS "dns_imported_at" timestamp;

UPDATE "organization_domains"
SET "dns_mode" = 'external', "connection_status" = 'unmanaged'
WHERE "registrar_provider" IS NULL;

UPDATE "organization_domains"
SET "dns_mode" = 'legacy_plesk', "connection_status" = 'migration_required'
WHERE "dns_mode" = 'atlas';

CREATE UNIQUE INDEX IF NOT EXISTS "organization_domains_domain_unique"
  ON "organization_domains" ("domain");

CREATE UNIQUE INDEX IF NOT EXISTS "organization_domains_cloudflare_zone_unique"
  ON "organization_domains" ("cloudflare_zone_id")
  WHERE "cloudflare_zone_id" IS NOT NULL;
