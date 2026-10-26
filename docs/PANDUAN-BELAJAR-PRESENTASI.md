---
title: "Panduan Belajar Presentasi UTS: Backend TernakKu"
author: "Putu Agus Wijana - Backend & API Engineer"
---

# 1. Gambaran Besar (hafalkan ini dulu)

Backend TernakKu adalah **REST API** yang menerima request dari frontend (React/Vue), memprosesnya, lalu menyimpan atau mengambil data dari **MongoDB**. Frontend dan backend **terpisah** (decoupled), saling bicara lewat JSON.

```
Frontend (React/Vue)  --HTTP + JSON-->  Express API  --Mongoose-->  MongoDB
      Layer 1                              Layer 2                    Layer 3
```

**Satu kalimat untuk dosen:** "Saya merancang database NoSQL dan REST API dengan autentikasi JWT, lalu menyiapkan kerangka kode dan pengujiannya supaya implementasi minggu 8-10 tinggal dilanjutkan."

# 2. Perjalanan Satu Request (paling sering ditanya)

Contoh: pengguna menambah ternak. `POST /api/v1/livestock` dengan header `Authorization: Bearer <token>`.

1. **app.js** menerima request. Middleware global berjalan berurutan:
   `helmet` (header keamanan) -> `cors` (izin frontend) -> `express.json` (baca body) -> `mongoSanitize` (hapus key berawalan `$`) -> `sanitizeBody` (hapus tag HTML).
2. **routes/livestock.routes.js** mencocokkan URL dan method, lalu menjalankan `protect`.
3. **middleware/auth.js (`protect`)**: ambil token dari header, verifikasi JWT, cek user masih ada dan aktif, isi `req.user`. Gagal -> **401**.
4. **controllers/livestock.controller.js (`create`)**: validasi input (gagal -> **400**), ambil hanya field yang boleh ditulis, isi `user_id` dari token, simpan lewat model.
5. **models/Livestock.js**: Mongoose memvalidasi skema dan menjalankan aturan bisnis, lalu menyimpan ke MongoDB. Kode ganda -> **409**.
6. Response **201** dikirim. Jika ada error di mana pun, **middleware/error.js** mengubahnya menjadi JSON seragam.

# 3. Peta File: Apa Isi Tiap File

| File | Fungsi singkat |
|---|---|
| `src/server.js` | Titik masuk: konek database, lalu menyalakan server |
| `src/app.js` | Menyusun middleware dan route |
| `src/models/User.js` | Skema user, index unik email, password disembunyikan (`select: false`) |
| `src/models/Livestock.js` | Skema ternak, 6 index, aturan bisnis `pre("validate")` |
| `src/middleware/auth.js` | Penjaga JWT (`protect`) |
| `src/middleware/sanitize.js` | Hapus tag HTML (anti-XSS) |
| `src/middleware/error.js` | Satu tempat mengubah error menjadi response JSON |
| `src/controllers/auth.controller.js` | Register dan login |
| `src/controllers/livestock.controller.js` | CRUD, pencarian, filter, pagination |
| `src/controllers/dashboard.controller.js` | Statistik dengan aggregate |
| `src/utils/validators.js` | Semua aturan validasi input |
| `src/utils/token.js` | Buat dan verifikasi JWT |
| `tests/` | Unit test dan integration test |

# 4. Konsep Kunci dan Cara Menjelaskannya

## 4.1 Kenapa NoSQL (MongoDB)?
- Ternak itu **beragam**: sapi butuh data kehamilan, ayam butuh produksi telur, ikan butuh data kolam. Di SQL harus banyak kolom kosong atau banyak tabel. Di MongoDB, data khusus ditaruh di `speciesDetails` yang **bentuknya fleksibel**.
- Skema bisa berkembang tanpa migrasi rumit, cocok untuk proyek yang kebutuhannya masih bertambah.
- Data berbentuk dokumen JSON, sehingga cocok langsung dengan JSON yang dipakai frontend.

