/* a small full-stack Patient Intake app.frontend is React with react-hook-form & a few reusable components. backend is Node + Express. Data is stored in PostgreSQL

 *****app.js is where the Express app is created***I install middleware for security (helmet), CORS to allow the React app to talk to the API, the JSON parser, and logging (morgan).I expose a quick GET /health route so I can test connectivity quickly.” Then I mount the patients router under /api/patients. Finally, I start the server on port 4000 (or PORT from .env).*****
 
 * - Routers (like patientsRouter) handle specific URL paths.

 * Talks to:
 * - patients.routes.js (your API endpoints for /api/patients) - db.js (used indirectly by the routes/models to query Postgres)
 * - .env (for PORT and DATABASE_URL — read at startup via dotenv)  */

import 'dotenv/config'                                                     // Loads environment variables from .env into process.env (e.g., PORT, DATABASE_URL)
import express from 'express'                                             // minimal web framework for Node.js (routing, middleware)
import cors from 'cors'                                                  // CORS = allow the frontend (different origin/port) to call this API
import helmet from 'helmet'                                             // Helmet = sets HTTP headers that add a baseline of security
import morgan from 'morgan'                                             // Morgan = request logger (e.g., "GET /health 200 12ms")
import patientsRouter from './routes/patients.routes.js'                // Router that handles /api/patients endpoints

const app = express()                                                   // Create a single Express app instance for the whole server

// Global middleware (order matters)
app.use(helmet())                                                        // Security headers (safe defaults)
app.use(cors({ origin: '*' }))                                          // Allow requests from any origin (OK for learning; restrict in production)
app.use(express.json())                                                 // Parse JSON request bodies into req.body
app.use(morgan('dev'))                                                  // Log each request to the console (method, path, status, response time)

// Health check routes- A tiny endpoint to confirm the server is up. 
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// Application routes-  Mount the patients router under /api/patients, e.g.:
//   GET    /api/patients , POST   /api/patients ,   GET    /api/patients/:id,  PATCH  /api/patients/:id , DELETE /api/patients/:id
app.use('/api/patients', patientsRouter)

//Start the HTTP server- Reads PORT from .env (fallback 4000). When this runs, your API becomes reachable at http://localhost:PORT
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})

