const express = require("express");
const typeController = require("../controllers/type.controller");
const router = express.Router();

router.get('/getAllTypes', typeController.getAllTypes);

module.exports = router;