## 4.2 Kenapa Decoupled Architecture?
- Frontend dan backend bisa dikerjakan **paralel** oleh orang berbeda (kita bertiga).
- Backend yang sama bisa dipakai web dan nanti mobile.
- Bisa di-deploy dan di-scale **terpisah**.

## 4.3 JWT (JSON Web Token)
- Setelah login, server memberi **token** yang berisi `id` dan `role`, **ditandatangani** dengan secret.
- Frontend mengirim token di setiap request (`Authorization: Bearer ...`). Server tidak perlu menyimpan sesi (**stateless**).
- Token tidak bisa dipalsukan tanpa secret. Kalau diubah satu karakter, verifikasi gagal.
- Token berlaku **1 jam** (`expiresIn`), setelah itu harus login ulang.
- Struktur token: `header.payload.signature`. Payload hanya di-encode (base64), **bukan dienkripsi**, jadi jangan simpan data rahasia di dalamnya.

## 4.4 Bcrypt
- Password **tidak pernah disimpan asli**, hanya hash satu arah.
- Setiap hash memakai **salt acak**, jadi password sama menghasilkan hash berbeda. Ini menggagalkan serangan rainbow table.
- Saat login, password yang diketik di-hash lalu **dibandingkan** (`bcrypt.compare`), bukan di-decrypt.
- Salt rounds = 10: makin besar makin lambat dan makin sulit ditebak paksa.

## 4.5 Index dan Performa (< 500 ms)
Index seperti **daftar isi buku**: tanpa index MongoDB membaca semua dokumen (`COLLSCAN`), dengan index langsung lompat ke data (`IXSCAN`).

| Index | Dipakai untuk |
|---|---|
| `users: { email }` unique | Login cepat, mencegah email ganda |
| `{ user_id, createdAt }` | Daftar ternak terbaru milik user |
| `{ user_id, species }` | Filter jenis dan statistik dashboard |
| `{ user_id, status }` | Filter aktif/terjual/mati |
| `{ user_id, healthStatus }` | Hitung ternak sakit |
| `{ user_id, code }` unique partial | Kode tidak ganda per user, hanya jika `code` diisi |
| text `{ name, code, breed }` | Pencarian kata |

`user_id` selalu di depan karena **setiap query difilter berdasarkan pemilik**.

## 4.6 Keamanan berlapis (hafalkan daftar ini)
| Ancaman | Pencegahan di kode |
|---|---|
| Akses tanpa login | Middleware `protect` di semua route data |
| Token palsu / kedaluwarsa | Verifikasi signature, expiry, dan algoritma dibatasi HS256 (tolak `alg: none`) |
| Password bocor | Bcrypt, `select: false`, tidak pernah ada di response |
| Lihat data milik orang lain (IDOR) | Semua query memakai `user_id` dari token, hasilnya 404 |
| NoSQL injection | `express-mongo-sanitize` + validator wajib string |
| XSS | `sanitizeBody` menghapus tag HTML |
| Header berbahaya | `helmet` |
| Tebak password | Rate limit login 20 kali per 15 menit per IP |
| Mass assignment | Hanya field di `WRITABLE_FIELDS` yang diterima |
| Secret bocor | `JWT_SECRET` di `.env`, `.env` masuk `.gitignore` |
| Menebak email terdaftar | Pesan login sama untuk email salah dan password salah |

## 4.7 Desain skema livestock
- **trackingMode**: `individual` (sapi dicatat per ekor, quantity selalu 1) dan `batch` (ayam dicatat per kelompok, quantity = populasi).
- **sickCount** + **healthStatus**: dibutuhkan kartu "jumlah sakit" di dashboard. Pada batch, 12 dari 500 ayam bisa sakit.
- **Aturan bisnis di model** (`pre("validate")`): individual otomatis quantity 1, batch tidak boleh `sickCount > quantity`.
- **Relasi**: `livestock.user_id` mengarah ke `users._id` (satu user, banyak ternak).

