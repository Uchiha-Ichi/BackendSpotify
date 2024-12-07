const express = require("express");
const songConstroller = require("../controllers/song.controller");
const playListController = require("../controllers/playList.controller");
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin, verifyTokenAndUserAuthorization } = require("../controllers/middleware.controller");

router.get("/getPlaylist", playListController.getplaylist);
router.delete("/deleteplaylist/:id", playListController.deleteplaylist);
router.post("/addPlaylist", playListController.addPlaylist);
router.post("/addSongToPlayList", playListController.addSongToPlayList);
router.post("/removeSongFromPlaylist", playListController.removeSongFromPlaylist);
router.get("/getSongFromPlaylist/:id", playListController.getSongFromPlayList);
router.post("/changeNamePlaylist", playListController.changeNamePlaylist);

module.exports = router;