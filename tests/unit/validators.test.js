const {
  isValidEmail, isValidObjectId, validateRegister, validateLogin,
  validateLivestock, parseListQuery,
} = require("../../src/utils/validators");

const fields = (errors) => errors.map((e) => e.field);

describe("isValidEmail & isValidObjectId", () => {
  it("menerima email valid dan menolak yang salah format", () => {
    expect(isValidEmail("agus@ternakku.id")).toBe(true);
    expect(isValidEmail("agus@")).toBe(false);
    expect(isValidEmail("agus.ternakku.id")).toBe(false);
    expect(isValidEmail({ $gt: "" })).toBe(false);
  });

  it("hanya menerima ObjectId 24 karakter heksadesimal", () => {
    expect(isValidObjectId("6500a1b2c3d4e5f678901234")).toBe(true);
    expect(isValidObjectId("abc")).toBe(false);
    expect(isValidObjectId("123456789012")).toBe(false); // 12 karakter bukan ObjectId valid di sini
  });
});

describe("validateRegister", () => {
  const valid = { name: "Agus", email: "a@b.co", password: "Password123", confirmPassword: "Password123" };

  it("tidak ada error untuk data valid", () => {
    expect(validateRegister(valid)).toEqual([]);
  });

  it("menolak email tidak valid", () => {
    expect(fields(validateRegister({ ...valid, email: "salah" }))).toContain("email");
  });

  it("menolak password kurang dari 8 karakter", () => {
    expect(fields(validateRegister({ ...valid, password: "abc", confirmPassword: "abc" }))).toContain("password");
  });

  it("menolak konfirmasi password yang berbeda", () => {
    expect(fields(validateRegister({ ...valid, confirmPassword: "Beda12345" }))).toContain("confirmPassword");
  });

  it("menolak body kosong", () => {
    expect(validateRegister(undefined).length).toBeGreaterThan(0);
  });
});

describe("validateLogin", () => {
  it("menolak email berupa objek (NoSQL injection)", () => {
    expect(fields(validateLogin({ email: { $gt: "" }, password: "x" }))).toContain("email");
  });

  it("menerima email dan password berupa teks", () => {
    expect(validateLogin({ email: "a@b.co", password: "x" })).toEqual([]);
  });
});

describe("validateLivestock", () => {
  const sapi = {
    species: "sapi", trackingMode: "individual", name: "Si Bali", quantity: 1,
    acquisition: { type: "purchase", date: "2025-09-01", price: 1000 },
  };

  it("menerima data valid", () => {
    expect(validateLivestock(sapi)).toEqual([]);
  });

  it("mewajibkan field utama saat membuat data baru", () => {
    expect(fields(validateLivestock({}))).toEqual(
      expect.arrayContaining(["species", "trackingMode", "name", "quantity", "acquisition"])
    );
  });

  it("menolak enum yang tidak dikenal", () => {
    expect(fields(validateLivestock({ ...sapi, species: "naga" }))).toContain("species");
    expect(fields(validateLivestock({ ...sapi, healthStatus: "kritis" }))).toContain("healthStatus");
  });

  it("menolak quantity bukan bilangan bulat positif", () => {
    expect(fields(validateLivestock({ ...sapi, quantity: 0 }))).toContain("quantity");
    expect(fields(validateLivestock({ ...sapi, quantity: 1.5 }))).toContain("quantity");
  });

  it("memvalidasi acquisition", () => {
    const bad = { ...sapi, acquisition: { type: "curian", date: "bukan-tanggal", price: -1 } };
    expect(fields(validateLivestock(bad))).toEqual(
      expect.arrayContaining(["acquisition.type", "acquisition.date", "acquisition.price"])
    );
  });

  it("mode partial (PUT) tidak mewajibkan field yang tidak dikirim", () => {
    expect(validateLivestock({ currentWeightKg: 300 }, { partial: true })).toEqual([]);
    expect(fields(validateLivestock({ currentWeightKg: -5 }, { partial: true }))).toContain("currentWeightKg");
  });
});

describe("parseListQuery", () => {
  it("memakai nilai default", () => {
    const { value, errors } = parseListQuery({});
    expect(errors).toEqual([]);
    expect(value).toMatchObject({ page: 1, limit: 10, sortBy: "createdAt", order: "desc" });
  });

  it("membatasi limit maksimal 100", () => {
    expect(parseListQuery({ limit: "999" }).value.limit).toBe(100);
  });

  it("menolak page yang bukan angka dan enum yang salah", () => {
    const { errors } = parseListQuery({ page: "abc", species: "naga", order: "naik" });
    expect(fields(errors)).toEqual(expect.arrayContaining(["page", "species", "order"]));
  });

  it("menolak query berupa objek atau array", () => {
    const { errors } = parseListQuery({ species: { $ne: "sapi" }, search: ["a", "b"] });
    expect(fields(errors)).toEqual(expect.arrayContaining(["species", "search"]));
  });

  it("mengambil search dan filter yang valid", () => {
    const { value, errors } = parseListQuery({ search: " bali ", species: "sapi", healthStatus: "sakit" });
    expect(errors).toEqual([]);
    expect(value).toMatchObject({ search: "bali", species: "sapi", healthStatus: "sakit" });
  });
});
