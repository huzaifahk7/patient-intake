// server/src/models/patients.model.js
import { query } from '../db.js';                 // Reuse our pooled Postgres "query" helper

const COLUMNS = `                                // Column list with snake_case → camelCase aliases for consistent API output
  id,
  first_name   AS "firstName",
  last_name    AS "lastName",
  age,
  phone_number AS "phoneNumber",
  health_issue AS "healthIssue",
  created_at   AS "createdAt",
  updated_at   AS "updatedAt"
`;

// --------- LIST (no pagination) - kept for compatibility ---------
export async function listPatients() {            // Old list: returns ALL rows (kept so nothing else breaks)
  const { rows } = await query(                   //send a SQL command (a string) to the PostgreSQL database, and Postgres returns results
    `SELECT ${COLUMNS} FROM patients ORDER BY id DESC` // Latest first
  );
  return rows;                                    // Return array of rows
}

// --------- LIST (pagination + search) ---------If a number is out of acceptable range or not a proper integer, we force (clamp) it to a safe value.
export async function listPatientsPaged({ page = 1, pageSize = 10, q = '' } = {}) {
  page = Number(page);                            // Ensure "page" is a number
  pageSize = Number(pageSize);                    // Ensure "pageSize" is a number
  if (!Number.isInteger(page) || page < 1) page = 1;   // Clamp invalid page to 1
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) pageSize = 10; // Clamp invalid size to 10..100

  const offset = (page - 1) * pageSize;          // Compute OFFSET for LIMIT/OFFSET pagination- LIMIT = how many rows per page, OFFSET = how many rows to skip

  const hasQ = q && String(q).trim() !== '';     // Do we have a non-empty search term?
  const where = hasQ
    ? `WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR phone_number ILIKE $1 OR health_issue ILIKE $1` // Case-insensitive search
    : '';                                         //LIKE cares about case (“Ada” ≠ “ada”); ILIKE ignores case (“Ada” = “ada” = “ADA”)
  const params = hasQ ? [`%${q}%`] : [];         // Parameterized value for $1 (prevents SQL injection) 
  // If you put user text directly into your SQL, an attacker can sneak SQL code into it. 
  // Use placeholders ($1, $2, …) and pass values separately. The database treats them as data, not code.

  const countSql = `SELECT COUNT(*)::int AS total FROM patients ${where}`; // Count total matches for pagination UI
  const { rows: countRows } = await query(countSql, params);               // Execute count
  const total = countRows[0]?.total ?? 0;                                  // Total rows (0 if none)

  const itemsSql = `                               
    SELECT ${COLUMNS}                            -- Select paged items using the same output shape
    FROM patients
    ${where}
    ORDER BY id DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;
  const { rows: items } = await query(itemsSql, params); // Execute items query

  return { items, total, page, pageSize };       // Return metadata + current page items
}

// --------- GET ONE ---------
export async function getPatient(id) {            // Fetch a single patient by id
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM patients WHERE id = $1`, // Parameterized id-The id value is sent separately, so Postgres can’t treat it as SQL.
    [id]
  );
  return rows[0] || null;                         // Return row or null if not found
}

// --------- CREATE ---------
export async function createPatient(p) {
  // Note: send null for optional fields if undefined
  const { rows } = await query(
    `
    INSERT INTO patients (first_name, last_name, age, phone_number, health_issue) -- Insert with snake_case columns
    VALUES ($1, $2, $3, $4, $5)                                                   -- Parameterized values to prevent SQL injection
    RETURNING ${COLUMNS}                                                          -- Return newly created row with aliases
    `,
    [
      p.firstName,                           // $1
      p.lastName,                            // $2
      p.age ?? null,                         // $3 (null if undefined)
      p.phoneNumber,                         // $4
      p.healthIssue ?? null,                 // $5 (null if undefined)
    ]
  );
  return rows[0];                             // Return the inserted row
}

// --------- UPDATE (partial) ---------
export async function updatePatient(id, p) {  // Partial update: only fields provided are updated
  const map = {                               // Map camelCase keys → DB column names
    firstName: 'first_name',
    lastName: 'last_name',
    age: 'age',
    phoneNumber: 'phone_number',
    healthIssue: 'health_issue',
  };

  const fields = [];                           // Holds "col = $i" segments
  const values = [];                           // Holds values for placeholders
  let i = 1;                                   // Placeholder counter ($1, $2, ...)

  for (const [key, value] of Object.entries(p)) { // Iterate over provided fields
    if (value === undefined) continue;        // Skip keys not sent in PATCH
    const col = map[key];                      // Find DB column for this key
    if (!col) continue;                        // Ignore unknown keys
    fields.push(`${col} = $${i++}`);           // Add "col = $i" to SET list
    values.push(value);                        // Add value for $i
  }

  if (fields.length === 0) {                   // If nothing to update...
    // nothing to update, return current row
    return await getPatient(id);               // ...just return current data
  }

  values.push(id);                              // Last value is the WHERE id
  const { rows } = await query(
    `UPDATE patients SET ${fields.join(', ')} WHERE id = $${i} RETURNING ${COLUMNS}`, // Build dynamic SET safely
    values
  );
  return rows[0] || null;                       // Return updated row or null if not found
}

// --------- DELETE ---------
export async function deletePatient(id) {       // Delete by id
  const { rowCount } = await query(`DELETE FROM patients WHERE id = $1`, [id]); // rowCount says how many rows deleted
  return rowCount > 0;                          // True if a row was removed
}
