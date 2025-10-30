//Model (patients.model.js) — SQL queries for one resource (“patients”).

import { query } from '../db.js'; //Imports the shared query helper so this file can run parameterized SQL against your PostgreSQL pool.

//Defines a reusable SELECT column list that converts snake_case DB columns into camelCase API fields so callers immediately get frontend-friendly keys.

const COLUMNS = ` 
  id,
  first_name   AS "firstName",
  last_name    AS "lastName",
  age,
  phone_number AS "phoneNumber",
  health_issue AS "healthIssue",
  created_at   AS "createdAt",
  updated_at   AS "updatedAt"
`;

export async function listPatients() {
    const { rows } = await query(`SELECT ${COLUMNS} FROM patients ORDER BY id DESC`); //Runs a parameterized SQL SELECT using shared query helper, waits for DB result, returns just the data rows
    return rows;
}

export async function createPatient(p) {
    const { rows } = await query(
        `INSERT INTO PATIENTS (first_name, last_name, age, phone_number, health_issue)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${COLUMNS}`, //Uses parameterized placeholders $1…$5 (protects against SQL injection).
        [
            p.firstName, //Maps camelCase fields from the API to snake_case DB columns.
            p.lastName,
            p.age ?? null,
            p.phoneNumber,
            p.healthIssue ?? null,
        ]
    );
    return rows[0]; //Returns the full inserted row
}



//-------> get, update, delete = Pure database helpers. They run SQL and return data. No HTTP stuff here <--------//

export async function getPatient(id) {                      //Looks up one patient by id.
    const { rows } = await query(
        `SELECT ${COLUMNS} FROM patients WHERE id = $1`,    //Runs a parameterized SQL query ($1 prevents SQL injection)
        [id]
    );
    return rows[0] || null;                                 //Return: a single object (or null if not found).
}



export async function updatePatient(id, p) {                //Updates only the fields you actually send (partial update =p)
    const map = {
        firstName: 'first_name',                            //maps API keys (camelCase) to DB columns (snake_case)
        lastName: 'last_name',
        age: 'age',
        phoneNumber: 'phone_number',
        healthIssue: 'health_issue',
    };

    const fields = [];                                      //Build a dynamic, safe SET clause only for provided fields
    const values = [];
    let i = 1;

    for (const [key, value] of Object.entries(p)) {
        if (value === undefined) continue;                  // skip untouched fields that are undefined.
        const col = map[key];                               //Translate the API key to a DB column using map.- Skip unknown keys
        if (!col) continue;                                 // ignore unknown keys AND only update columns we allow.
        fields.push(`${col} = $${i++}`);                    //Add a SET part like first_name = $1 to fields.
        values.push(value);                                 //Push the actual value (e.g., “Ada”) into values
    }

    if (fields.length === 0) {
        // no changes requested; return current row
        return await getPatient(id);
    }

    values.push(id);                                        // final parameter is the WHERE id and run a single SQL statement:
    const { rows } = await query(
        `UPDATE patients SET ${fields.join(', ')} WHERE id = $${i} RETURNING ${COLUMNS}`, //gives us the updated row in one go (no second SELECT needed)
        values
    );
    return rows[0] || null;                                 //If no row matched the id, rows[0] will be undefined → function returns null 
}



export async function deletePatient(id) {                   //Runs a parameterized DELETE
    const { rowCount } = await query(                       //rowCount tells us how many rows were affected. If 1, something was deleted; if 0, id didn’t exist.
        `DELETE FROM patients WHERE id = $1`,
        [id]
    );
    return rowCount > 0; // true if a row was deleted
}
