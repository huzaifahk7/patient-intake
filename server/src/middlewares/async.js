//***if you forget to use try/catch inside an async route, errors can crash the server. async.js wraps each async route in a helper that automatically catches any error and sends it to Express’s built-in error handler.” */ 

export const asyncH = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
}
