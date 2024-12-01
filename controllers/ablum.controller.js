
const Albums = require("../models/Albums.model");
const Songs = require("../models/Songs.model");
const jwt = require("jsonwebtoken");

const albumController = {
    getAlbumByAccount: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                let album = await Albums.find({ id_account: account.id });
                return res.status(200).json(playlist);
            });
        }
        catch (err) {
            return res.status(500).json(err);
        }
    },
    getAllAlbum: async (req, res) => {
        try {
            let album = await Albums.find();
            return res.json(200).json(album);

        } catch (err) {
            return res.status(500).json(err);
        }
    },
    deleteAblum: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                const albumId = req.params.id;
                await Albums.findByIdAndDelete(albumId);
                const song = await Songs.updateMany(
                    { id_album: albumId },
                    { $set: { id_album: null } }
                );
                return res.status(200).json("Album deleted");
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    addAlbum: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                const newAlbum = await new Albums({
                    id_account: account.id,
                    name_album: req.body.name_album,
                    create_date: new Date(),
                })
                const album = await newAlbum.save();
                return res.status(200).json(album);

            });
        }
        catch (err) { res.status(500).json(err); }
    },
}

module.exports = albumController;