const Songs = require("../models/Songs.model");
const jwt = require("jsonwebtoken");
const Loves = require("../models/Loves.model");
const { uploadSong, uploadIMG } = require("../driveApi.js");
const axios = require('axios');
const Types = require("../models/Types.model.js");
const Listens = require("../models/Listens.model.js");
const path = require('path');
const fs = require('fs');
const songController = {
    getAllSongs: async (req, res) => {
        try {
            const allSongs = await Songs.find().sort({ create_date: -1 });

            return res.status(200).json(allSongs);
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    getAllSongsForAccount: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
            const listenedSongs = await Listens.aggregate([
                { $match: { id_account: mongoose.Types.ObjectId(account._id) } },
                {
                    $lookup: {
                        from: 'songs',
                        localField: 'id_song',
                        foreignField: '_id',
                        as: 'song_info'
                    }
                },
                { $unwind: '$song_info' },
                { $sort: { listen_time: -1 } },
                {
                    $group: {
                        _id: '$id_song',
                        latestListenTime: { $first: '$listen_time' },
                        songInfo: { $first: '$song_info' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        id_song: '$_id',
                        songInfo: 1,
                        latestListenTime: 1
                    }
                }
            ]);

            let finalSongs;


            if (!listenedSongs || listenedSongs.length === 0) {
                console.log("No recently listened songs found. Fetching all songs...");
                const allSongs = await Songs.find().sort({ create_date: -1 });
                finalSongs = allSongs.map(song => ({
                    id_song: song._id,
                    songInfo: song,
                    latestListenTime: null
                }));
            } else {
                console.log("Found recently listened songs.");
                finalSongs = listenedSongs;
            }

            // Trả về kết quả
            res.status(200).json({
                message: "Songs fetched successfully",
                data: finalSongs
            });
        });
    },
    getSongById: async (req, res) => {
        try {
            let songs = await Songs.findById(req.params.id);
            if (!songs) return res.status(404).json("Song not found");
            const songLink = songs.link;
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                const newListen = new Listens({
                    id_account: null,
                    id_song: songs._id,
                    listen_time: new Date()
                });
                newListen.save();
            } else {
                jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                    if (err) {
                        return res.status(403).json({ error: "Invalid refresh token." });
                    }
                    const newListen = new Listens({
                        id_account: account.id,
                        id_song: songs._id,
                        listen_time: new Date()
                    });
                    newListen.save();
                })
            }
            try {
                const response = await axios.get(songLink, {
                    responseType: 'stream',
                });
                res.setHeader('Content-Type', response.headers['content-type']);
                res.setHeader('Content-Disposition', response.headers['content-disposition']);

                response.data.pipe(res);
            } catch (e) { return res.status(500).json('Unable to fetch the file.'); }
        }
        catch (err) {
            return res.status(500).json(err);
        }
    },
    getImageById: async (req, res) => {
        try {
            let songs = await Songs.findById(req.params.id);
            if (!songs) return res.status(404).json("Song not found");

            const songIMG = songs.image;


            const response = await axios.get(songIMG, { responseType: 'stream' });
            res.setHeader('Content-Type', response.headers['content-type']);
            response.data.pipe(res);

        } catch (err) {
            return res.status(500).json(err);
        }
    },
    deleteSong: async (req, res) => {
        try {
            await Songs.findByIdAndDelete(req.params.id);
            return res.status(200).json("Songs deleted");
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    addSongPathAndImgPath: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }

                if (!req.files || !req.files.filePath || !req.files.imgPath) {
                    return res.status(400).json({ error: "Files are missing!" });
                }
                let artist = account.id;
                const filePath = req.files.filePath;
                const imgPath = req.files.imgPath;
                const name_song = req.session.name_song;
                console.log("name", name_song);
                const lyrics = req.session.lyrics;
                const description = req.session.description;
                const feat = req.session.feat;
                const id_type = req.session.id_type;
                const driveLink = await uploadSong(filePath, name_song);
                //console.log('Drive link:', driveLink);
                if (!driveLink) {
                    return res.status(500).json({ error: "Không thể upload file lên Google Drive." });
                }

                const driveLinkIMG = await uploadIMG(imgPath, name_song);
                if (!driveLinkIMG) {
                    return res.status(500).json({ error: "Không thể upload ảnh lên Google Drive." });
                }
                const newSong = await new Songs({
                    name_song: name_song,
                    link: driveLink,
                    lyrics: lyrics,
                    image: driveLinkIMG,
                    description: description,
                    create_date: new Date(),
                    id_accounts: artist,
                    feat: feat,
                    id_album: null,
                    id_type: id_type
                });
                const song = await newSong.save().then(saveSong => {
                    const imagesDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images');
                    const songId = saveSong._id.toString();
                    const destinationPath = path.join(imagesDir, `${songId}.jpg`);
                    imgPath.mv(destinationPath, (err) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                    });
                })

                return res.status(200).json(song);

            });
        } catch (err) {
            console.error("Error in addSongPathAndImgPath:", err);
            return res.status(500).json({ error: "Server error." });
        }
    },
    addSong: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                const { name_song, lyrics, description, id_type, feat } = req.body;

                req.session.name_song = name_song.trim();
                req.session.lyrics = lyrics;
                req.session.description = description;
                req.session.id_type = id_type;
                req.session.feat = feat;
                return res.status(200).json({
                });

            }
            );
        } catch (err) {
            console.error("Lỗi khi thêm bài hát:", err);
            return res.status(500).json({ err: "Lỗi server." });
        }
    },
    addSongToLove: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                const newLove = await new Loves({
                    id_account: account.id,
                    id_song: req.body.id__song,
                    love_time: new Date(),

                });
                const love = await newLove.save();
                return res.status(200).json(love);
            }
            );
        }
        catch (err) {
            return res.status(500).json(err);
        }
    },
    removeSongFromLove: async (req, res) => {
        try {
            await Loves.findOneAndDelete({ id_song: req.params.id_song });
            return res.status(200).json("Songs removed successfully");
        }
        catch (err) {
            return res.status(500).json(err);

        }
    },
    editSong: async (req, res) => {
        try {
            const {
                name_song,
                link,
                lyrics,
                image,
                description,
                id_album,
                id_type
            } = req.body;
            const updatedSong = await Songs.findByIdAndUpdate(
                req.params.id,
                {
                    $set: {
                        name_song: name_song,
                        link: link,
                        lyrics: lyrics,
                        image: image,
                        description: description,
                        id_album: id_album,
                        id_type: id_type,
                        updated_at: new Date()
                    }
                },
                { new: true, runValidators: true }
            );

            if (!updatedSong) {
                return res.status(404).json({ error: "Song not found" });
            }

            return res.status(200).json({ message: "Song updated successfully", data: updatedSong });
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    addSongtoAlbum: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided." });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ error: "Invalid refresh token." });
                }
                const {
                    id_album,
                } = req.body;
                const song = await Songs.findByIdAndUpdate(
                    req.params.id,
                    {
                        $set: {
                            id_album: id_album,
                        }
                    },
                    { new: true, runValidators: true }
                );
                if (!song) {
                    return res.status(404).json({ error: "Song not found" });
                }

                return res.status(200).json({ message: "Song added successfully to album" });
            }
            );
        }
        catch (err) {
            return res.status(500).json(err);
        }
    },
    removeSongFromAlbum: async (req, res) => {
        try {
            try {
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    return res.status(401).json({ error: "No refresh token provided." });
                }
                jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                    if (err) {
                        return res.status(403).json({ error: "Invalid refresh token." });
                    }
                    const song = await Songs.findByIdAndUpdate(
                        req.params.id,
                        {
                            $set: {
                                id_type: null,
                            }
                        },
                        { new: true, runValidators: true }
                    );
                    if (!song) {
                        return res.status(404).json({ error: "Song not found" });
                    }
                    return res.status(200).json("Album deleted");
                });
            } catch (err) {
                return res.status(500).json(err);
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    getSongByAlbum: async (req, res) => {
        try {
            const song = await Songs.find({ album: req.params.id });
            if (song.length === 0) {
                return res.status(404).json({
                    message: 'No songs found for this album',
                });
            }
            res.status(200).json({
                message: 'Songs found',
                songs: song,
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    getEmotions: async (req, res) => {
        try {
            const sentence = req.query.sentence;
            if (!sentence) {
                return res.status(501).json({ error: "Text is required" });
            }
            const response = await axios.get("http://127.0.0.1:8000/v1/get_emotions/", {
                params: { sentence },
            });

            const lable = response.data.result[0]?.label;
            const regex = new RegExp(lable, "i");
            const type = await Types.find({ name_type: { $regex: regex } }).lean();
            console.log(type[0]._id);
            const songResults = await Songs.aggregate([
                { $match: { id_type: type[0]._id } },


                {
                    $lookup: {
                        from: "listens",
                        localField: "_id",
                        foreignField: "id_song",
                        as: "listen_info"
                    }
                },

                { $unwind: "$listen_info" },


                { $sort: { "listen_info.listen_time": -1 } },


                {
                    $project: {
                        name_song: 1,
                        listen_time: "$listen_info.listen_time",
                        id_account: "$listen_info.id_account",
                    }
                }
            ]);
            if (songResults.length === 0) {
                const songFinds = await Songs.find({ id_type: type[0]._id })
                return res.status(200).json(songFinds);
            }
            return res.status(200).json(songResults);

        } catch (e) {
            return res.status(500).json({ e: "failed to fetch predictions" });
        }
    }

}

module.exports = songController;