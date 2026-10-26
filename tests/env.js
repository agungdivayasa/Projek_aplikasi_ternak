// Dijalankan Jest sebelum setiap file test: mengatur environment khusus pengujian.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "secret-khusus-pengujian";
process.env.JWT_EXPIRES_IN = "1h";
