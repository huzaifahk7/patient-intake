INSERT INTO patients (first_name, last_name, age, phone_number, health_issue)
VALUES
    ('Ada', 'Lovelace', 36, '+1 (555) 123-4567', 'Headache'),
    ('Alan', 'Turing', 41, '+1 (555) 987-6543', 'Chest pain')
ON CONFLICT DO NOTHING;