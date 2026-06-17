-- Custom SQL migration file, put your code below! --
-- Seed the "general" catch-all default category (data migration, idempotent).
-- Mirrors the new CATEGORY_SEEDS entry in src/schema.ts. New tasks created
-- without an explicit category default to this bucket (createTask), so they
-- never drop off the category board. ON CONFLICT keeps it a no-op on re-run.
INSERT INTO "categories" ("slug", "name", "color", "lucide_icon", "sort_order", "is_default") VALUES
  ('general', 'General', '#8a8f98', 'Inbox', 5, true)
ON CONFLICT ("slug") DO NOTHING;
