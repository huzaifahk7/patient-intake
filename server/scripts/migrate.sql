-- migrate.sql — Creates/updates database schema for this project.
-- Safe to run multiple times. It checks existence before creating constraints/triggers.

-- 1) Table definition
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,                 -- Unique numeric ID (auto-increment)
    first_name   TEXT NOT NULL,            -- Patient's first name (required)
    last_name    TEXT NOT NULL,            -- Patient's last name  (required)
    age          INTEGER CHECK (age >= 0), -- Optional; if present must be 0 or more
    phone_number TEXT NOT NULL,            -- Phone number (validated by a separate CHECK constraint below)
    health_issue TEXT,                     -- Short description / note of the health issue
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(), -- Row creation time (UTC) Accepts input with or without a time zone
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()  -- Row last update time (UTC)
);

-- 2) Phone number format constraint (only create if not already added)
-- This uses a small PL/pgSQL block (DO $$ ... $$) to check Postgres' system catalog for a named constraint.
DO $$
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'phone_digits'
    ) THEN
      ALTER TABLE patients
        ADD CONSTRAINT phone_digits
        CHECK (phone_number ~ '^[0-9+\-() ]{7,20}$'); -- 7–20 chars; digits/spaces/+/-/() allowed
    END IF;
END$$;

-- 3) Trigger to auto-update updated_at on changes
-- Define a function that sets NEW.updated_at = now() before an UPDATE is saved.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists (drop first if present to avoid duplicates)
DROP TRIGGER IF EXISTS patients_set_updated_at ON patients;
CREATE TRIGGER patients_set_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

/*
How this connects to the app:
- The Express routes and models insert/update rows in "patients".
- The CHECK constraints enforce rules at the DB level (extra safety beyond API validation).
- The trigger keeps "updated_at" accurate without the app having to manage it manually.
- "created_at" and "updated_at" are returned to the API and can be shown in the UI if desired.

Cheat sheet:
- IF NOT EXISTS: safe to run again (idempotent).
- CHECK: database-enforced validation rule.
- DO $$ ... $$: one-off block of procedural code in Postgres.
- pg_constraint: Postgres system catalog listing constraints by name.
- ^ and $ in the regex anchor the start/end (match the entire phone string).
*/
