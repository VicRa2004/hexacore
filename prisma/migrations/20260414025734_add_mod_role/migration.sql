-- This is an empty migration.
INSERT INTO "roles" ("id", "name") VALUES (3, 'MOD') ON CONFLICT DO NOTHING;