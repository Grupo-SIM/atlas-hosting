CREATE TABLE IF NOT EXISTS "domain_transfers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "domain_id" uuid NOT NULL REFERENCES "organization_domains"("id"),
  "source_organization_id" uuid NOT NULL REFERENCES "organization"("id"),
  "target_organization_id" uuid NOT NULL REFERENCES "organization"("id"),
  "source_user_id" uuid NOT NULL REFERENCES "users"("id"),
  "target_user_id" uuid NOT NULL REFERENCES "users"("id"),
  "status" text NOT NULL,
  "source_accepted_at" timestamp,
  "target_accepted_at" timestamp,
  "expires_at" timestamp NOT NULL,
  "completed_at" timestamp,
  "rejected_at" timestamp,
  "cancelled_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "domain_transfers_active_domain_unique"
  ON "domain_transfers" ("domain_id")
  WHERE "status" IN ('pending_both', 'awaiting_source', 'awaiting_target');
