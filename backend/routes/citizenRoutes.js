const express = require("express");
const router = express.Router();

const {
registerCitizen,
getCitizen
} = require("../controllers/citizenController");

router.post("/register", registerCitizen);
router.get("/:mobile", getCitizen);

module.exports = router;