const express = require("express");
const songController = require("../controllers/song.controller");
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin, verifyTokenAndUserAuthorization } = require("../controllers/middleware.controller");

router.post("/addSong", songController.addSong);
router.post("/addSongPathAndImgPath", songController.addSongPathAndImgPath);
router.delete("/deleteSong/:id", songController.deleteSong);
router.get("/getAllSongs", songController.getAllSongs);
router.get("/getAllSongsForAccount", songController.getAllSongsForAccount);
router.get("/getSongById/:id", songController.getSongById);
router.get("/getImageById/:id", songController.getImageById);
router.get("/addSongToLove/:id", songController.addSongToLove);
router.delete("removeSongFromLove", songController.removeSongFromLove);
router.post("/updateSong", songController.editSong);
router.post("/addSongtoAlbum", songController.addSongtoAlbum);
router.put("/removeSongFromAlbum/:id", songController.removeSongFromAlbum);
router.get("/getSongByAlbum/:id", songController.getSongByAlbum);
router.post('/get_emotions', songController.getEmotions);
router.post('/get_emotions_account', songController.getEmotionsForAccount);
router.get("/getLovedSongbyIdAccount", songController.getLovedSongsbyIdAccount);
router.get("/getSongsByIdAccount/:id", songController.getSongsByIdAccount);


module.exports = router;