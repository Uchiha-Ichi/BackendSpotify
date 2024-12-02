const express = require("express");
const songConstroller = require("../controllers/song.controller");
const playListController = require("../controllers/playList.controller");
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin, verifyTokenAndUserAuthorization } = require("../controllers/middleware.controller");

router.get("/getPlaylist", playListController.getplaylist);
router.delete("/:id", verifyTokenAndUserAuthorization, playListController.deleteplaylist);
router.post("/addPlaylist", playListController.addPlaylist);
router.post("/addSongToPlayList", playListController.addSongToPlayList);
router.delete("/:id", verifyTokenAndUserAuthorization, playListController.removeSongFromPlaylist);

module.exports = router;