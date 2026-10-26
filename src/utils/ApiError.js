// Error yang sengaja dilempar aplikasi (bukan bug), membawa status HTTP dan pesan.
class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors; // opsional: [{ field, message }]
  }
}

module.exports = ApiError;