## 4.8 Kode status HTTP
`200` OK, `201` dibuat, `400` input salah, `401` belum login/token salah, `403` akun nonaktif, `404` tidak ditemukan (atau bukan milikmu), `409` bentrok data (email/kode ganda), `500` error server.

# 5. Demo 3 Menit (naskah)

1. Tunjukkan **struktur repo** dan branch `main`, `development`, `feature/*`.
2. Jalankan `npm run dev`, buka Postman, import koleksi.
3. **Register** -> tunjukkan response tanpa password.
4. **Login** -> token tersimpan otomatis. Tempel token ke jwt.io untuk menunjukkan isi payload.
5. **Tambah ternak** -> **Daftar** dengan `?search=bali&species=sapi`.
6. **Dashboard stats** -> cocokkan dengan kartu di mockup.
7. Coba **tanpa token** -> 401. Tunjukkan keamanan bekerja.
8. Tunjukkan `npm test` (jumlah test dan coverage).

Tips: jalankan `npm run seed` sebelum presentasi supaya ada data. Akun demo: `demo@ternakku.id` / `Password123`.

# 6. Perkiraan Pertanyaan Dosen dan Jawaban

**Kenapa pakai MongoDB, bukan MySQL?**
Data ternak beragam per jenis, jadi butuh skema fleksibel (`speciesDetails`). Selain itu bentuk dokumennya sama dengan JSON di frontend.

**Apa bedanya authentication dan authorization?**
Authentication: memastikan siapa kamu (login, JWT). Authorization: apa yang boleh kamu akses (hanya data milik sendiri lewat `user_id`, dan `role`).

**Kalau token dicuri bagaimana?**
Token berlaku singkat (1 jam), dikirim lewat HTTPS saat produksi. Pengembangan lanjutan: refresh token dan logout dengan blacklist. Ini saya catat sebagai peningkatan.

**Kenapa password tidak di-encrypt saja?**
Encrypt bisa dibuka kembali jika kunci bocor. Hash satu arah tidak bisa dikembalikan, jadi lebih aman.

**Kenapa pesan error login sengaja sama?**
Supaya penyerang tidak bisa mengetahui email mana yang terdaftar.

**Apa itu index dan kenapa penting?**
Mempercepat pencarian dari membaca semua dokumen menjadi lompat langsung ke data. Terbukti lewat `explain()` yang menunjukkan IXSCAN.

**Kenapa `user_id` diambil dari token, bukan dari body?**
Kalau dari body, user bisa menulis `user_id` orang lain. Dari token, identitasnya tidak bisa dipalsukan.

**Kenapa 404 bukan 403 saat membuka data orang lain?**
Agar tidak membocorkan bahwa data dengan ID itu ada.

**Bagaimana cara menguji performa < 500 ms?**
Seed 10.000 data, jalankan autocannon pada endpoint utama, lihat latency p95, dan verifikasi query dengan `explain()`.

**Apa yang sudah jadi dan apa yang belum?**
Jujur saja: rancangan lengkap (skema, endpoint, rencana uji) sudah ada, dan kerangka kode dengan test sudah disiapkan. Integrasi dengan frontend, pengujian performa penuh, dan deployment dijadwalkan minggu 8-16.

**Apa itu Git Flow?**
`main` untuk kode stabil, `development` untuk integrasi, `feature/*` untuk satu fitur per branch lalu digabung lewat Pull Request setelah test lulus.

# 7. Ringkasan Hafalan (cheat sheet)

- **3 layer:** Frontend, Express API, MongoDB.
- **2 collection:** `users`, `livestock` (relasi lewat `user_id`).
- **8 endpoint:** register, login, 5 livestock (list, detail, tambah, ubah, hapus), dashboard stats.
- **JWT:** stateless, 1 jam, HS256. **Bcrypt:** hash + salt, rounds 10.
- **Index:** 1 di users, 6 di livestock.
- **Test:** unit (tanpa DB) + integration (Supertest), ID TC-A, TC-L, TC-D, TC-S.
- **Performa:** p95 < 500 ms, dibuktikan dengan seed 10.000 data + `explain()`.
