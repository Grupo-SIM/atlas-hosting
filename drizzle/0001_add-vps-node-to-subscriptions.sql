ALTER TABLE "vps_subscriptions" ADD COLUMN "vps_node_id" uuid;--> statement-breakpoint
ALTER TABLE "vps_subscriptions" ADD CONSTRAINT "vps_subscriptions_vps_node_id_vps_nodes_id_fk" FOREIGN KEY ("vps_node_id") REFERENCES "public"."vps_nodes"("id") ON DELETE set null ON UPDATE no action;
