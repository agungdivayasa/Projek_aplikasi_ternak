const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const db = require("../helpers/db");
const {
  app, request, registerAndLogin, registerPayload, bearer, sapiPayload, createLivestock,
} = require("../helpers/factory");
const User = require("../../src/models/User");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.disconnect);

const PROTECTED = "/api/v1/livestock";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");

describe("Evaluasi keamanan JWT", () => {
  it("TC-S01 tanpa header Authorization -> 401", async () => {
    const res = await request(app).get(PROTECTED);
    expect(res.statusCode).toBe(401);
  });

  it("TC-S02 skema autentikasi salah (Basic) -> 401", async () => {
    const res = await request(app).get(PROTECTED).set("Authorization", "Basic dXNlcjpwYXNz");
    expect(res.statusCode).toBe(401);
  });

  it("TC-S03 token rusak -> 401", async () => {
    const res = await request(app).get(PROTECTED).set("Authorization", "Bearer abc.def.ghi");
    expect(res.statusCode).toBe(401);
  });

  it("TC-S04 signature dipalsukan (secret lain) -> 401", async () => {
    const { userId } = await registerAndLogin();
    const forged = jwt.sign({ id: userId, role: "admin" }, "secret-penyerang");
    const res = await request(app).get(PROTECTED).set("Authorization", bearer(forged));
    expect(res.statusCode).toBe(401);
  });

  it("TC-S05 token kedaluwarsa -> 401", async () => {
    const { userId } = await registerAndLogin();
    const expired = jwt.sign(
      { id: userId, role: "user", exp: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET
    );
    const res = await request(app).get(PROTECTED).set("Authorization", bearer(expired));
    expect(res.statusCode).toBe(401);
  });

  it("TC-S06 token tanpa signature (alg none) -> 401", async () => {
    const { userId } = await registerAndLogin();
    const none = `${b64({ alg: "none", typ: "JWT" })}.${b64({ id: userId, role: "user" })}.`;
    const res = await request(app).get(PROTECTED).set("Authorization", bearer(none));
    expect(res.statusCode).toBe(401);
  });

  it("TC-S07 akses data pengguna lain (IDOR) -> 404, data tidak terbuka", async () => {
    const owner = await registerAndLogin();
    const intruder = await registerAndLogin();
    const item = await createLivestock(owner.token, sapiPayload());
    const res = await request(app)
      .get(`${PROTECTED}/${item._id}`)
      .set("Authorization", bearer(intruder.token));
    expect(res.statusCode).toBe(404);
    expect(JSON.stringify(res.body)).not.toContain("Si Bali");
  });

  it("TC-S08 password dan hash tidak bocor di response", async () => {
    const reg = await request(app).post("/api/v1/auth/register").send(registerPayload());
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "agus@ternakku.id", password: "Password123" });
    for (const res of [reg, login]) {
      const text = JSON.stringify(res.body);
      expect(text).not.toMatch(/"password"/);
      expect(text).not.toContain("$2");
    }
  });

  it("TC-S09 NoSQL injection pada login -> ditolak", async () => {
    await request(app).post("/api/v1/auth/register").send(registerPayload());
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: { $gt: "" }, password: "apa-saja" });
    expect([400, 401]).toContain(res.statusCode);
    expect(res.body.data).toBeUndefined();
  });

  it("TC-S09b NoSQL injection pada query string -> ditolak atau diabaikan", async () => {
    const { token } = await registerAndLogin();
    await createLivestock(token, sapiPayload());
    const res = await request(app)
      .get(`${PROTECTED}?species[$ne]=sapi`)
      .set("Authorization", bearer(token));
    expect(res.statusCode).toBe(400);
  });

  it("TC-S10 input XSS disanitasi", async () => {
    const { token } = await registerAndLogin();
    const res = await request(app)
      .post(PROTECTED)
      .set("Authorization", bearer(token))
      .send(sapiPayload({ name: "<script>alert(1)</script>Sapi XSS" }));
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).not.toContain("<script>");
    expect(res.body.data.name).toContain("Sapi XSS");
  });

  it("TC-S11 secret JWT dari environment dan .env tidak ikut repositori", () => {
    const tokenSource = fs.readFileSync(path.join(__dirname, "../../src/utils/token.js"), "utf8");
    expect(tokenSource).toContain("process.env.JWT_SECRET");
    const gitignore = fs.readFileSync(path.join(__dirname, "../../.gitignore"), "utf8");
    expect(gitignore.split("\n")).toContain(".env");
  });

  it("token milik user yang sudah dihapus atau dinonaktifkan -> 401", async () => {
    const a = await registerAndLogin();
    await User.updateOne({ _id: a.userId }, { isActive: false });
    const res = await request(app).get(PROTECTED).set("Authorization", bearer(a.token));
    expect(res.statusCode).toBe(401);

    const b = await registerAndLogin();
    await User.deleteOne({ _id: b.userId });
    const res2 = await request(app).get(PROTECTED).set("Authorization", bearer(b.token));
    expect(res2.statusCode).toBe(401);
  });

  it("JSON body rusak -> 400, endpoint tidak ada -> 404", async () => {
    const bad = await request(app)
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .send("{ bukan json");
    expect(bad.statusCode).toBe(400);

    const missing = await request(app).get("/api/v1/tidak-ada");
    expect(missing.statusCode).toBe(404);
  });
});
