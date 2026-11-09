-- Criador de Sites: hospedagem paga na VM do Atlas e entrega da publicação após o pagamento.
-- Depende da 0010_site_builder.sql e da 0011_site_builder_publications.sql.
CREATE TABLE IF NOT EXISTS "builder_hosting_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"amount_brl" double precision NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"next_charge_date" timestamp NOT NULL,
	"grace_until" timestamp,
	"initial_invoice_id" uuid,
	"last_invoice_id" uuid,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"config" json DEFAULT '{}'::json NOT NULL,
	"suspended_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "builder_hosting_subscriptions" ADD CONSTRAINT "builder_hosting_subscriptions_site_id_builder_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."builder_sites"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "builder_hosting_subscriptions" ADD CONSTRAINT "builder_hosting_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "builder_hosting_subscriptions" ADD CONSTRAINT "builder_hosting_subscriptions_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "builder_hosting_subscriptions" ADD CONSTRAINT "builder_hosting_subscriptions_initial_invoice_id_invoices_id_fk" FOREIGN KEY ("initial_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "builder_hosting_subscriptions" ADD CONSTRAINT "builder_hosting_subscriptions_last_invoice_id_invoices_id_fk" FOREIGN KEY ("last_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "builder_hosting_subscriptions_site_id_unique" ON "builder_hosting_subscriptions" USING btree ("site_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "builder_hosting_subscriptions_next_charge_idx" ON "builder_hosting_subscriptions" USING btree ("next_charge_date");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "builder_publish_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "builder_publish_jobs" ADD CONSTRAINT "builder_publish_jobs_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "builder_publish_jobs" ADD CONSTRAINT "builder_publish_jobs_site_id_builder_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."builder_sites"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "builder_publish_jobs_invoice_id_unique" ON "builder_publish_jobs" USING btree ("invoice_id");
--> statement-breakpoint
-- Suspensão por falta de pagamento: `builder_publications.status` ganha o valor
-- 'suspended' (a coluna é text sem CHECK, então só o enum do drizzle muda).
ALTER TABLE "builder_publications" ADD COLUMN IF NOT EXISTS "suspended_at" timestamp;
