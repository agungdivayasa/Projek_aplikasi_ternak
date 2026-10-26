// Mengisi database dengan data uji, dipakai untuk demo dan pengujian performa (TC-P01 sampai TC-P04).
// Pemakaian:
//   npm run seed            -> 1 user demo + 10.000 data ternak
//   npm run seed -- 500     -> jumlah data ternak diatur sendiri
// Akun demo: demo@ternakku.id / Password123

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Livestock = require("../src/models/Livestock");
const { SPECIES } = require("../src/constants");

const TOTAL = Number(process.argv[2]) || 10000;
const BATCH_SPECIES = ["ayam", "bebek", "ikan"];
const BREEDS = { sapi: "Sapi Bali", kambing: "Kambing Etawa", domba: "Domba Garut", ayam: "Isa Brown", bebek: "Bebek Peking", babi: "Babi Landrace", ikan: "Lele Sangkuriang", lainnya: "Campuran" };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

(async () => {
  await connectDB();
  await Promise.all([User.init(), Livestock.init()]);

  await User.deleteOne({ email: "demo@ternakku.id" });
  const user = await User.create({
    name: "Pengguna Demo",
    email: "demo@ternakku.id",
    password: await bcrypt.hash("Password123", 10),
    farmName: "Peternakan Demo",
  });
  await Livestock.deleteMany({ user_id: user._id });

  const docs = Array.from({ length: TOTAL }, (_, i) => {
    const species = pick(SPECIES);
    const batch = BATCH_SPECIES.includes(species);
    const quantity = batch ? 50 + Math.floor(Math.random() * 450) : 1;
    const sick = Math.random() < 0.1;
    return {
      user_id: user._id,
      species,
      trackingMode: batch ? "batch" : "individual",
      code: batch ? undefined : `${species.toUpperCase()}-${String(i).padStart(5, "0")}`,
      name: batch ? `Kelompok ${species} ${i}` : `${species} ${i}`,
      breed: BREEDS[species],
      sex: pick(["jantan", "betina"]),
      quantity,
      birthDate: new Date(Date.now() - Math.random() * 3e10),
      acquisition: { type: pick(["purchase", "born", "gift"]), date: new Date(), price: Math.floor(Math.random() * 1e7) },
      currentWeightKg: Math.round(Math.random() * 300 * 10) / 10,
      healthStatus: sick ? "sakit" : "sehat",
      sickCount: sick ? (batch ? Math.ceil(quantity * 0.05) : 1) : 0,
      status: Math.random() < 0.9 ? "active" : pick(["sold", "dead", "lost"]),
      location: `Kandang ${pick(["A", "B", "C", "D"])}`,
    };
  });

  await Livestock.insertMany(docs, { ordered: false });
  console.log(`Seed selesai: 1 user demo dan ${TOTAL} data ternak.`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
