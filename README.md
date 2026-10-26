# TernakKu Backend

RESTful API untuk Sistem Informasi Manajemen Peternakan Multi-Komoditas.
Stack: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt, Jest + Supertest.

## Menjalankan

```bash
npm install
cp .env.example .env     # lalu isi JWT_SECRET dan MONGODB_URI
npm run dev              # server di http://localhost:5000
```

Butuh MongoDB lokal (`mongodb://127.0.0.1:27017`) atau URI MongoDB Atlas.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan server dengan auto-reload |
| `npm start` | Jalankan server (produksi) |
| `npm test` | Semua test + laporan coverage |
| `npm run test:unit` | Unit test saja (tanpa database) |
| `npm run test:integration` | Integration test (MongoDB sementara di memori) |
| `npm run seed` | Isi 10.000 data uji. Akun demo: `demo@ternakku.id` / `Password123` |

Catatan: saat pertama kali, `test:integration` mengunduh binary MongoDB (butuh internet).

## Struktur folder

```
src/
  app.js            susunan middleware dan route
  server.js         titik masuk: konek DB lalu listen
  constants.js      nilai enum bersama
  config/db.js      koneksi MongoDB
  models/           skema Mongoose: User, Livestock (+ index)
  middleware/       auth (JWT), sanitize (XSS), error (penanganan error)
  controllers/      logika tiap endpoint
  routes/           pemetaan URL ke controller
  utils/            validator, token, ApiError, asyncHandler
tests/
  unit/             tanpa database
  integration/      endpoint utuh dengan Supertest
postman/            koleksi Postman siap import
docs/               panduan belajar
```

## Endpoint (base: `/api/v1`)

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| GET | `/health` | Tidak | Cek API hidup |
| POST | `/auth/register` | Tidak | Registrasi |
| POST | `/auth/login` | Tidak | Login, menghasilkan JWT |
| GET | `/livestock` | Ya | Daftar (page, limit, search, species, status, healthStatus, sortBy, order) |
| GET | `/livestock/:id` | Ya | Detail |
| POST | `/livestock` | Ya | Tambah |
| PUT | `/livestock/:id` | Ya | Ubah |
| DELETE | `/livestock/:id` | Ya | Hapus |
| GET | `/dashboard/stats` | Ya | Statistik dashboard |

Detail request/response ada pada dokumen Spesifikasi Endpoint REST API.
Impor `postman/TernakKu-API.postman_collection.json` ke Postman untuk mencoba.

## Git Flow

- `main`: kode stabil (rilis)
- `development`: integrasi semua fitur
- `feature/*`: satu fitur per branch, digabung ke `development` lewat Pull Request

Contoh: `feature/auth-jwt`, `feature/livestock-crud`, `feature/dashboard-stats`.
