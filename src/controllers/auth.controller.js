const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { validateRegister, validateLogin } = require("../utils/validators");
const { generateToken, getExpiresIn } = require("../utils/token");
const { BCRYPT_SALT_ROUNDS } = require("../constants");

// Hash palsu untuk menyamakan waktu respons saat email tidak ditemukan
// (mengurangi risiko menebak email yang terdaftar lewat selisih waktu).
const DUMMY_HASH = bcrypt.hashSync("dummy-password", BCRYPT_SALT_ROUNDS);

// POST /api/v1/auth/register
const register = asyncHandler(async (req, res) => {
  const errors = validateRegister(req.body);
  if (errors.length) throw new ApiError(400, "Validasi gagal", errors);

  const email = req.body.email.trim().toLowerCase();
  if (await User.exists({ email })) {
    throw new ApiError(409, "Email sudah terdaftar");
  }

  // Password di-hash dengan Bcrypt. confirmPassword hanya untuk validasi, tidak disimpan.
  const password = await bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS);
  const user = await User.create({ name: req.body.name, email, password });

  res.status(201).json({
    success: true,
    message: "Registrasi berhasil",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

// POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const errors = validateLogin(req.body);
  if (errors.length) throw new ApiError(400, "Validasi gagal", errors);

  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select("+password");

  // Pesan sama untuk "email tidak ada" dan "password salah"
  const hash = user ? user.password : DUMMY_HASH;
  const passwordMatch = await bcrypt.compare(req.body.password, hash);
  if (!user || !passwordMatch) {
    throw new ApiError(401, "Email atau password salah");
  }
  if (!user.isActive) {
    throw new ApiError(403, "Akun tidak aktif");
  }

  res.status(200).json({
    success: true,
    message: "Login berhasil",
    data: {
      token: generateToken(user),
      expiresIn: getExpiresIn(),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    },
  });
});

module.exports = { register, login };
