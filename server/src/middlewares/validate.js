// src/middlewares/validate.js

// ① validate(schema) returns an Express middleware that parses req.body with the given Zod schema.
// ② On success: put the parsed value on req.valid and call next().
// ③ On Zod error: return 400 with details (do not hit the route handler).

export const validate = (schema) => (req, res, next) => {
    try {
        req.valid = schema.parse(req.body)                    // Parse & coerce body according to schema.
        next()                                                // Continue to the actual route handler.
    } catch (err) {
        if (err?.issues) {                                    // Zod validation error → respond 400.
            return res.status(400).json({ error: 'ValidationError', details: err.issues })
        }
        next(err)                                             // Non-Zod error → let global error handler see it.
    }
}
