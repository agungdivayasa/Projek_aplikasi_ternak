const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login } = require("../controllers/auth.controller");

const router = express.Router();

// Membatasi percobaan login per IP untuk menahan tebak-tebakan password.
// Dimatikan saat test agar pengujian tidak terblokir.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { success: false, message: "Terlalu banyak percobaan login, coba lagi nanti" },
});

router.post("/register", register);
router.post("/login", loginLimiter, login);

module.exports = router;
