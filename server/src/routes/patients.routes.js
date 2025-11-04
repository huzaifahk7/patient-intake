// src/routes/patients.routes.js

import { Router } from 'express'                           // ① Create a sub-router (mini app) for patients.
import {
    listPatientsPaged, createPatient, getPatient,
    updatePatient, deletePatient
} from '../models/patients.model.js'                       // ② Model functions → they run the SQL.
import {
    patientCreateSchema, patientUpdateSchema
} from '../schemas/patient.schema.js'                      // ③ Zod schemas → shape & rules for POST/PATCH bodies.

import { validate } from '../middlewares/validate.js'      // ④ Middleware: validate req.body with a schema.
import { asyncH } from '../middlewares/async.js'           // ⑤ Middleware: wrap async handlers to forward errors.
import { ok, created, noContent } from '../utils/responses.js' // ⑥ Helpers to send common HTTP responses.
import { parsePage, parsePageSize } from '../utils/pagination.js' // ⑦ Clamp/sanitize pagination inputs.

const r = Router()                                         // ⑧ Build the patients router.

// GET /api/patients?page=&pageSize=&q=
// List patients with pagination + optional search.
r.get('/', asyncH(async (req, res) => {                    // ⑨ Wrap in asyncH so thrown errors go to error handler.
    const page = parsePage(req.query.page)                   // ⑩ Turn ?page= into a positive int or default 1.
    const pageSize = parsePageSize(req.query.pageSize)       // ⑪ Turn ?pageSize= into [1..100] or default 10.
    const q = (req.query.q ?? '').toString()                 // ⑫ Search text (string, possibly empty).
    const data = await listPatientsPaged({ page, pageSize, q }) // ⑬ Ask model for paged results from DB.
    ok(res, data)                                            // ⑭ 200 OK with { items, total, page, pageSize }.
}))

// POST /api/patients
// Create a new patient (server-side validation via Zod).
r.post('/', validate(patientCreateSchema), asyncH(async (req, res) => {
    const createdRow = await createPatient(req.valid)        // ⑮ validate() put parsed body on req.valid.
    created(res, createdRow)                                 // ⑯ 201 Created with the inserted row.
}))

// GET /api/patients/:id
// Fetch a single patient by id.
r.get('/:id', asyncH(async (req, res) => {
    const id = Number(req.params.id)                         // ⑰ Params are strings → convert to number.
    const item = await getPatient(id)                        // ⑱ Ask model for row (or null).
    if (!item) return res.status(404).json({ error: 'NotFound' }) // ⑲ If not found → 404.
    ok(res, item)                                            // ⑳ Otherwise → 200 with the row.
}))

// PATCH /api/patients/:id
// Partially update a patient. Only provided fields are changed.
r.patch('/:id', validate(patientUpdateSchema), asyncH(async (req, res) => {
    const id = Number(req.params.id)                         // ㉑ Convert :id to number.
    const updated = await updatePatient(id, req.valid)       // ㉒ Model builds a dynamic UPDATE for provided keys.
    if (!updated) return res.status(404).json({ error: 'NotFound' }) // ㉓ Missing id → 404.
    ok(res, updated)                                         // ㉔ Return updated row.
}))

// DELETE /api/patients/:id
// Remove a patient by id.
r.delete('/:id', asyncH(async (req, res) => {
    const id = Number(req.params.id)                         // ㉕ Convert :id to number.
    const removed = await deletePatient(id)                  // ㉖ true if a row was deleted.
    if (!removed) return res.status(404).json({ error: 'NotFound' }) // ㉗ Missing id → 404.
    noContent(res)                                           // ㉘ 204 No Content on success.
}))

export default r                                           // ㉙ Export router; mounted in app.js under /api/patients.
