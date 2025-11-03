// client/src/api/patients.js
import { http } from './client'

// Patients.list() calls http('/patients') → which becomes a GET request to:http://localhost:4000/api/patients

export const Patients = {
    // Accept params and build a query string
    list: ({ page = 1, pageSize = 10, q = '' } = {}) => {
        const u = new URLSearchParams()
        u.set('page', String(page))
        u.set('pageSize', String(pageSize))
        if (q) u.set('q', q)
        return http(`/patients?${u.toString()}`) // returns { items, total, page, pageSize }
    },
    get: (id) => http(`/patients/${id}`),
    create: (data) => http('/patients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, d) => http(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(d) }),
    remove: (id) => http(`/patients/${id}`, { method: 'DELETE' }),
}