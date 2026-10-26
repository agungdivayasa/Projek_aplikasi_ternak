// Nilai enum yang dipakai bersama oleh model dan validator.
// Sumber kebenarannya adalah dokumen "Skema JSON NoSQL users & livestock".

module.exports = {
  ROLES: ["admin", "user"],
  SPECIES: ["sapi", "kambing", "domba", "ayam", "bebek", "babi", "ikan", "lainnya"],
  TRACKING_MODES: ["individual", "batch"],
  SEX: ["jantan", "betina", "campuran"],
  STATUS: ["active", "sold", "dead", "lost"],
  HEALTH_STATUS: ["sehat", "sakit", "perawatan"],
  ACQUISITION_TYPES: ["purchase", "born", "gift"],

  // Field yang boleh dipakai untuk pengurutan daftar ternak
  SORT_FIELDS: ["createdAt", "name", "quantity", "currentWeightKg"],

  PAGINATION: { DEFAULT_PAGE: 1, DEFAULT_LIMIT: 10, MAX_LIMIT: 100 },
  PASSWORD_MIN_LENGTH: 8,
  BCRYPT_SALT_ROUNDS: 10,
};
