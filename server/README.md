Milestone 1 — Backend skeleton + dev environment 
package.json , app.js , 

Milestone 2 — PostgreSQL + first table + API read 
migrate.sql , seed.sql , .env , db.js , patients.model.js , patients.routes.js , app.js

Milestone 3 — Create (POST) a patient with validation 
patient.schema.js , patients.model.js , patients.routes.js , 

Milestone 4 — Read One, Update, Delete (GET/:id, PATCH/:id, DELETE/:id)
patient.schema.js , patients.model.js , patients.routes.js , 

Milestone 5: Frontend scaffold (React + Vite) and “Hello API” (just read the /health endpoint so we know browser ↔ backend works).   
.env, client.js , main.jsx , App.jsx

Milestone 6: Patients List page (fetch and display from GET /api/patients).
patients.js , PatientsList.jsx , App.jsx , 

Milestone 7: Create Patient form (react-hook-form → POST /api/patients).
patients.js , PatientCreate.jsx , App.jsx

Milestone 8: Edit Patient page (GET /:id + react-hook-form + PATCH /:id) and Delete.
patients.js , PatientEdit.jsx , App.jsx , PatientsList.jsx , 

Milestone 9: Client-side validation polish (nice errors, required fields).
patientSchema.js, Flash.jsx, PatientsList.jsx , PatientCreate.jsx , PatientEdit.jsx , 

Milestone 10 (optional but recommended): UX polish (loading states, toasts), pagination/search on the backend & frontend.
patients.model.js , patients.routes.js , patients.js , PatientsList.jsx



CRUD- CREATE, READ, UPDATE, DELETE
I built a full-stack Patient Intake app with React on the frontend, Express/Node on the backend, and PostgreSQL as the database. 
It supports full CRUD, client/server validation, and simple pagination & search. 
I can trace any request end-to-end—from a button click in React, to a parameterized SQL statement in Postgres