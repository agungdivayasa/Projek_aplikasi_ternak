const {
  SPECIES, TRACKING_MODES, SEX, HEALTH_STATUS, ACQUISITION_TYPES,
  STATUS, SORT_FIELDS, PAGINATION, PASSWORD_MIN_LENGTH,
} = require("../constants");

// Setiap fungsi validate* mengembalikan array error: [{ field, message }].
// Array kosong berarti input valid.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const isString = (v) => typeof v === "string";
const isValidEmail = (v) => isString(v) && EMAIL_REGEX.test(v.trim());
const isValidObjectId = (v) => isString(v) && OBJECT_ID_REGEX.test(v);
const isValidDate = (v) =>
  (isString(v) || v instanceof Date) && !Number.isNaN(new Date(v).getTime());
const isNumber = (v) => typeof v === "number" && Number.isFinite(v);

const validateRegister = (body = {}) => {
  const errors = [];
  const { name, email, password, confirmPassword } = body;

  if (!isString(name) || name.trim().length < 2 || name.trim().length > 100) {
    errors.push({ field: "name", message: "Nama wajib diisi, 2-100 karakter" });
  }
  if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Format email tidak valid" });
  }
  if (!isString(password) || password.length < PASSWORD_MIN_LENGTH) {
    errors.push({
      field: "password",
      message: `Password minimal ${PASSWORD_MIN_LENGTH} karakter`,
    });
  } else if (confirmPassword !== password) {
    errors.push({ field: "confirmPassword", message: "Konfirmasi password tidak sama" });
  }
  return errors;
};

const validateLogin = (body = {}) => {
  const errors = [];
  // Wajib string: objek seperti { "$gt": "" } (NoSQL injection) ditolak di sini.
  if (!isString(body.email) || body.email.trim() === "") {
    errors.push({ field: "email", message: "Email wajib diisi" });
  }
  if (!isString(body.password) || body.password === "") {
    errors.push({ field: "password", message: "Password wajib diisi" });
  }
  return errors;
};

const validateAcquisition = (acq) => {
  const errors = [];
  if (acq === null || typeof acq !== "object" || Array.isArray(acq)) {
    return [{ field: "acquisition", message: "Asal perolehan wajib diisi" }];
  }
  if (!ACQUISITION_TYPES.includes(acq.type)) {
    errors.push({
      field: "acquisition.type",
      message: `Harus salah satu dari: ${ACQUISITION_TYPES.join(", ")}`,
    });
  }
  if (!isValidDate(acq.date)) {
    errors.push({ field: "acquisition.date", message: "Tanggal tidak valid" });
  }
  if (acq.price !== undefined && (!isNumber(acq.price) || acq.price < 0)) {
    errors.push({ field: "acquisition.price", message: "Harga harus angka 0 atau lebih" });
  }
  return errors;
};

