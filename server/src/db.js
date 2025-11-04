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

import pkg from 'pg'
const { Pool } = pkg

// Create one pool for the whole app.
// Example DATABASE_URL in .env (adjust for your local password/DB name):
//   DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/patient_intake
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

/**
 * query(text, params)
 * - text:   SQL with $1, $2 placeholders (e.g., 'SELECT * FROM patients WHERE id = $1')
 * - params: array of values to safely bind to placeholders (prevents SQL injection)
 *
 * Returns: the full pg Result object (rows, rowCount, etc.).
 * Also logs timing info to help you see how long queries take while learning/debugging.
 */
export async function query(text, params) {
  const start = Date.now()                     // Record start time (ms)
  const res = await pool.query(text, params)   // Run the SQL via a pooled connection
  const duration = Date.now() - start          // Compute how long it took (ms)
  console.log('executed query', {
    text,                                      // The SQL string (useful while debugging)
    duration: `${duration}ms`,
    rows: res.rowCount                         // How many rows were affected/returned
  })
  return res
}

/*
Tip:
- Always use parameterized queries with $1, $2, ... and pass values via "params".
  That prevents SQL injection and keeps your code clean.
- db.js is intentionally tiny so the rest of your app doesn't manage connections directly.
*/
