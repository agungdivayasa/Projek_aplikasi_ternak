const express = require("express");
const { protect } = require("../middleware/auth");
const { list, getOne, create, update, remove } = require("../controllers/livestock.controller");

const router = express.Router();

// Semua route livestock wajib login
router.use(protect);

router.route("/").get(list).post(create);
router.route("/:id").get(getOne).put(update).delete(remove);

module.exports = router;
