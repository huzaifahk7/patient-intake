// Purpose: A tiny wrapper specific to "patients" endpoints.
// All components use these functions instead of calling fetch() directly.

import { http } from './client' // Shared fetch helper (adds base URL, JSON headers, consistent errors)

export const Patients = {
    /**
     * list({ page, pageSize, q })
     * - Calls GET /patients with pagination + search query.
     * - Returns { items, total, page, pageSize } from the server.
     */
    list: ({ page = 1, pageSize = 10, q = '' } = {}) => {
        // Build a safe query string like ?page=1&pageSize=10&q=abc
        const u = new URLSearchParams()
        u.set('page', String(page))
        u.set('pageSize', String(pageSize))
        if (q) u.set('q', q) // only include q if non-empty (keeps URL clean)
        return http(`/patients?${u.toString()}`)
    },

    /**
     * get(id)
     * - Calls GET /patients/:id to fetch one patient.
     */
    get: (id) => http(`/patients/${id}`),

    /**
     * create(data)
     * - Calls POST /patients with a JSON body to create a patient.
     */
    create: (data) => http('/patients', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    /**
     * update(id, data)
     * - Calls PATCH /patients/:id with only the fields you want to change.
     */
    update: (id, d) => http(`/patients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(d)
    }),

    /**
     * remove(id)
     * - Calls DELETE /patients/:id. Returns null on 204 No Content.
     */
    remove: (id) => http(`/patients/${id}`, { method: 'DELETE' }),
}

// Why this matters:
// - All API calls for "patients" are centralized and consistent.
// - If you ever change headers, base URL, or error handling, update http() once.
