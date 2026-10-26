const mongoose = require("mongoose");
const { ROLES } = require("../constants");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true, // membuat index unik: { email: 1 }
      lowercase: true,
      trim: true,
    },
    // select: false -> password tidak ikut terbaca kecuali diminta eksplisit (.select("+password"))
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "user" },
    phone: { type: String, trim: true },
    farmName: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true } // otomatis mengisi createdAt dan updatedAt
);

// Pengaman tambahan: password tidak pernah ikut keluar saat dokumen diubah ke JSON.
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
