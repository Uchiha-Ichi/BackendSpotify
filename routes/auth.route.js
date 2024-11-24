const express = require("express");
const authController = require("../controllers/auth.controller");
const verifyToken = require("../controllers/middleware.controller");

const router = express.Router();



router.post("/login", authController.loginAccount);

router.post("/register", authController.registerAccount);

router.post("/refresh", authController.requestRefreshToken);

router.post("/logout", authController.logoutAccount);

router.put("/editAccName/:id", authController.editAccount_name);// bỉ ID vì đã lưu trong cookie


router.put("/editAccAV/:id", authController.editAccount_avata);

router.put("/editAccPass/:id", authController.editAccount_password);

module.exports = router;