// partial = true dipakai untuk PUT: field yang tidak dikirim tidak divalidasi.
const validateLivestock = (body = {}, { partial = false } = {}) => {
  const errors = [];
  const has = (key) => body[key] !== undefined;
  const requireField = (key, message) => {
    if (!partial && !has(key)) errors.push({ field: key, message });
  };

  requireField("species", "Jenis ternak wajib diisi");
  requireField("trackingMode", "Mode pencatatan wajib diisi");
  requireField("name", "Nama wajib diisi");
  requireField("quantity", "Jumlah wajib diisi");
  requireField("acquisition", "Asal perolehan wajib diisi");

  if (has("species") && !SPECIES.includes(body.species)) {
    errors.push({ field: "species", message: `Harus salah satu dari: ${SPECIES.join(", ")}` });
  }
  if (has("trackingMode") && !TRACKING_MODES.includes(body.trackingMode)) {
    errors.push({ field: "trackingMode", message: `Harus salah satu dari: ${TRACKING_MODES.join(", ")}` });
  }
  if (has("name") && (!isString(body.name) || body.name.trim() === "" || body.name.length > 100)) {
    errors.push({ field: "name", message: "Nama wajib diisi, maksimal 100 karakter" });
  }
  if (has("code") && body.code !== null && !isString(body.code)) {
    errors.push({ field: "code", message: "Kode harus berupa teks" });
  }
  if (has("sex") && !SEX.includes(body.sex)) {
    errors.push({ field: "sex", message: `Harus salah satu dari: ${SEX.join(", ")}` });
  }
  if (has("healthStatus") && !HEALTH_STATUS.includes(body.healthStatus)) {
    errors.push({ field: "healthStatus", message: `Harus salah satu dari: ${HEALTH_STATUS.join(", ")}` });
  }
  if (has("status") && !STATUS.includes(body.status)) {
    errors.push({ field: "status", message: `Harus salah satu dari: ${STATUS.join(", ")}` });
  }
  if (has("quantity") && (!Number.isInteger(body.quantity) || body.quantity < 1)) {
    errors.push({ field: "quantity", message: "Jumlah harus bilangan bulat 1 atau lebih" });
  }
  if (has("sickCount") && (!Number.isInteger(body.sickCount) || body.sickCount < 0)) {
    errors.push({ field: "sickCount", message: "Jumlah sakit harus bilangan bulat 0 atau lebih" });
  }
  if (has("currentWeightKg") && (!isNumber(body.currentWeightKg) || body.currentWeightKg < 0)) {
    errors.push({ field: "currentWeightKg", message: "Berat harus angka 0 atau lebih" });
  }
  if (has("birthDate") && !isValidDate(body.birthDate)) {
    errors.push({ field: "birthDate", message: "Tanggal lahir tidak valid" });
  }
  if (has("acquisition")) {
    errors.push(...validateAcquisition(body.acquisition));
  }
  if (has("speciesDetails") && (body.speciesDetails === null || typeof body.speciesDetails !== "object" || Array.isArray(body.speciesDetails))) {
    errors.push({ field: "speciesDetails", message: "speciesDetails harus berupa objek" });
  }
  return errors;
};

// Mengubah query string GET /livestock menjadi nilai yang sudah divalidasi.
// Mengembalikan { value, errors }.
const parseListQuery = (query = {}) => {
  const errors = [];
  const value = {};

  const readInt = (key, fallback, { min, max }) => {
    if (query[key] === undefined) return fallback;
    const n = Number(query[key]);
    if (!isString(query[key]) || !Number.isInteger(n) || n < min) {
      errors.push({ field: key, message: `${key} harus bilangan bulat minimal ${min}` });
      return fallback;
    }
    return max ? Math.min(n, max) : n;
  };

  const readEnum = (key, allowed) => {
    if (query[key] === undefined) return undefined;
    if (!isString(query[key]) || !allowed.includes(query[key])) {
      errors.push({ field: key, message: `Harus salah satu dari: ${allowed.join(", ")}` });
      return undefined;
    }
    return query[key];
  };

  value.page = readInt("page", PAGINATION.DEFAULT_PAGE, { min: 1 });
  value.limit = readInt("limit", PAGINATION.DEFAULT_LIMIT, { min: 1, max: PAGINATION.MAX_LIMIT });
  value.species = readEnum("species", SPECIES);
  value.status = readEnum("status", STATUS);
  value.healthStatus = readEnum("healthStatus", HEALTH_STATUS);
  value.sortBy = readEnum("sortBy", SORT_FIELDS) || "createdAt";
  value.order = readEnum("order", ["asc", "desc"]) || "desc";

  if (query.search !== undefined) {
    if (!isString(query.search)) {
      errors.push({ field: "search", message: "search harus berupa teks" });
    } else if (query.search.trim() !== "") {
      value.search = query.search.trim();
    }
  }
  return { value, errors };
};

module.exports = {
  isValidEmail,
  isValidObjectId,
  validateRegister,
  validateLogin,
  validateLivestock,
  parseListQuery,
};
