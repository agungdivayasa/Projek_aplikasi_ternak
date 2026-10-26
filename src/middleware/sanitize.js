// Membersihkan tag HTML dari semua string pada req.body (pencegahan XSS).
// Field password tidak disentuh agar password asli pengguna tidak berubah.

const SKIP_KEYS = new Set(["password", "confirmPassword"]);

const stripTags = (value) => value.replace(/<[^>]*>/g, "").trim();

const clean = (value, key) => {
  if (SKIP_KEYS.has(key)) return value;
  if (typeof value === "string") return stripTags(value);
  if (Array.isArray(value)) return value.map((v) => clean(v));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, clean(v, k)])
    );
  }
  return value;
};

const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = clean(req.body);
  }
  next();
};

module.exports = { sanitizeBody, clean };
