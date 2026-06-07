CREATE TABLE "user_api_keys" (
	"user_id" text PRIMARY KEY NOT NULL,
	"anthropic_key_encrypted" text,
	"anthropic_last4" text,
	"groq_key_encrypted" text,
	"groq_last4" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;