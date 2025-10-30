//this function is your one place to talk to the server and get JSON back.

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'; //Reads environment variable from .env & the frontend always knows where to send API requests.


//Exports helper function used everywhere in UI to make HTTP requests. path is the API path (e.g., '/patients'). options lets you pass method, body, headers later (POST, PATCH).
export async function http(path, options = {}) { 
  const res = await fetch(`${BASE}${path}`, {                              // Sends the request with fetch & Builds the full URL by combining BASE (from .env) + path.
    headers: { 'Content-Type': 'application/json' },                       //Sets a default header: Content-Type: application/json (most of our endpoints accept JSON).
    ...options,                                                            //Spreads ...options so you can override method (GET, POST, etc.) and add a JSON body later
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));                        //“not OK”,If the backend replies with an error status we throw a readable error.
    throw new Error(err.message || res.statusText);
  }
  return res.status === 204 ? null : res.json();                           //Otherwise we give you the JSON reply.
}
