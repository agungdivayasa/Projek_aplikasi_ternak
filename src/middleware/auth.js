const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyToken } = require("../utils/token");

// Middleware "protect": dipasang di route yang wajib login.
// Alur: ambil header -> verifikasi JWT -> pastikan user masih ada dan aktif -> isi req.user.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  const token = header.slice("Bearer ".length).trim();
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    // Token rusak, signature salah, atau kedaluwarsa: semuanya dijawab 401 yang sama.
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(decoded.id).select("_id role isActive");
  if (!user || !user.isActive) {
    throw new ApiError(401, "Unauthorized");
  }

  req.user = { id: String(user._id), role: user.role };
  next();
});

module.exports = { protect };
