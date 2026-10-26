const mongoose = require("mongoose");

const connectDB = async (uri = process.env.MONGODB_URI) => {
  if (!uri) {
    throw new Error("MONGODB_URI belum diatur di environment");
  }
  await mongoose.connect(uri);
  console.log(`MongoDB terhubung: ${mongoose.connection.host}/${mongoose.connection.name}`);
};

module.exports = connectDB;
