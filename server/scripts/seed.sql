-- seed.sql — Adds a few starter rows for local/dev use.
-- Safe to run more than once thanks to ON CONFLICT DO NOTHING (no-op if duplicates conflict on a future unique key).

INSERT INTO patients (first_name, last_name, age, phone_number, health_issue)
VALUES
    ('Ada',  'Lovelace', 36, '+1 (555) 123-4567', 'Headache'),
    ('Alan', 'Turing',   41, '+1 (555) 987-6543', 'Chest pain')
ON CONFLICT DO NOTHING;

-- How it fits:
-- - Helpful for quick manual testing (GET list, edit one, etc.).
-- - The API reads these rows via GET /api/patients and they appear in your React table.
