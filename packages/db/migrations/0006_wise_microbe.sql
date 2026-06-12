CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"voice_confirm_destructive" boolean DEFAULT true NOT NULL,
	"notify_closing_windows" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;