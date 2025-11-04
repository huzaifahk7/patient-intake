// patients.routes.js
// Purpose: Define HTTP endpoints for "patients". Each route validates input (Zod) and delegates
//          database work to the model functions. Returns clean JSON responses for the frontend.

import { Router } from 'express'
import {
    listPatientsPaged,
    createPatient,
    getPatient,
    updatePatient,
    deletePatient,
} from '../models/patients.model.js'
import {
    patientCreateSchema,
    patientUpdateSchema, // same rules as createSchema, but every field optional (for PATCH)
} from '../schemas/patient.schema.js'

const r = Router() // A standalone mini-app for /api/patients routes

// GET /api/patients?page=1&pageSize=10&q=term
// Lists patients with pagination and optional search.
r.get('/', async (req, res, next) => {
    try {
        const { page, pageSize, q } = req.query
        const data = await listPatientsPaged({ page, pageSize, q })
        res.json(data) // { items, total, page, pageSize }
    } catch (err) {
        next(err) // Pass unexpected errors to Express' global handler
    }
})

// POST /api/patients
// Create a new patient. Validates the request body before inserting.
r.post('/', async (req, res, next) => {
    try {
        const data = patientCreateSchema.parse(req.body) // throws if invalid
        const created = await createPatient(data)
        res.status(201).json(created) // 201 Created + new row
    } catch (err) {
        // If Zod threw a validation error, return a clear 400 with details.
        if (err?.issues) {
            return res.status(400).json({ error: 'ValidationError', details: err.issues })
        }
        next(err)
    }
})

// GET /api/patients/:id
// Read a single patient by id.
r.get('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id) // URL params are strings → convert to number
        const item = await getPatient(id)
        if (!item) return res.status(404).json({ error: 'NotFound' })
        res.json(item)
    } catch (err) {
        next(err)
    }
})

// PATCH /api/patients/:id
// Partially update a patient. Only fields sent in the body are changed.
r.patch('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        const data = patientUpdateSchema.parse(req.body) // every field optional
        const updated = await updatePatient(id, data)
        if (!updated) return res.status(404).json({ error: 'NotFound' })
        res.json(updated)
    } catch (err) {
        if (err?.issues) {
            return res.status(400).json({ error: 'ValidationError', details: err.issues })
        }
        next(err)
    }
})

// DELETE /api/patients/:id
// Delete a patient. Returns 204 on success, 404 if not found.
r.delete('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        const ok = await deletePatient(id)
        if (!ok) return res.status(404).json({ error: 'NotFound' })
        res.status(204).send() // 204 No Content
    } catch (err) {
        next(err)
    }
})

export default r

/*
Flow summary:
- Router parses the request (params/body/query).
- Zod (schemas) validates data for POST/PATCH; if invalid → 400 with details.
- Model functions run parameterized SQL and return rows.
- Responses are clean JSON: either a resource (200/201), nothing (204), or a clear error (404/400).
*/
