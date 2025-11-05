// ***When a user sends data to the server, validate.js takes the Zod schema for that route and checks if the data in req.body is valid.
/***If everything looks good, it saves clean data into req.valid so route can use it safely. If something’s wrong, it sends back 400 error with validation details instead of crashing.*/

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
