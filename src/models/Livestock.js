const mongoose = require("mongoose");
const {
  SPECIES, TRACKING_MODES, SEX, STATUS, HEALTH_STATUS, ACQUISITION_TYPES,
} = require("../constants");

const acquisitionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ACQUISITION_TYPES, required: true },
    date: { type: Date, required: true },
    price: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const livestockSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    species: { type: String, enum: SPECIES, required: true },
    // individual = dicatat per ekor, batch = dicatat per kelompok/populasi
    trackingMode: { type: String, enum: TRACKING_MODES, required: true },
    code: { type: String, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    breed: { type: String, trim: true },
    sex: { type: String, enum: SEX },
    quantity: { type: Number, required: true, min: 1, validate: Number.isInteger },
    birthDate: { type: Date },
    acquisition: { type: acquisitionSchema, required: true },
    currentWeightKg: { type: Number, min: 0 },
    status: { type: String, enum: STATUS, default: "active" },
    healthStatus: { type: String, enum: HEALTH_STATUS, default: "sehat" },
    sickCount: { type: Number, min: 0, default: 0, validate: Number.isInteger },
    location: { type: String, trim: true },
    // Data khusus per jenis ternak, bentuknya bebas (kelebihan MongoDB)
    speciesDetails: { type: mongoose.Schema.Types.Mixed },
    notes: { type: String, trim: true },
  },
  { timestamps: true, minimize: false }
);

// Aturan bisnis yang selalu berjalan sebelum dokumen disimpan.
livestockSchema.pre("validate", function () {
  if (this.trackingMode === "individual") {
    this.quantity = 1;
    this.sickCount = this.healthStatus === "sakit" ? 1 : 0;
  } else if (this.sickCount > this.quantity) {
    this.invalidate("sickCount", "Jumlah sakit tidak boleh melebihi jumlah ternak");
  }
});

// ---------- Index (sesuai dokumen skema) ----------
// Daftar ternak milik user dengan pagination terbaru dulu
livestockSchema.index({ user_id: 1, createdAt: -1 });
// Filter per jenis dan statistik dashboard
livestockSchema.index({ user_id: 1, species: 1 });
// Filter status aktif/terjual/mati
livestockSchema.index({ user_id: 1, status: 1 });
// Hitung ternak sakit untuk dashboard
livestockSchema.index({ user_id: 1, healthStatus: 1 });
// Kode unik per user, hanya berlaku jika code diisi
livestockSchema.index(
  { user_id: 1, code: 1 },
  { unique: true, partialFilterExpression: { code: { $type: "string" } } }
);
// Pencarian teks (kata utuh) pada nama, kode, dan ras
livestockSchema.index({ name: "text", code: "text", breed: "text" });

livestockSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Livestock", livestockSchema);
