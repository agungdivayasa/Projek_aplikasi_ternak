const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateToken, verifyToken } = require("../../src/utils/token");
const { clean } = require("../../src/middleware/sanitize");

describe("Bcrypt (hashing password)", () => {
  it("hash berbeda dari teks asli dan bisa diverifikasi", async () => {
    const hash = await bcrypt.hash("Password123", 10);
    expect(hash).not.toBe("Password123");
    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(await bcrypt.compare("Password123", hash)).toBe(true);
    expect(await bcrypt.compare("PasswordSalah", hash)).toBe(false);
  });

  it("hash dari password yang sama selalu berbeda (salt acak)", async () => {
    const [a, b] = await Promise.all([bcrypt.hash("Sama12345", 10), bcrypt.hash("Sama12345", 10)]);
    expect(a).not.toBe(b);
  });
});

describe("JWT", () => {
  const user = { _id: "6500a1b2c3d4e5f678901234", role: "user" };

  it("token bisa dibuat dan diverifikasi", () => {
    const decoded = verifyToken(generateToken(user));
    expect(decoded).toMatchObject({ id: user._id, role: "user" });
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it("token kedaluwarsa ditolak", () => {
    const expired = jwt.sign(
      { id: user._id, role: "user", exp: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET
    );
    expect(() => verifyToken(expired)).toThrow(/expired/);
  });

  it("token dengan secret berbeda ditolak", () => {
    const forged = jwt.sign({ id: user._id, role: "admin" }, "secret-lain");
    expect(() => verifyToken(forged)).toThrow(/invalid signature/);
  });

  it("token tanpa signature (alg none) ditolak", () => {
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const none = `${b64({ alg: "none", typ: "JWT" })}.${b64({ id: user._id, role: "admin" })}.`;
    expect(() => verifyToken(none)).toThrow();
  });
});

describe("sanitizeBody (clean)", () => {
  it("menghapus tag HTML pada string, termasuk yang bersarang", () => {
    const result = clean({
      name: "<script>alert(1)</script>Sapi",
      speciesDetails: { note: "<b>tebal</b>", tags: ["<i>a</i>", "b"] },
    });
    expect(result.name).toBe("alert(1)Sapi");
    expect(result.speciesDetails.note).toBe("tebal");
    expect(result.speciesDetails.tags).toEqual(["a", "b"]);
  });

  it("tidak mengubah password", () => {
    expect(clean({ password: "<abc>12345", confirmPassword: "<abc>12345" })).toEqual({
      password: "<abc>12345",
      confirmPassword: "<abc>12345",
    });
  });

  it("angka dan boolean dibiarkan", () => {
    expect(clean({ quantity: 5, isPregnant: false })).toEqual({ quantity: 5, isPregnant: false });
  });
});
