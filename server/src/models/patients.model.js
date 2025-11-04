// src/models/patients.model.js

import { query } from '../db.js'                           // ① Shared helper to run SQL using the pg Pool.

// ② Reusable column list with aliases: DB snake_case → API camelCase - for Consistency with tooling and clean api
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

// ③ Pagination + search list (primary list endpoint).
export async function listPatientsPaged({ page = 1, pageSize = 10, q = '' } = {}) {
  // ④ Normalize/clamp incoming numbers (defense-in-depth).
  page = Number(page)
  pageSize = Number(pageSize)
  if (!Number.isInteger(page) || page < 1) page = 1
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) pageSize = 10

  // ⑤ Compute LIMIT/OFFSET for the requested page. LIMIT → return at most rows.OFFSET → skip rows first, then start returning rows
  const offset = (page - 1) * pageSize

  // ⑥ Build WHERE if we have a non-empty search term; ILIKE is case-insensitive LIKE in Postgres.
  const hasQ = q && String(q).trim() !== ''
  const where = hasQ
    ? `WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR phone_number ILIKE $1 OR health_issue ILIKE $1`
    : ''
  const params = hasQ ? [`%${q}%`] : [] // ⑦ Parameter value for $1 (prevents SQL injection).

  // ⑧ Count total matches for pagination UI.
  const countSql = `SELECT COUNT(*)::int AS total FROM patients ${where}`
  const { rows: countRows } = await query(countSql, params)
  const total = countRows[0]?.total ?? 0

  // ⑨ Fetch the current page of rows using LIMIT/OFFSET.
  const itemsSql = `
    SELECT ${COLUMNS}
    FROM patients
    ${where}
    ORDER BY id DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `
  const { rows: items } = await query(itemsSql, params)

  // ⑩ Return both data and metadata.
  return { items, total, page, pageSize }
}

// ⑪ Read a single patient by id. Null if not found.
export async function getPatient(id) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM patients WHERE id = $1`,
    [id]                                            // ⑫ Parameterized id.
  )
  return rows[0] || null
}

// ⑬ Insert a new patient row and return it.
export async function createPatient(p) {
  const { rows } = await query(
    `
    INSERT INTO patients (first_name, last_name, age, phone_number, health_issue)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${COLUMNS}
    `,
    [
      p.firstName,               // ⑭ $1
      p.lastName,                // ⑮ $2
      p.age ?? null,             // ⑯ $3 (null if undefined)
      p.phoneNumber,             // ⑰ $4
      p.healthIssue ?? null,     // ⑱ $5 (null if undefined)
    ]
  )
  return rows[0]
}

// ⑲ Partially update a patient. Only provided fields are changed.
export async function updatePatient(id, p) {
  // ⑳ Map API keys (camelCase) to DB column names (snake_case).
  const map = {
    firstName: 'first_name',
    lastName: 'last_name',
    age: 'age',
    phoneNumber: 'phone_number',
    healthIssue: 'health_issue',
  }

  const fields = []   // ㉑ e.g., ["first_name = $1", "age = $2"]
  const values = []   // ㉒ the corresponding values
  let i = 1           // ㉓ placeholder counter

  // ㉔ Build the SET clause from provided keys only.
  for (const [key, value] of Object.entries(p)) {
    if (value === undefined) continue                  // skip absent keys
    const col = map[key]                               // find column name
    if (!col) continue                                 // ignore unknown keys
    fields.push(`${col} = $${i++}`)                    // push "col = $i"
    values.push(value)                                 // push actual value
  }

  // ㉕ No fields to update → just return current row (no-op).
  if (fields.length === 0) {
    return await getPatient(id)
  }

  // ㉖ Add id as the last placeholder in WHERE.
  values.push(id)

  // ㉗ Perform the update and return the updated row (or null if id missing).
  const { rows } = await query(
    `UPDATE patients SET ${fields.join(', ')} WHERE id = $${i} RETURNING ${COLUMNS}`,
    values
  )
  return rows[0] || null
}

// ㉘ Delete a patient by id. Returns true if a row was removed.
export async function deletePatient(id) {
  const { rowCount } = await query(`DELETE FROM patients WHERE id = $1`, [id])
  return rowCount > 0
}
