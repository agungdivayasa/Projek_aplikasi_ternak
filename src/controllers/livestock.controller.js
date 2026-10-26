const Livestock = require("../models/Livestock");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const {
  isValidObjectId, validateLivestock, parseListQuery,
} = require("../utils/validators");

// Field yang boleh diisi/diubah oleh client.
// _id, user_id, createdAt, updatedAt sengaja tidak ada: tidak boleh diubah dari luar.
const WRITABLE_FIELDS = [
  "species", "trackingMode", "code", "name", "breed", "sex", "quantity",
  "birthDate", "acquisition", "currentWeightKg", "status", "healthStatus",
  "sickCount", "location", "speciesDetails", "notes",
];

// Field ringkas untuk tampilan daftar
const LIST_FIELDS =
  "species trackingMode code name breed quantity status healthStatus sickCount currentWeightKg location createdAt";

const pickWritable = (body) => {
  const data = {};
  for (const key of WRITABLE_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  // code kosong dianggap tidak diisi, supaya tidak bentrok dengan unique index
  if (data.code === "" || data.code === null) data.code = undefined;
  return data;
};

const assertValidId = (id) => {
  if (!isValidObjectId(id)) throw new ApiError(400, "ID tidak valid");
};

// GET /api/v1/livestock
const list = asyncHandler(async (req, res) => {
  const { value, errors } = parseListQuery(req.query);
  if (errors.length) throw new ApiError(400, "Parameter query tidak valid", errors);

  // user_id selalu dari token: user hanya melihat data miliknya
  const filter = { user_id: req.user.id };
  if (value.species) filter.species = value.species;
  if (value.status) filter.status = value.status;
  if (value.healthStatus) filter.healthStatus = value.healthStatus;
  if (value.search) filter.$text = { $search: value.search };

  const sort = { [value.sortBy]: value.order === "asc" ? 1 : -1 };
  const skip = (value.page - 1) * value.limit;

  const [items, totalItems] = await Promise.all([
    Livestock.find(filter).select(LIST_FIELDS).sort(sort).skip(skip).limit(value.limit).lean(),
    Livestock.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: items,
    pagination: {
      page: value.page,
      limit: value.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / value.limit),
    },
  });
});

// GET /api/v1/livestock/:id
const getOne = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const item = await Livestock.findOne({ _id: req.params.id, user_id: req.user.id }).lean();
  if (!item) throw new ApiError(404, "Data ternak tidak ditemukan");
  res.status(200).json({ success: true, data: item });
});

// POST /api/v1/livestock
const create = asyncHandler(async (req, res) => {
  const errors = validateLivestock(req.body);
  if (errors.length) throw new ApiError(400, "Validasi gagal", errors);

  const data = pickWritable(req.body);
  delete data.status; // status awal selalu "active"

  const item = await Livestock.create({ ...data, user_id: req.user.id });
  res.status(201).json({
    success: true,
    message: "Data ternak berhasil ditambahkan",
    data: item,
  });
});

// PUT /api/v1/livestock/:id
const update = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const errors = validateLivestock(req.body, { partial: true });
  if (errors.length) throw new ApiError(400, "Validasi gagal", errors);

  const item = await Livestock.findOne({ _id: req.params.id, user_id: req.user.id });
  if (!item) throw new ApiError(404, "Data ternak tidak ditemukan");

  // Memakai save() (bukan findOneAndUpdate) agar aturan bisnis di model ikut berjalan
  item.set(pickWritable(req.body));
  await item.save();

  res.status(200).json({
    success: true,
    message: "Data ternak berhasil diperbarui",
    data: item,
  });
});

// DELETE /api/v1/livestock/:id
const remove = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const item = await Livestock.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
  if (!item) throw new ApiError(404, "Data ternak tidak ditemukan");
  res.status(200).json({ success: true, message: "Data ternak berhasil dihapus" });
});

module.exports = { list, getOne, create, update, remove };
