/**
 * app.js — Creates the Express app, installs middleware, and mounts routes.
 *
 * How it fits together:
 * - Express is the web server.
 * - Middleware runs on every request (security, CORS, JSON parsing, logging).
 * - Routers (like patientsRouter) handle specific URL paths.
 * - This file also starts the HTTP server on a port so the app can accept requests.
 *
 * Talks to:
 * - patients.routes.js (your API endpoints for /api/patients)
 * - db.js (used indirectly by the routes/models to query Postgres)
 * - .env (for PORT and DATABASE_URL — read at startup via dotenv)
 */

import 'dotenv/config'          // Loads environment variables from .env into process.env (e.g., PORT, DATABASE_URL)
import express from 'express'   // Express = minimal web framework for Node.js (routing, middleware)
import cors from 'cors'         // CORS = allow the frontend (different origin/port) to call this API
import helmet from 'helmet'     // Helmet = sets HTTP headers that add a baseline of security
import morgan from 'morgan'     // Morgan = request logger (e.g., "GET /health 200 12ms")
import patientsRouter from './routes/patients.routes.js' // Router that handles /api/patients endpoints

const app = express()           // Create a single Express app instance for the whole server

// -----------------------
// Global middleware (order matters)
// -----------------------

app.use(helmet())               // Security headers (safe defaults)
app.use(cors({ origin: '*' }))  // Allow requests from any origin (OK for learning; restrict in production)
app.use(express.json())         // Parse JSON request bodies into req.body
app.use(morgan('dev'))          // Log each request to the console (method, path, status, response time)

// -----------------------
// Health check routes
// -----------------------
// A tiny endpoint to confirm the server is up. Useful for frontend "Hello API" tests and deployment health checks.
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// -----------------------
// Application routes
// -----------------------
// Mount the patients router under /api/patients, e.g.:
//   GET    /api/patients
//   POST   /api/patients
//   GET    /api/patients/:id
//   PATCH  /api/patients/:id
//   DELETE /api/patients/:id
app.use('/api/patients', patientsRouter)

// -----------------------
// Start the HTTP server
// -----------------------
// Reads PORT from .env (fallback 4000). When this runs, your API becomes reachable at http://localhost:PORT
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})

/*
Notes:
- If later you add automated tests, a common pattern is to:
  - export the app from this file (without app.listen),
  - and create src/index.js that imports the app and calls app.listen().
  That lets tests import the app without opening a real network port.
*/
