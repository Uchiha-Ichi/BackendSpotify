const express = require("express");
const songController = require("../controllers/song.controller");
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin, verifyTokenAndUserAuthorization } = require("../controllers/middleware.controller");

router.post("/addSong", songController.addSong);
router.delete("/:id", verifyTokenAndUserAuthorization, songController.deleteSong);
router.get("/getAllSongs", songController.getAllSongs);
router.get("/getSongById/:id", songController.getSongById);
router.post("/addSongToLove", songController.addSongToLove);
router.delete("removeSongFromLove", songController.removeSongFromLove);
router.put("/updateSong/:id", songController.editSong);
module.exports = router;