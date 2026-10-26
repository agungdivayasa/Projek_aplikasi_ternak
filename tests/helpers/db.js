// Database MongoDB sementara di memori untuk integration test.
// Data asli tidak tersentuh. Saat pertama kali dijalankan, mongodb-memory-server
// mengunduh binary MongoDB (butuh internet), setelah itu tersimpan di cache.
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../../src/models/User");
const Livestock = require("../../src/models/Livestock");

let mongod;

const connect = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  // Pastikan semua index (termasuk unique dan text) sudah terbentuk sebelum test
  await Promise.all([User.init(), Livestock.init()]);
};

// Mengosongkan isi collection tanpa menghapus index
const clear = async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((c) => c.deleteMany({}))
  );
};

const disconnect = async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};

module.exports = { connect, clear, disconnect };
