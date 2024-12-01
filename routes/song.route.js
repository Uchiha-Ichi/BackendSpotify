const express = require("express");
const songController = require("../controllers/song.controller");
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin, verifyTokenAndUserAuthorization } = require("../controllers/middleware.controller");

router.post("/addSong", songController.addSong);
router.post("/addSongPathAndImgPath", songController.addSongPathAndImgPath);
router.delete("/:id", verifyTokenAndUserAuthorization, songController.deleteSong);
router.get("/getAllSongs", songController.getAllSongs);
router.get("/getSongById/:id", songController.getSongById);
router.get("/getImageById/:id", songController.getImageById);
router.post("/addSongToLove", songController.addSongToLove);
router.delete("removeSongFromLove", songController.removeSongFromLove);
router.put("/updateSong/:id", songController.editSong);
router.put("/addSongtoAlbum/:id", songController.addSongtoAlbum);
router.put("/removeSongFromAlbum/:id", songController.removeSongFromAlbum);
router.get("/getSongByAlbum", songController.getSongByAlbum);
router.get('/get_emotions', songController.getEmotions);
module.exports = router;