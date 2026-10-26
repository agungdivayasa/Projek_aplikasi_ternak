const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const authRoutes = require("./routes/auth.routes");
const livestockRoutes = require("./routes/livestock.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const { sanitizeBody } = require("./middleware/sanitize");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

// ---------- Middleware global (urutan penting) ----------
app.use(helmet()); // header keamanan HTTP
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  })
);
app.use(express.json({ limit: "10kb" })); // baca body JSON, batasi ukuran
app.use(mongoSanitize()); // hapus key berawalan $ (cegah NoSQL injection)
app.use(sanitizeBody); // hapus tag HTML (cegah XSS)

// ---------- Routes ----------
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "API TernakKu berjalan" });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/livestock", livestockRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// ---------- Penanganan error (harus paling akhir) ----------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
