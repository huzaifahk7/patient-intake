// src/utils/responses.js

// ① ok(res, data) → 200 JSON
export const ok = (res, data) => res.json(data)

// ② created(res, data) → 201 JSON (for POST-create)
export const created = (res, data) => res.status(201).json(data)

// ③ noContent(res) → 204 No Content (for DELETE success)
export const noContent = (res) => res.status(204).send()
