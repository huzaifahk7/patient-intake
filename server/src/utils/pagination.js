// src/utils/pagination.js

// ① parsePage: ensure a positive integer; default to 1 if invalid.
export function parsePage(input, def = 1) {
    const n = Number(input)
    return Number.isInteger(n) && n > 0 ? n : def
}

// ② parsePageSize: ensure [1..max]; default to 10 if invalid.
export function parsePageSize(input, def = 10, max = 100) {
    const n = Number(input)
    if (!Number.isInteger(n) || n < 1) return def
    return Math.min(n, max)
}
