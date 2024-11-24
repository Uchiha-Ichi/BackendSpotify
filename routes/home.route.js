const express = require("express");
const router = express.Router();

// Route cho trang chủ
router.get("/", (req, res) => {
    res.render("home", { cookies: req.cookies }); // Giả sử bạn đã đặt home.ejs trong thư mục views
});

module.exports = router;
