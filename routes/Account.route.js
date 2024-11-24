const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller");

const {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndUserAuthorization,
} = require("../controllers/verifyToken.controller");



module.exports = router;