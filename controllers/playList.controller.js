const PlayLists = require("../models/PlayLists.model");
const PlayList_Songs = require("../models/Playlist_Songs.model");
const jwt = require("jsonwebtoken");

const playListController = {
    getplaylist: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                let playlist = await PlayLists.find({ id_account: account.id });
                return res.status(200).json(playlist);
            });
        }
        catch (err) {
            return res.status(500).json(err);
        }
    },
    deleteplaylist: async (req, res) => {
        try {
            await Songs.findByIdAndDelete(req.params.id);
            return res.status(200).json("Songs deleted");
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    addPlaylist: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                const newPlaylist = await new PlayLists({
                    id_account: account.id,
                    name_playlist: req.body.name_playlist,
                })
                const playlist = await newPlaylist.save();
                return res.status(200).json(playlist);

            });
        }
        catch (err) { res.status(500).json(err); }
    },
    removeSongFromPlaylist: async (req, res) => {
        try {
            await PlayList_Songs.findOneAndDelete({ id_song: req.params.id_song });

            res.status(200).json("Songs remove");
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    addSongToPlayList: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ err: "No refresh token provided" });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ err: "Invalid refresh token" });
                }
                const addsong = await new PlayList_Songs({
                    id_playlist: req.body.id_playlist,
                    id_song: req.body.id_song
                })
                const song = await addsong.save();
                return res.status(200).json(song);
            })
        } catch (err) {
            return res.status(500).json(err);
        }
    }
}

module.exports = playListController;