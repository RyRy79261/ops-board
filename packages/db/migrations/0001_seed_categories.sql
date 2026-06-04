-- Custom SQL migration file, put your code below! --
-- Seed the five default task categories (data migration, idempotent).
-- Mirrors CATEGORY_SEEDS in src/schema.ts: slug + name + hex (the @opsboard/ui
-- --color-cat-* mirror) + Lucide icon + sort order. ON CONFLICT keeps it a
-- no-op on re-run / pre-existing rows. id/created_at/updated_at use defaults.
INSERT INTO "categories" ("slug", "name", "color", "lucide_icon", "sort_order", "is_default") VALUES
  ('medical', 'Medical', '#e05a9f', 'Stethoscope', 0, true),
  ('bureaucratic', 'Bureaucratic', '#5aa0e0', 'FileText', 1, true),
  ('travel', 'Travel', '#5ae0a0', 'Plane', 2, true),
  ('gear', 'Gear', '#e0c05a', 'Backpack', 3, true),
  ('tech', 'Tech', '#a05ae0', 'Cpu', 4, true)
ON CONFLICT ("slug") DO NOTHING;
