const mongoose = require("mongoose");
const Livestock = require("../models/Livestock");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/v1/dashboard/stats
// Hanya ternak berstatus "active" milik user yang dihitung.
const stats = asyncHandler(async (req, res) => {
  // Di aggregate, Mongoose tidak otomatis mengubah string menjadi ObjectId
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const groups = await Livestock.aggregate([
    { $match: { user_id: userId, status: "active" } },
    { $group: { _id: "$species", total: { $sum: "$quantity" }, sick: { $sum: "$sickCount" } } },
    { $sort: { total: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalLivestock: groups.reduce((sum, g) => sum + g.total, 0),
      totalSick: groups.reduce((sum, g) => sum + g.sick, 0),
      populationBySpecies: groups.map((g) => ({ species: g._id, total: g.total })),
    },
  });
});

module.exports = { stats };
