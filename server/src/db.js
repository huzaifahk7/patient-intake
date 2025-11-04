/**
 * db.js — Single place to talk to PostgreSQL (connection pool + tiny helper).
 *
 * Why a pool?
 * - Opening a DB connection is expensive. A Pool keeps a small set of connections
 *   ready to use and reuses them for each query, which is faster and scalable.
 *
 * Who uses this?
 * - Your model files (e.g., patients.model.js) import { query } to run SQL.
 * - Routes call models; models call query(); query() uses the Pool under the hood.
 *
 * Config:
 * - Reads the connection string from process.env.DATABASE_URL (set in .env).
 */
// src/db.js

import pkg from 'pg'                                      // ① Import the pg driver package (CommonJS compat).
const { Pool } = pkg                                      // ② Get the Pool class (manages reusable connections).

// ③ Create one pool for the entire process (module singleton).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,             // ④ Read DB URL from .env (e.g., postgres://user:pass@localhost:5432/patient_intake)
})

/**
 * query(text, params)
 * @param {string} text   SQL with placeholders, e.g. 'SELECT * FROM patients WHERE id = $1'
 * @param {Array}  params Values for placeholders, e.g. [123]
 * @returns pg.Result     Has .rows (array), .rowCount (number), etc.
 */
export async function query(text, params) {               // ⑤ Exported helper used by all models.
  const start = Date.now()                                 // ⑥ Timestamp before sending to DB (for timing).
  const res = await pool.query(text, params)               // ⑦ Run the SQL via a pooled connection.
  const duration = Date.now() - start                      // ⑧ Compute elapsed time in ms.
  console.log('executed query', {                          // ⑨ Log basic info for learning/debugging.
    text, duration: `${duration}ms`, rows: res.rowCount
  })
  return res                                               // ⑩ Return full pg result to caller.
}
