const jwt = require("jsonwebtoken");

// Secret dibaca dari environment variable, tidak pernah ditulis di kode.
const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET belum diatur di environment");
  }
  return process.env.JWT_SECRET;
};

const getExpiresIn = () => process.env.JWT_EXPIRES_IN || "1h";

// Payload berisi id dan role saja. Jangan memasukkan data sensitif ke token.
const generateToken = (user) =>
  jwt.sign({ id: String(user._id), role: user.role }, getSecret(), {
    algorithm: "HS256",
    expiresIn: getExpiresIn(),
  });

// algorithms dibatasi HS256 agar token dengan alg "none" ditolak.
const verifyToken = (token) =>
  jwt.verify(token, getSecret(), { algorithms: ["HS256"] });

module.exports = { generateToken, verifyToken, getExpiresIn };
