const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin, verifyTokenAndUserAuthorization } = require("../controllers/middleware.controller");
const albumController = require("../controllers/ablum.controller");

router.get('/getAlbumByAccount/:id', albumController.getAlbumByAccount);
router.get('/getALLAlbum', albumController.getAllAlbum);
router.post('/addAlbum', albumController.addAlbum);
router.delete('/deleteAlbum/:id', albumController.deleteAblum);

module.exports = router;