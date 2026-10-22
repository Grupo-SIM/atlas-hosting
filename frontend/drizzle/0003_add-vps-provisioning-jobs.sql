CREATE TABLE IF NOT EXISTS "vps_provisioning_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "status" text DEFAULT 'pending' NOT NULL,
  "instance_id" text,
  "error" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "vps_provisioning_jobs_invoice_id_unique"
  ON "vps_provisioning_jobs" ("invoice_id");
