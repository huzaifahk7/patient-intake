// patients.model.js
// Purpose: All database operations (SQL) for the "patients" resource live here.
// Routes call these functions; each function uses the shared query() helper to talk to Postgres.

import { query } from '../db.js' // Uses the pooled Postgres client (single doorway to the DB)

// A reusable SELECT list. We alias snake_case DB columns → camelCase JSON keys for consistent API output.
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

// ---------- LIST (legacy: no pagination) ----------
// Returns ALL rows (latest first). Kept for compatibility if any code still needs it.
export async function listPatients() {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM patients ORDER BY id DESC`
  )
  return rows
}

// ---------- LIST (with pagination + search) ----------
// Returns a specific page of results and supports a simple text search across several columns.
export async function listPatientsPaged({ page = 1, pageSize = 10, q = '' } = {}) {
  // Normalize and clamp inputs to safe ranges.
  page = Number(page)
  pageSize = Number(pageSize)
  if (!Number.isInteger(page) || page < 1) page = 1
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) pageSize = 10

  // OFFSET = how many rows to skip; LIMIT = how many rows to return.
  const offset = (page - 1) * pageSize

  // If q is non-empty, build a WHERE clause. ILIKE = case-insensitive match in Postgres.
  const hasQ = q && String(q).trim() !== ''
  const where = hasQ
    ? `WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR phone_number ILIKE $1 OR health_issue ILIKE $1`
    : ''

  // Use parameterized input to avoid SQL injection. $1 will be replaced by the array value below.
  const params = hasQ ? [`%${q}%`] : []

  // 1) Get the total count for pagination UI (how many results exist for this query?).
  const countSql = `SELECT COUNT(*)::int AS total FROM patients ${where}`
  const { rows: countRows } = await query(countSql, params)
  const total = countRows[0]?.total ?? 0

  // 2) Fetch the current page of items using LIMIT/OFFSET.
  const itemsSql = `
    SELECT ${COLUMNS}
    FROM patients
    ${where}
    ORDER BY id DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `
  const { rows: items } = await query(itemsSql, params)

  // Return both the items and the pagination info so the frontend can render controls.
  return { items, total, page, pageSize }
}

// ---------- GET ONE ----------
// Fetch a single patient by id. Returns the row or null if not found.
export async function getPatient(id) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM patients WHERE id = $1`,
    [id] // Parameterized value for $1
  )
  return rows[0] || null
}

// ---------- CREATE ----------
// Insert a new patient. Optional fields can be null in the DB.
export async function createPatient(p) {
  const { rows } = await query(
    `
    INSERT INTO patients (first_name, last_name, age, phone_number, health_issue)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${COLUMNS}
    `,
    [
      p.firstName,           // $1
      p.lastName,            // $2
      p.age ?? null,         // $3 (null if undefined)
      p.phoneNumber,         // $4
      p.healthIssue ?? null, // $5 (null if undefined)
    ]
  )
  return rows[0]
}

// ---------- UPDATE (partial) ----------
// Updates only the fields provided (PATCH semantics). Unknown keys are ignored.
export async function updatePatient(id, p) {
  // Map JSON keys → DB columns
  const map = {
    firstName: 'first_name',
    lastName: 'last_name',
    age: 'age',
    phoneNumber: 'phone_number',
    healthIssue: 'health_issue',
  }

  const fields = [] // e.g., ["first_name = $1", "age = $2", ...]
  const values = [] // corresponding values for placeholders
  let i = 1         // placeholder counter

  // Build the SET clause dynamically from provided keys.
  for (const [key, value] of Object.entries(p)) {
    if (value === undefined) continue             // Skip keys not sent in PATCH
    const col = map[key]
    if (!col) continue                            // Skip unknown keys
    fields.push(`${col} = $${i++}`)
    values.push(value)
  }

  // If nothing to update, just return the current row (no-op).
  if (fields.length === 0) {
    return await getPatient(id)
  }

  // WHERE id is the last placeholder.
  values.push(id)

  const { rows } = await query(
    `UPDATE patients SET ${fields.join(', ')} WHERE id = $${i} RETURNING ${COLUMNS}`,
    values
  )
  return rows[0] || null
}

// ---------- DELETE ----------
// Delete by id. Returns true if a row was deleted, false if nothing matched.
export async function deletePatient(id) {
  const { rowCount } = await query(`DELETE FROM patients WHERE id = $1`, [id])
  return rowCount > 0
}
