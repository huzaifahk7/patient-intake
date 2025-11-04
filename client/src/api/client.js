// client/src/api/client.js

/**
 * Purpose:
 * A tiny, central helper for making HTTP calls from the frontend to your backend API.
 * All UI code should use `http()` so your fetch logic and error handling stay consistent.
 *
 * How it connects:
 * - Reads BASE URL from Vite env (client/.env: VITE_API_BASE)
 * - Components call `http('/patients')`, `http('/patients/123', { method: 'PATCH', ... })`, etc.
 */

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'
// ^ Where to send all API requests.
// - In dev, VITE_API_BASE is usually "http://localhost:4000/api".
// - If not set, we default to localhost:4000/api.
// - In production, you can point this at your deployed API (e.g., https://api.example.com/api).

/**
 * http(path, options?)
 * @param {string} path - The API path (e.g., '/patients', '/patients/3')
 * @param {object} options - fetch options (method, body, headers). Defaults to {}.
 * @returns {Promise<any>} - JSON from the server, or `null` if the server returned 204 No Content.
 *
 * Behavior:
 * - Merges your options with a default JSON Content-Type header.
 * - Throws a readable Error if `res.ok` is false (4xx/5xx).
 * - Parses JSON automatically on success.
 */
export async function http(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    // Default header so most endpoints receive/return JSON.
    headers: { 'Content-Type': 'application/json' },
    // Allow callers to specify method/body/headers/etc. (these can override defaults).
    ...options,
  })

  // If response code is not in the 200–299 range, try to parse JSON error and throw.
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) // If body isn't JSON, use empty object.
    throw new Error(err.message || res.statusText)
  }

  // Many DELETE requests return 204 (No Content). In that case, return `null`.
  return res.status === 204 ? null : res.json()
}
