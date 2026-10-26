// Membuat file koleksi Postman dari definisi endpoint.
// Jalankan: node scripts/build-postman.js
const fs = require("fs");
const path = require("path");

const H_JSON = { key: "Content-Type", value: "application/json" };
const H_AUTH = { key: "Authorization", value: "Bearer {{token}}" };

const req = (name, method, url, { auth = true, body, tests, query } = {}) => ({
  name,
  event: tests
    ? [{ listen: "test", script: { type: "text/javascript", exec: tests.split("\n") } }]
    : undefined,
  request: {
    method,
    header: [...(body ? [H_JSON] : []), ...(auth ? [H_AUTH] : [])],
    body: body ? { mode: "raw", raw: JSON.stringify(body, null, 2) } : undefined,
    url: {
      raw: `{{baseUrl}}${url}${query ? "?" + query.map((q) => `${q[0]}=${q[1]}`).join("&") : ""}`,
      host: ["{{baseUrl}}"],
      path: url.split("/").filter(Boolean),
      query: query ? query.map(([key, value]) => ({ key, value })) : undefined,
    },
  },
});

const sapi = {
  species: "sapi", trackingMode: "individual", code: "SAPI-001", name: "Si Bali",
  breed: "Sapi Bali", sex: "jantan", quantity: 1, birthDate: "2025-03-15",
  acquisition: { type: "purchase", date: "2025-09-01", price: 9500000 },
  currentWeightKg: 285, healthStatus: "sehat", location: "Kandang B",
  speciesDetails: { isPregnant: false },
};

const collection = {
  info: {
    name: "TernakKu API",
    description: "Koleksi request untuk RESTful API TernakKu. Jalankan Register lalu Login; token tersimpan otomatis ke variabel {{token}}.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:5000/api/v1" },
    { key: "token", value: "" },
    { key: "livestockId", value: "" },
  ],
  item: [
    {
      name: "Auth",
      item: [
        req("Register", "POST", "/auth/register", {
          auth: false,
          body: { name: "Putu Agus Wijana", email: "agus@ternakku.id", password: "Password123", confirmPassword: "Password123" },
          tests: 'pm.test("201 Created", () => pm.response.to.have.status(201));',
        }),
        req("Login", "POST", "/auth/login", {
          auth: false,
          body: { email: "agus@ternakku.id", password: "Password123" },
          tests: [
            'pm.test("200 OK", () => pm.response.to.have.status(200));',
            'const json = pm.response.json();',
            'pm.collectionVariables.set("token", json.data.token);',
          ].join("\n"),
        }),
      ],
    },
    {
      name: "Livestock",
      item: [
        req("Tambah ternak", "POST", "/livestock", {
          body: sapi,
          tests: [
            'pm.test("201 Created", () => pm.response.to.have.status(201));',
            'pm.collectionVariables.set("livestockId", pm.response.json().data._id);',
          ].join("\n"),
        }),
        req("Daftar ternak", "GET", "/livestock", {
          query: [["page", "1"], ["limit", "10"]],
          tests: 'pm.test("200 OK", () => pm.response.to.have.status(200));',
        }),
        req("Cari dan filter", "GET", "/livestock", {
          query: [["search", "bali"], ["species", "sapi"], ["healthStatus", "sehat"], ["sortBy", "name"], ["order", "asc"]],
        }),
        req("Detail ternak", "GET", "/livestock/{{livestockId}}", {
          tests: 'pm.test("200 OK", () => pm.response.to.have.status(200));',
        }),
        req("Ubah ternak", "PUT", "/livestock/{{livestockId}}", {
          body: { currentWeightKg: 300, healthStatus: "sakit" },
          tests: 'pm.test("200 OK", () => pm.response.to.have.status(200));',
        }),
        req("Hapus ternak", "DELETE", "/livestock/{{livestockId}}", {
          tests: 'pm.test("200 OK", () => pm.response.to.have.status(200));',
        }),
      ],
    },
    {
      name: "Dashboard",
      item: [
        req("Statistik dashboard", "GET", "/dashboard/stats", {
          tests: 'pm.test("200 OK", () => pm.response.to.have.status(200));',
        }),
      ],
    },
  ],
};

fs.writeFileSync(
  path.join(__dirname, "../postman/TernakKu-API.postman_collection.json"),
  JSON.stringify(collection, null, 2)
);
console.log("Postman collection dibuat.");
