const db = require("../helpers/db");
const {
  app, request, registerAndLogin, bearer, sapiPayload, ayamPayload, createLivestock,
} = require("../helpers/factory");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.disconnect);

const stats = (token) =>
  request(app).get("/api/v1/dashboard/stats").set("Authorization", bearer(token));

describe("GET /api/v1/dashboard/stats", () => {
  it("TC-D01 statistik benar: 2 sapi, 500 ayam (12 sakit)", async () => {
    const { token } = await registerAndLogin();
    await createLivestock(token, sapiPayload({ code: "S1" }));
    await createLivestock(token, sapiPayload({ code: "S2", name: "Sapi 2" }));
    await createLivestock(token, ayamPayload({ quantity: 500, healthStatus: "sakit", sickCount: 12 }));

    const res = await stats(token);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual({
      totalLivestock: 502,
      totalSick: 12,
      populationBySpecies: [
        { species: "ayam", total: 500 },
        { species: "sapi", total: 2 },
      ],
    });
  });

  it("TC-D02 hanya ternak berstatus active yang dihitung", async () => {
    const { token } = await registerAndLogin();
    const sapi = await createLivestock(token, sapiPayload({ code: "S1" }));
    await createLivestock(token, sapiPayload({ code: "S2", name: "Sapi 2" }));
    await request(app)
      .put(`/api/v1/livestock/${sapi._id}`)
      .set("Authorization", bearer(token))
      .send({ status: "sold" });

    const res = await stats(token);
    expect(res.body.data.totalLivestock).toBe(1);
  });

  it("TC-D03 data milik user lain tidak ikut dihitung", async () => {
    const a = await registerAndLogin();
    const b = await registerAndLogin();
    await createLivestock(a.token, sapiPayload());
    await createLivestock(b.token, ayamPayload());

    const res = await stats(a.token);
    expect(res.body.data.totalLivestock).toBe(1);
    expect(res.body.data.populationBySpecies).toEqual([{ species: "sapi", total: 1 }]);
  });

  it("TC-D04 pengguna baru tanpa ternak -> total 0 dan array kosong", async () => {
    const { token } = await registerAndLogin();
    const res = await stats(token);
    expect(res.body.data).toEqual({ totalLivestock: 0, totalSick: 0, populationBySpecies: [] });
  });

  it("tanpa token -> 401", async () => {
    const res = await request(app).get("/api/v1/dashboard/stats");
    expect(res.statusCode).toBe(401);
  });
});
