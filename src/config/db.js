const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
  try {
    console.log('🔄 Menyiapkan MongoDB Memory Server (Lokal)...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected (Memory): ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error koneksi database: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;