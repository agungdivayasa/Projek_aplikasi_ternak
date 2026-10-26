const request = require("supertest");
const app = require("../../src/app");

let counter = 0;

const registerPayload = (overrides = {}) => ({
  name: "Putu Agus",
  email: "agus@ternakku.id",
  password: "Password123",
  confirmPassword: "Password123",
  ...overrides,
});

// Mendaftarkan user baru lalu login. Mengembalikan token dan id user.
const registerAndLogin = async (overrides = {}) => {
  counter += 1;
  const payload = registerPayload({ email: `user${counter}@ternakku.id`, ...overrides });
  await request(app).post("/api/v1/auth/register").send(payload);
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: payload.email, password: payload.password });
  return {
    token: res.body.data.token,
    userId: res.body.data.user._id,
    email: payload.email,
    password: payload.password,
  };
};

const bearer = (token) => `Bearer ${token}`;

const sapiPayload = (overrides = {}) => ({
  species: "sapi",
  trackingMode: "individual",
  code: "SAPI-001",
  name: "Si Bali",
  breed: "Sapi Bali",
  sex: "jantan",
  quantity: 1,
  birthDate: "2025-03-15",
  acquisition: { type: "purchase", date: "2025-09-01", price: 9500000 },
  currentWeightKg: 285,
  healthStatus: "sehat",
  location: "Kandang B",
  speciesDetails: { isPregnant: false },
  ...overrides,
});

const ayamPayload = (overrides = {}) => ({
  species: "ayam",
  trackingMode: "batch",
  name: "Kandang Ayam Petelur A",
  breed: "Isa Brown",
  sex: "betina",
  quantity: 500,
  acquisition: { type: "purchase", date: "2026-05-03", price: 8000 },
  healthStatus: "sehat",
  sickCount: 0,
  ...overrides,
});

// Membuat data ternak lewat API dan mengembalikan body.data
const createLivestock = async (token, payload) => {
  const res = await request(app)
    .post("/api/v1/livestock")
    .set("Authorization", bearer(token))
    .send(payload);
  return res.body.data;
};

module.exports = {
  app, request, registerPayload, registerAndLogin, bearer,
  sapiPayload, ayamPayload, createLivestock,
};
