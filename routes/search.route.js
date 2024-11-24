const express = require("express");
const searchController = require("../controllers/search.controller");
const router = express.Router();

router.post("/search", searchController.search);

module.exports = router;