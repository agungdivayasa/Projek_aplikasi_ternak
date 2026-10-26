const db = require("../helpers/db");
const { app, request, registerPayload } = require("../helpers/factory");
const User = require("../../src/models/User");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.disconnect);

const register = (body) => request(app).post("/api/v1/auth/register").send(body);
const login = (body) => request(app).post("/api/v1/auth/login").send(body);

describe("POST /api/v1/auth/register", () => {
  it("TC-A01 registrasi data valid -> 201 tanpa field password", async () => {
    const res = await register(registerPayload());
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ name: "Putu Agus", email: "agus@ternakku.id", role: "user" });
    expect(res.body.data).not.toHaveProperty("password");
  });

  it("TC-A02 email sudah terdaftar -> 409", async () => {
    await register(registerPayload());
    const res = await register(registerPayload());
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Email sudah terdaftar");
  });

  it.each([
    ["email salah format", { email: "salah" }, "email"],
    ["password kurang dari 8 karakter", { password: "abc", confirmPassword: "abc" }, "password"],
    ["konfirmasi password berbeda", { confirmPassword: "Beda12345" }, "confirmPassword"],
  ])("TC-A03 input tidak valid (%s) -> 400", async (_label, override, field) => {
    const res = await register(registerPayload(override));
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toContain(field);
  });

  it("TC-A04 password tersimpan ter-hash di database", async () => {
    await register(registerPayload());
    const user = await User.findOne({ email: "agus@ternakku.id" }).select("+password");
    expect(user.password).not.toBe("Password123");
    expect(user.password).toMatch(/^\$2[aby]\$/);
  });

  it("email disimpan huruf kecil", async () => {
    const res = await register(registerPayload({ email: "AGUS@Ternakku.ID" }));
    expect(res.body.data.email).toBe("agus@ternakku.id");
  });
});

describe("POST /api/v1/auth/login", () => {
  beforeEach(async () => {
    await register(registerPayload());
  });

  it("TC-A05 login berhasil -> 200 dan token JWT", async () => {
    const res = await login({ email: "agus@ternakku.id", password: "Password123" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token.split(".")).toHaveLength(3);
    expect(res.body.data.expiresIn).toBe("1h");
    expect(res.body.data.user).toMatchObject({ email: "agus@ternakku.id", role: "user" });
    expect(res.body.data.user).not.toHaveProperty("password");
  });

  it("TC-A06 password salah -> 401", async () => {
    const res = await login({ email: "agus@ternakku.id", password: "PasswordSalah" });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Email atau password salah");
  });

  it("TC-A07 email tidak terdaftar -> 401 dengan pesan yang sama dengan TC-A06", async () => {
    const res = await login({ email: "tidakada@ternakku.id", password: "Password123" });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Email atau password salah");
  });

  it("TC-A08 akun nonaktif -> 403", async () => {
    await User.updateOne({ email: "agus@ternakku.id" }, { isActive: false });
    const res = await login({ email: "agus@ternakku.id", password: "Password123" });
    expect(res.statusCode).toBe(403);
  });

  it("email atau password kosong -> 400", async () => {
    const res = await login({});
    expect(res.statusCode).toBe(400);
  });
});
