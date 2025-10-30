CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER CHECK (age >= 0),
    phone_number TEXT NOT NULL,
    health_issue TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* Make a table named patients if it doesn’t already exist. Each row is one patient. */

DO $$
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'phone_digits'
    ) THEN
      ALTER TABLE patients
        ADD CONSTRAINT phone_digits CHECK (phone_number ~ '^[0-9+\\-() ]{7,20}$');
    END IF;
END$$;

/* Run a tiny program (a PL/pgSQL block) that says: “if the phone_digits rule doesn’t already exist, add it.”
The rule (CHECK) says the phone number must look like 7–20 characters made of digits, spaces, plus +, minus -, and parentheses.*/

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
/*Define a tiny function that, right before a row is updated, sets the row’s updated_at to the current time. */


DROP TRIGGER IF EXISTS patients_set_updated_at ON patients;
CREATE TRIGGER patients_set_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    
/*First remove any old trigger with that name (if it exists), then create a trigger on the patients table that runs before every update and calls our function to refresh updated_at. */








/*  
SQL files (migrate.sql, seed.sql) — define and fill the database.

IF NOT EXISTS:  only create it if it’s missing—safe to run multiple times.

NOT NULL:       value must be present.

CHECK:          validation rule enforced by the database. 

DO $$ ... $$ →  a throwaway code block executed once.

pg_constraint → Postgres’ internal table that lists all constraints; we’re checking by name.

^/$ → start/end anchors (match the whole string)
*/