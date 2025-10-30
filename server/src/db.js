// server/src/db.js (DB client (db.js) — the single doorway your server uses to talk to Postgres.)

import pkg from 'pg';
const { Pool } = pkg;                                                   //a pool manages a set of DB connections so we can reuse them efficiently


const pool = new Pool({ connectionString: process.env.DATABASE_URL });  //Creates one pool for the whole app and reads DATABASE_URL (from .env)


//text is the SQL string (e.g., "SELECT * FROM patients WHERE id = $1").params is an array of values for the $1, $2, … placeholders


export async function query(text, params) {  //asynchronous helper function, query, that files can import and call with a SQL string (text) and placeholder values (params).
    const start = Date.now();                //Records the ms timestamp right before we run the SQL so we can later calculate how long the database call took.
    const res = await pool.query(text, params); //Sends SQL and parameters to PostgreSQL using shared connection pool and waits for database to respond with result object (res)
    const duration = Date.now() - start;       //Measures the query’s elapsed time by subtracting the earlier start time from the current time, producing a duration in ms
    console.log('executed query', { text, duration: `${duration}ms`, rows: res.rowCount }); //It times how long the query took and logs it (helpful while learning).
return res;                                                             //Returns the full res object from pg
}
