/** Standard error shape thrown from controllers, caught by the global error handler. */
class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.success = false;
  }
}

module.exports = ApiError;
