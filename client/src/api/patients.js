//***“When frontend asks for patients, it sends things like page=2 and pageSize=10. pagination.js checks those numbers to make sure they’re valid — not negative, not too big — and sets safe defaults if they’re missing.” */

import { http } from './client' // Shared fetch helper (adds base URL, JSON headers, consistent errors)

export const Patients = {
    /** list({ page, pageSize, q }) , Calls GET /patients with pagination + search query, Returns { items, total, page, pageSize } from the server. */

    list: ({ page = 1, pageSize = 10, q = '' } = {}) => {
        const u = new URLSearchParams()                                                              // Build a safe query string like ?page=1&pageSize=10&q=abc
        u.set('page', String(page))
        u.set('pageSize', String(pageSize))
        if (q) u.set('q', q)                                                                        // only include q if non-empty (keeps URL clean)
        return http(`/patients?${u.toString()}`)
    },

    get: (id) => http(`/patients/${id}`),                                                           /** Calls GET /patients/:id to fetch one patient. */

    create: (data) => http('/patients', {                                                           /**Calls POST /patients with a JSON body to create a patient.*/
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, d) => http(`/patients/${id}`, {                                                     /**Calls PATCH /patients/:id with only the fields you want to change.*/
        method: 'PATCH',
        body: JSON.stringify(d)
    }),

    remove: (id) => http(`/patients/${id}`, { method: 'DELETE' }),                                  /**Calls DELETE /patients/:id. Returns null on 204 No Content. */
}

