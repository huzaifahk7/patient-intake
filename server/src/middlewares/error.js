//***something unexpected happens — like coding mistake or database error that wasn’t caught earlier — error.js runs last. It logs error for developer and sends back simple JSON message */

export function errorHandler(err, req, res, next) {
    console.error(err)                                      // Log full error on the server for debugging.
    res.status(500).json({                                  // Hide stack from clients; send simple message.
        error: 'ServerError',
        message: err?.message || 'Unexpected error',
    })
}
