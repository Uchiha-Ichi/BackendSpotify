const express = require("express");
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../controllers/middleware.controller");

const router = express.Router();

router.get("/getAllArtists", authController.getAllArtist);

router.get("/getArtist/:id", authController.getArtistById);
router.post("/login", authController.loginAccount);

router.post("/register", authController.registerAccount);

router.post("/refresh", verifyToken, authController.requestRefreshToken);

router.post("/logout", verifyToken, authController.logoutAccount);

router.post("/editAccount_name", authController.editAccount_name);

router.post("/editAccount_avatar", authController.editAccount_avatar);

router.post("/editAccount_password", authController.editAccount_password);

// router.post("/refresh", verifyToken, authController.requestRefreshToken);


module.exports = router;