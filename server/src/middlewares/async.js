// src/middlewares/async.js

// ① Express doesn't catch rejected promises by default in async handlers.
// ② asyncH(fn) wraps an async route so rejections go to next(err) → error middleware.

export const asyncH = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
}
