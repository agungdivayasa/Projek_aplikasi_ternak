const ApiError = require("../utils/ApiError");

// Dipasang setelah semua route: 404 untuk URL yang tidak ada.
const notFound = (req, res, next) => {
  next(new ApiError(404, "Endpoint tidak ditemukan"));
};

// Satu tempat untuk mengubah semua jenis error menjadi response JSON yang seragam.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Error yang sengaja dilempar aplikasi
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // JSON body yang rusak
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "JSON tidak valid" });
  }

  // Validasi Mongoose (mis. enum salah, sickCount melebihi quantity)
  if (err.name === "ValidationError" && err.errors) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ success: false, message: "Validasi gagal", errors });
  }

  // Tipe data tidak bisa di-cast (mis. ObjectId salah format)
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "ID tidak valid" });
  }

  // Duplicate key dari unique index MongoDB
  if (err.code === 11000) {
    const key = Object.keys(err.keyPattern || {});
    const message = key.includes("email")
      ? "Email sudah terdaftar"
      : "Kode ternak sudah digunakan";
    return res.status(409).json({ success: false, message });
  }

  // Selain itu: bug atau kesalahan tak terduga
  console.error(err);
  return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
};

module.exports = { notFound, errorHandler };
