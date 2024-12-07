const PlayLists = require("../models/PlayLists.model");
const PlayList_Songs = require("../models/Playlist_Songs.model");
const jwt = require("jsonwebtoken");

const playListController = {
    getplaylist: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            // console.log("Refresh token: ", refreshToken);
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
                const name_playlist = req.body.name_playlist;
                if (!name_playlist) {
                    return res.status(400).json("Invalid name_playlist");
                }
                const newPlaylist = await new PlayLists({
                    id_account: account.id,
                    name_playlist: name_playlist,
                })
                const playlist = await newPlaylist.save();
                return res.status(200).json(playlist);

            });
        }
        catch (err) { res.status(500).json(err); }
    },
    removeSongFromPlaylist: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ err: "No refresh token provided" });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ err: "Invalid refresh token" });
                }
                const id_playlist = req.body.id_playlist;
                const id_song = req.body.id_song;
                console.log("id_playlist", id_playlist);
                console.log("id_song", id_song);

                if (!id_playlist || !id_song) {
                    return res.status(400).json({ message: "Playlist ID and Song ID are required" });
                }
                await PlayList_Songs.findOneAndDelete({ id_playlist: id_playlist, id_song: id_song });
                const playlistSongs = await PlayList_Songs.find({ id_playlist: id_playlist }).populate('id_song');
                const songs = playlistSongs.map(item => item.id_song);
                return res.status(200).json(songs);
            })
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
                const id_playlist = req.body.id_playlist;
                const id_song = req.body.id_song;
                console.log("playlist", id_playlist);
                console.log("song", id_song);
                if (!id_playlist || !id_song) {
                    return res.status(400).json({ message: "Playlist ID and Song ID are required" });
                }

                const existingEntry = await PlayList_Songs.findOne({ id_playlist: id_playlist, id_song: id_song });
                if (existingEntry) {
                    return res.status(400).json({ message: "Bài hát có trong playlist này rồi" });
                }
                const addsong = await new PlayList_Songs({
                    id_playlist: id_playlist,
                    id_song: id_song
                })
                const song = await addsong.save();
                return res.status(200).json(song);
            })
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    getSongFromPlayList: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ err: "No refresh token provided" });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ err: "Invalid refresh token" });
                }
                const playlistId = req.params.id || req.query.id;
                const playlistSongs = await PlayList_Songs.find({ id_playlist: playlistId }).populate('id_song');
                const songs = playlistSongs.map(item => item.id_song);
                return res.status(200).json(songs);
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    },
    changeNamePlaylist: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                const playlistName = req.body.playlistName;

                const playlist_id = req.body.playlist_id;
                console.log("name", playlistName);
                console.log("id", playlist_id);
                await PlayLists.findOneAndUpdate({ _id: playlist_id },
                    { $set: { name_playlist: playlistName } },
                    { new: true, runValidators: true });
                return res.status(200).json();
            }
            );
        } catch (err) {
            return res.status(500).json(err);
        }
    },
}

module.exports = playListController;