CREATE TABLE "client_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"prefix" text NOT NULL,
	"scope" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	"revoked_at" timestamp,
	CONSTRAINT "client_api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"context" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"integration_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "research_jobs" ADD COLUMN "context" text;--> statement-breakpoint
ALTER TABLE "client_api_keys" ADD CONSTRAINT "client_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_integrations" ADD CONSTRAINT "mission_integrations_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_integrations" ADD CONSTRAINT "mission_integrations_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_api_keys_user_idx" ON "client_api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "integrations_user_slug_idx" ON "integrations" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "integrations_user_idx" ON "integrations" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mission_integrations_link_idx" ON "mission_integrations" USING btree ("mission_id","integration_id");--> statement-breakpoint
CREATE INDEX "mission_integrations_mission_idx" ON "mission_integrations" USING btree ("mission_id");--> statement-breakpoint
CREATE INDEX "mission_integrations_integration_idx" ON "mission_integrations" USING btree ("integration_id");