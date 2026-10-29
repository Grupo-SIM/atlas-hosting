-- Criador de Sites: um registro por site; o conteúdo inteiro (páginas, posts, menu, tema) fica em jsonb.
CREATE TABLE "builder_sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"template_id" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "builder_sites" ADD CONSTRAINT "builder_sites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "builder_sites_user_id_idx" ON "builder_sites" USING btree ("user_id");
