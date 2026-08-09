ALTER TABLE "organization_domains"
  ADD COLUMN IF NOT EXISTS "connection_status" text DEFAULT 'connected' NOT NULL,
  ADD COLUMN IF NOT EXISTS "dns_mode" text DEFAULT 'atlas' NOT NULL,
  ADD COLUMN IF NOT EXISTS "expected_nameservers" text[],
  ADD COLUMN IF NOT EXISTS "last_dns_check_at" timestamp,
  ADD COLUMN IF NOT EXISTS "last_dns_error" text,
  ADD COLUMN IF NOT EXISTS "registrar_provider" text,
  ADD COLUMN IF NOT EXISTS "verified_at" timestamp;

UPDATE "organization_domains"
SET "dns_mode" = 'external', "connection_status" = 'unmanaged'
WHERE "registrar_provider" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "organization_domains_domain_unique"
  ON "organization_domains" ("domain");
