// Routes (patients.routes.js) — HTTP endpoints (what URLs exist and what they do).

import { Router } from 'express';
import {
    listPatients,
    createPatient,
    getPatient,
    updatePatient,
    deletePatient,
} from '../models/patients.model.js';
import {
    patientCreateSchema,
    patientUpdateSchema,                                    //a Zod schema where every field is optional (.partial()), perfect for PATCH (partial updates).
} from '../schemas/patient.schema.js';


const r = Router();                                         //Creates a new router instance r that will hold all patient-related HTTP routes.

// GET /api/patients
r.get('/', async (req, res, next) => {                      //Registers a GET handler on this router’s root path ('/'), which becomes /api/patients after mounting in app.js.
    try {
        const items = await listPatients();                 //Calls the model to fetch patients from Postgres and waits for the result.
        res.json(items);                                    //Sends the fetched array back to the client as JSON, completing the request/response cycle
    } catch (err) {                                             //Catches any runtime or DB error
        next(err);                                          //Passes the error to Express’s global error handler instead of crashing 
    }
});


r.post('/', async (req, res, next) => {
    try {
        const data = patientCreateSchema.parse(req.body);       // 1) Validate the body against our schema
        const created = await createPatient(data);              // 2) Insert into DB
        res.status(201).json(created);                          // 3) Respond with 201 Created and the new row
    } catch (err) {

        if (err?.issues) {                                      // If it's a Zod validation error, return 400 with details
            return res.status(400).json({ error: 'ValidationError', details: err.issues });
        }
        next(err);
    }
});


//-----------------------> model functions that run the actual SQL. Routes never write SQL; they delegate to models.<------------------------------//

// GET /api/patients/:id
r.get('/:id', async (req, res, next) => {                        //We define a GET route that expects an id in the URL
    try {
        const id = Number(req.params.id);                        //URL params are strings; we convert to a number for the DB.
        const item = await getPatient(id);                      //Ask the model to fetch that row from Postgres
        if (!item) return res.status(404).json({ error: 'NotFound' }); //If it doesn’t exist, send 404 Not Found.
        res.json(item);                                         //On success, send the one patient as JSON with default 200 OK.
    } catch (err) {                                             //Pass unexpected errors to Express’ error handler
        next(err);
    }
});

// PATCH /api/patients/:id
r.patch('/:id', async (req, res, next) => {                      //PATCH means “change only the fields I send.
    try {
        const id = Number(req.params.id);                       //URL params are strings; we convert to a number for the DB.
        const data = patientUpdateSchema.parse(req.body);       // Validate the incoming body.
        const updated = await updatePatient(id, data);          //Ask the model to do a parameterized SQL update for just the provided fields.
        if (!updated) return res.status(404).json({ error: 'NotFound' }); //If no such id, it’s a 404 (consistent with GET).
        res.json(updated);                                      //return updated row (200).
    } catch (err) {                                             //If anything throws an error, execution jumps here with the error in err
        if (err?.issues) {                                      //if err.issues exists, we know this is a validation error, not a server crash.
            return res                                          //Bad Request
                .status(400)
                .json({ error: 'ValidationError', details: err.issues });
        }
        next(err);                                              //If it wasn’t a validation error, pass the error to Express’s global error handler.
    }
});

// DELETE /api/patients/:id
r.delete('/:id', async (req, res, next) => {                    //We define a delete route by id.
    try {
        const id = Number(req.params.id);                       //URL params are strings; we convert to a number for the DB.
        const ok = await deletePatient(id);                     //Model returns true if a row was deleted, false if the id didn’t exist.
        if (!ok) return res.status(404).json({ error: 'NotFound' }); //Deleting a missing thing is a 404 (resource not found)
        res.status(204).send(); // No Content on success
    } catch (err) {
        next(err);
    }
});

export default r
