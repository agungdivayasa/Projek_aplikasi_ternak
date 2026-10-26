const db = require("../helpers/db");
const {
  app, request, registerAndLogin, bearer, sapiPayload, ayamPayload, createLivestock,
} = require("../helpers/factory");
const Livestock = require("../../src/models/Livestock");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.disconnect);

let auth; // { token, userId }
beforeEach(async () => {
  auth = await registerAndLogin();
});

const api = (method, url, token = auth.token) =>
  request(app)[method](url).set("Authorization", bearer(token));

describe("POST /api/v1/livestock", () => {
  it("TC-L01 tambah ternak valid -> 201, user_id sesuai pemilik token", async () => {
    const res = await api("post", "/api/v1/livestock").send(sapiPayload());
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toMatchObject({ user_id: auth.userId, status: "active", name: "Si Bali" });
  });

  it("TC-L02 field wajib kosong -> 400", async () => {
    const res = await api("post", "/api/v1/livestock").send({ quantity: 1 });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toEqual(expect.arrayContaining(["species", "name"]));
  });

  it("TC-L03 enum tidak valid -> 400", async () => {
    const res = await api("post", "/api/v1/livestock").send(sapiPayload({ species: "naga" }));
    expect(res.statusCode).toBe(400);
  });

  it("TC-L04 kode ternak ganda pada user yang sama -> 409", async () => {
    await api("post", "/api/v1/livestock").send(sapiPayload());
    const res = await api("post", "/api/v1/livestock").send(sapiPayload({ name: "Lain" }));
    expect(res.statusCode).toBe(409);
  });

  it("kode yang sama boleh dipakai user lain", async () => {
    await api("post", "/api/v1/livestock").send(sapiPayload());
    const other = await registerAndLogin();
    const res = await api("post", "/api/v1/livestock", other.token).send(sapiPayload());
    expect(res.statusCode).toBe(201);
  });

  it("tanpa code boleh berkali-kali (unique hanya berlaku jika code diisi)", async () => {
    const a = await api("post", "/api/v1/livestock").send(ayamPayload({ name: "Kandang 1" }));
    const b = await api("post", "/api/v1/livestock").send(ayamPayload({ name: "Kandang 2" }));
    expect([a.statusCode, b.statusCode]).toEqual([201, 201]);
  });

  it("client tidak bisa menentukan user_id atau status awal", async () => {
    const res = await api("post", "/api/v1/livestock").send(
      sapiPayload({ user_id: "6500a1b2c3d4e5f678909999", status: "sold" })
    );
    expect(res.body.data.user_id).toBe(auth.userId);
    expect(res.body.data.status).toBe("active");
  });

  it("individual: quantity dipaksa 1 dan sickCount mengikuti healthStatus", async () => {
    const res = await api("post", "/api/v1/livestock").send(
      sapiPayload({ quantity: 5, healthStatus: "sakit" })
    );
    expect(res.body.data).toMatchObject({ quantity: 1, sickCount: 1 });
  });

  it("batch: sickCount melebihi quantity -> 400", async () => {
    const res = await api("post", "/api/v1/livestock").send(ayamPayload({ quantity: 10, sickCount: 11 }));
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/v1/livestock (daftar, pencarian, filter)", () => {
  it("TC-L05 pagination: page=1&limit=5", async () => {
    for (let i = 1; i <= 7; i += 1) {
      await createLivestock(auth.token, sapiPayload({ code: `SAPI-${i}`, name: `Sapi ${i}` }));
    }
    const p1 = await api("get", "/api/v1/livestock?page=1&limit=5");
    expect(p1.statusCode).toBe(200);
    expect(p1.body.data).toHaveLength(5);
    expect(p1.body.pagination).toEqual({ page: 1, limit: 5, totalItems: 7, totalPages: 2 });

    const p2 = await api("get", "/api/v1/livestock?page=2&limit=5");
    expect(p2.body.data).toHaveLength(2);
  });

  it("TC-L06 pencarian: search=bali", async () => {
    await createLivestock(auth.token, sapiPayload({ code: "S1", name: "Si Bali" }));
    await createLivestock(auth.token, sapiPayload({ code: "K1", species: "kambing", name: "Mbek", breed: "Etawa" }));
    const res = await api("get", "/api/v1/livestock?search=bali");
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("Si Bali");
  });

  it("TC-L07 filter kombinasi: species=sapi & healthStatus=sakit", async () => {
    await createLivestock(auth.token, sapiPayload({ code: "S1", name: "Sehat", healthStatus: "sehat" }));
    await createLivestock(auth.token, sapiPayload({ code: "S2", name: "Sakit", healthStatus: "sakit" }));
    await createLivestock(auth.token, ayamPayload({ healthStatus: "sakit", sickCount: 3 }));
    const res = await api("get", "/api/v1/livestock?species=sapi&healthStatus=sakit");
    expect(res.body.data.map((d) => d.name)).toEqual(["Sakit"]);
  });

  it("pengurutan: sortBy=name&order=asc", async () => {
    await createLivestock(auth.token, sapiPayload({ code: "S1", name: "Budi" }));
    await createLivestock(auth.token, sapiPayload({ code: "S2", name: "Andi" }));
    const res = await api("get", "/api/v1/livestock?sortBy=name&order=asc");
    expect(res.body.data.map((d) => d.name)).toEqual(["Andi", "Budi"]);
  });

  it("hanya menampilkan data milik sendiri", async () => {
    await createLivestock(auth.token, sapiPayload());
    const other = await registerAndLogin();
    const res = await api("get", "/api/v1/livestock", other.token);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.totalItems).toBe(0);
  });

  it("query tidak valid -> 400", async () => {
    const res = await api("get", "/api/v1/livestock?limit=abc&species=naga");
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/v1/livestock/:id", () => {
  it("TC-L08 detail ternak milik user -> 200 dokumen lengkap", async () => {
    const created = await createLivestock(auth.token, sapiPayload());
    const res = await api("get", `/api/v1/livestock/${created._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toMatchObject({ _id: created._id, species: "sapi", location: "Kandang B" });
  });

  it("TC-L09 ID tidak valid -> 400", async () => {
    const res = await api("get", "/api/v1/livestock/abc");
    expect(res.statusCode).toBe(400);
  });

  it("TC-L10 ObjectId valid tetapi tidak ada -> 404", async () => {
    const res = await api("get", "/api/v1/livestock/6500a1b2c3d4e5f678909999");
    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /api/v1/livestock/:id", () => {
  it("TC-L11 ubah data -> 200, nilai dan updatedAt berubah", async () => {
    const created = await createLivestock(auth.token, sapiPayload());
    await new Promise((r) => setTimeout(r, 15));
    const res = await api("put", `/api/v1/livestock/${created._id}`).send({ currentWeightKg: 300 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.currentWeightKg).toBe(300);
    expect(res.body.data.name).toBe("Si Bali"); // field lain tidak berubah
    expect(new Date(res.body.data.updatedAt).getTime()).toBeGreaterThan(new Date(created.updatedAt).getTime());
  });

  it("TC-L12 mengubah data milik user lain -> 404 dan data tidak berubah", async () => {
    const created = await createLivestock(auth.token, sapiPayload());
    const other = await registerAndLogin();
    const res = await api("put", `/api/v1/livestock/${created._id}`, other.token).send({ currentWeightKg: 1 });
    expect(res.statusCode).toBe(404);
    const inDb = await Livestock.findById(created._id);
    expect(inDb.currentWeightKg).toBe(285);
  });

  it("user_id tidak bisa diubah lewat PUT", async () => {
    const created = await createLivestock(auth.token, sapiPayload());
    const res = await api("put", `/api/v1/livestock/${created._id}`).send({ user_id: "6500a1b2c3d4e5f678909999" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user_id).toBe(auth.userId);
  });

  it("mengubah status menjadi sold", async () => {
    const created = await createLivestock(auth.token, sapiPayload());
    const res = await api("put", `/api/v1/livestock/${created._id}`).send({ status: "sold" });
    expect(res.body.data.status).toBe("sold");
  });

  it("nilai tidak valid -> 400", async () => {
    const created = await createLivestock(auth.token, sapiPayload());
    const res = await api("put", `/api/v1/livestock/${created._id}`).send({ healthStatus: "kritis" });
    expect(res.statusCode).toBe(400);
  });

  it("kode bentrok dengan data lain milik user -> 409", async () => {
    await createLivestock(auth.token, sapiPayload({ code: "A" }));
    const second = await createLivestock(auth.token, sapiPayload({ code: "B", name: "Kedua" }));
    const res = await api("put", `/api/v1/livestock/${second._id}`).send({ code: "A" });
    expect(res.statusCode).toBe(409);
  });
});

describe("DELETE /api/v1/livestock/:id", () => {
  it("TC-L13 hapus data -> 200 dan hilang dari database", async () => {
    const created = await createLivestock(auth.token, sapiPayload());
    const res = await api("delete", `/api/v1/livestock/${created._id}`);
    expect(res.statusCode).toBe(200);
    expect(await Livestock.findById(created._id)).toBeNull();
  });

  it("TC-L14 hapus data yang tidak ada -> 404", async () => {
    const res = await api("delete", "/api/v1/livestock/6500a1b2c3d4e5f678909999");
    expect(res.statusCode).toBe(404);
  });

  it("tidak bisa menghapus data milik user lain -> 404", async () => {
    const created = await createLivestock(auth.token, sapiPayload());
    const other = await registerAndLogin();
    const res = await api("delete", `/api/v1/livestock/${created._id}`, other.token);
    expect(res.statusCode).toBe(404);
    expect(await Livestock.findById(created._id)).not.toBeNull();
  });
});
