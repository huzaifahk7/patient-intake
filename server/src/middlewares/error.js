// src/middlewares/error.js

// ① Must be registered AFTER routes (in app.js).
// ② Any uncaught error falls back here; return a consistent 500 JSON.

export function errorHandler(err, req, res, next) {
    console.error(err)                                      // Log full error on the server for debugging.
    res.status(500).json({                                  // Hide stack from clients; send simple message.
        error: 'ServerError',
        message: err?.message || 'Unexpected error',
    })
}
