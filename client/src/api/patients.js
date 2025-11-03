// client/src/api/patients.js
import { http } from './client'                           // Shared fetch helper (adds base URL, JSON headers, error handling)

// Patients.list() calls http('/patients') → which becomes a GET to: http://localhost:4000/api/patients
export const Patients = {
    // Accept params and build a query string
    list: ({ page = 1, pageSize = 10, q = '' } = {}) => { // Allow caller to pass page/pageSize/search
        const u = new URLSearchParams()                   // Build ?page=..&pageSize=..&q=.. safely
        u.set('page', String(page))
        u.set('pageSize', String(pageSize))
        if (q) u.set('q', q)                              // Only include q if non-empty
        return http(`/patients?${u.toString()}`)          // Returns { items, total, page, pageSize } from server
    },
    get: (id) => http(`/patients/${id}`),             // GET one patient
    create: (data) => http('/patients', { method: 'POST', body: JSON.stringify(data) }),  // POST create
    update: (id, d) => http(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(d) }), // PATCH update
    remove: (id) => http(`/patients/${id}`, { method: 'DELETE' }), // DELETE remove
}
