-- Local delivery only. Preserve transfer history after removing a domain association.
ALTER TABLE "domain_transfers" ADD COLUMN IF NOT EXISTS "domain_name" text;
--> statement-breakpoint
UPDATE "domain_transfers" AS transfer
SET "domain_name" = domain.domain
FROM "organization_domains" AS domain
WHERE transfer.domain_id = domain.id AND transfer.domain_name IS NULL;
--> statement-breakpoint
ALTER TABLE "domain_transfers" ALTER COLUMN "domain_id" DROP NOT NULL;
--> statement-breakpoint
-- Remove the existing FK regardless of whether migrations or Drizzle named it.
DO $$
DECLARE constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'domain_transfers'::regclass AND contype = 'f'
      AND confrelid = 'organization_domains'::regclass
  LOOP
    EXECUTE format('ALTER TABLE domain_transfers DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;
--> statement-breakpoint
ALTER TABLE "domain_transfers" ADD CONSTRAINT "domain_transfers_domain_id_fkey"
  FOREIGN KEY ("domain_id") REFERENCES "organization_domains"("id") ON DELETE SET NULL;
