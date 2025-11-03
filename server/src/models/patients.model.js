// server/src/models/patients.model.js
import { query } from '../db.js';

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

// --------- LIST (no pagination) - kept for compatibility ---------
export async function listPatients() {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM patients ORDER BY id DESC`
  );
  return rows;
}

// --------- LIST (pagination + search) ---------
export async function listPatientsPaged({ page = 1, pageSize = 10, q = '' } = {}) {
  page = Number(page);
  pageSize = Number(pageSize);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) pageSize = 10;

  const offset = (page - 1) * pageSize;

  const hasQ = q && String(q).trim() !== '';
  const where = hasQ
    ? `WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR phone_number ILIKE $1 OR health_issue ILIKE $1`
    : '';
  const params = hasQ ? [`%${q}%`] : [];

  const countSql = `SELECT COUNT(*)::int AS total FROM patients ${where}`;
  const { rows: countRows } = await query(countSql, params);
  const total = countRows[0]?.total ?? 0;

  const itemsSql = `
    SELECT ${COLUMNS}
    FROM patients
    ${where}
    ORDER BY id DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;
  const { rows: items } = await query(itemsSql, params);

  return { items, total, page, pageSize };
}

// --------- GET ONE ---------
export async function getPatient(id) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM patients WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

// --------- CREATE ---------
export async function createPatient(p) {
  // Note: send null for optional fields if undefined
  const { rows } = await query(
    `
    INSERT INTO patients (first_name, last_name, age, phone_number, health_issue)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${COLUMNS}
    `,
    [
      p.firstName,
      p.lastName,
      p.age ?? null,
      p.phoneNumber,
      p.healthIssue ?? null,
    ]
  );
  return rows[0];
}

// --------- UPDATE (partial) ---------
export async function updatePatient(id, p) {
  const map = {
    firstName: 'first_name',
    lastName: 'last_name',
    age: 'age',
    phoneNumber: 'phone_number',
    healthIssue: 'health_issue',
  };

  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(p)) {
    if (value === undefined) continue;
    const col = map[key];
    if (!col) continue;
    fields.push(`${col} = $${i++}`);
    values.push(value);
  }

  if (fields.length === 0) {
    // nothing to update, return current row
    return await getPatient(id);
  }

  values.push(id);
  const { rows } = await query(
    `UPDATE patients SET ${fields.join(', ')} WHERE id = $${i} RETURNING ${COLUMNS}`,
    values
  );
  return rows[0] || null;
}

// --------- DELETE ---------
export async function deletePatient(id) {
  const { rowCount } = await query(`DELETE FROM patients WHERE id = $1`, [id]);
  return rowCount > 0;
}
