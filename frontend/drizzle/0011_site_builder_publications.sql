-- Criador de Sites: publicação (domínio + servidor) de cada site. Depende da 0010_site_builder.sql.
CREATE TABLE "builder_publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"kind" text NOT NULL,
	"target" text NOT NULL,
	"vps_node_id" uuid,
	"server_ip" text NOT NULL,
	"status" text NOT NULL,
	"last_error" text,
	"published_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "builder_publications" ADD CONSTRAINT "builder_publications_site_id_builder_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."builder_sites"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "builder_publications" ADD CONSTRAINT "builder_publications_vps_node_id_vps_nodes_id_fk" FOREIGN KEY ("vps_node_id") REFERENCES "public"."vps_nodes"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "builder_publications_site_id_unique" ON "builder_publications" USING btree ("site_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "builder_publications_domain_unique" ON "builder_publications" USING btree ("domain");
