//App (app.js) — sets up middleware and mounts routes.

import 'dotenv/config';                 // Load environment variables from .env (we'll add one later)
import express from 'express';          //The core library that lets you create a web server easily.
import cors from 'cors';                //Allow requests from another website (like your React frontend running on a different port)
import helmet from 'helmet';            //Adds extra security headers in your responses — e.g., it hides certain server info.
import morgan from 'morgan';            //A logger. Every time you make a request, it prints info in your terminal (like GET /health 200 12ms).
import patientsRouter from './routes/patients.routes.js'; //Imports the router we just defined


const app = express();                  //This line creates your web application.

// --- Middleware: runs before your routes ----------

app.use(helmet());                      // Adds security headers
app.use(cors({ origin: '*' }));         // Allows your React frontend to connect
app.use(express.json());                // Converts JSON text into JS objects
app.use(morgan('dev'));                // Prints logs for each request


// --- Routes ---

app.get('/health', (req, res) => {      //“When someone sends a GET request to /health, respond with some JSON.
    res.json({ ok: true, time: new Date().toISOString() });
});
app.use('/api/patients', patientsRouter); //Mounts” the router.

// --- Server listen ---

const PORT = process.env.PORT || 4000;   //This starts your web server on port 4000 (or any port you set in .env).
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});
