// CENTRAL ERROR HANDLER: keep stack traces on the server, not in public API responses.
export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: 'API route not found.' });
}

export function errorHandler(error, req, res, next) {
  // eslint-disable-line no-unused-vars
  console.error('[API error]', error.message);
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Something went wrong on the server. Please try again later.' : error.message,
  });
}
