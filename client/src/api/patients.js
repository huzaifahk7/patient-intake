// client/src/api/patients.js
import { http } from './client'

// Patients.list() calls http('/patients') → which becomes a GET request to:http://localhost:4000/api/patients

//Patients.list() calls your backend /api/patients and returns JSON.
export const Patients = {
    list: () => http('/patients'),                                   // list() hits GET /api/patients and returns a JSON array.
    get: (id) => http(`/patients/${id}`),                           // get(id) hits GET /api/patients/:id and returns one JSON object.
    create: (data) =>                                               //Patients.create(data) will send your form data to the backend’s POST /api/patients

        http('/patients', { method: 'POST', body: JSON.stringify(data) }),

    update: (id, data) =>                                           //sends a PATCH to change fields.

        http(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    remove: (id) =>                                                 //sends a DELETE.

        http(`/patients/${id}`, { method: 'DELETE' }),
}