const Songs = require("../models/Songs.model");
const jwt = require("jsonwebtoken");
const Loves = require("../models/Loves.model");
const { uploadSong, uploadIMG } = require("../driveApi.js");
const axios = require('axios');
const Types = require("../models/Types.model.js");
const Listens = require("../models/Listens.model.js");
const PlayList_Songs = require("../models/Playlist_Songs.model");
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const songController = {
    getAllSongs: async (req, res) => {
        try {
            const allSongs = (await Songs.find()).reverse();

            return res.status(200).json(allSongs);
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    getAllSongsForAccount: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
            const listenedSongs = await Listens.aggregate([
                {
                    $match: {
                        id_account: mongoose.Types.ObjectId(account.id)  // Tìm tất cả bài hát của người dùng với id_account
                    }
                },
                {
                    $lookup: {
                        from: 'songs',  // Lấy thông tin bài hát từ bảng 'songs'
                        localField: 'id_song',  // Sử dụng id_song từ bảng Listens
                        foreignField: '_id',  // So khớp với _id trong bảng Songs
                        as: 'song_info'  // Trả về dưới dạng mảng song_info
                    }
                },
                {
                    $unwind: '$song_info'
                },
                {
                    $project: {
                        _id: '$song_info._id',
                        name_song: '$song_info.name_song',
                        link: '$song_info.link',
                        image: '$song_info.image',
                        lyrics: '$song_info.lyrics',
                        description: '$song_info.description',
                        create_date: '$song_info.create_date',
                        id_accounts: '$song_info.id_accounts',
                        feat: '$song_info.feat',
                        id_album: '$song_info.id_album',
                        id_type: '$song_info.id_type'
                    }
                }
            ]);

            let finalSongs;
            const allSongs = await Songs.find().sort({ create_date: -1 });

            if (!listenedSongs || listenedSongs.length === 0) {
                console.log("No recently listened songs found. Fetching all songs...");

                finalSongs = allSongs.map(song => song);

            } else {
                console.log("Found recently listened songs.");
                const reverseSongs = listenedSongs.reverse();
                const collectionSongs = [...reverseSongs, ...allSongs];
                finalSongs = Array.from(new Map(collectionSongs.map(song => [song._id.toString(), song])).values());
            }

            // Trả về kết quả
            res.status(200).json(finalSongs);
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
            const id_song = req.params.id;
            await Songs.findByIdAndDelete(id_song);
            await PlayList_Songs.deleteMany({ id_song: id_song });
            await Listens_Songs.deleteMany({ id_song: id_song });
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
                    console.log("file", req.files.filePath)
                    console.log("img", req.files.imgPath)
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
                const id_album = req.session.id_album;
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
                    id_album: id_album,
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
                let { name_song, id_album, lyrics, description, id_type, feat } = req.body;
                if (id_album === '') {
                    id_album = null;
                }
                if (description === '') {
                    description = null;
                }
                if (lyrics === '') {
                    lyrics = null;
                }

                req.session.name_song = name_song.trim();
                req.session.lyrics = lyrics;
                req.session.description = description;
                req.session.id_album = id_album;
                req.session.id_type = id_type;
                req.session.feat = feat;
                console.log(name_song, id_album, lyrics, description, id_type, feat);
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
                const id_song = req.params.id || req.query.id;
                console.log("idsong", id_song);
                if (!id_song) {
                    return res.status(400).json({ message: "Not a valid song" })
                }
                const existingEntry = await Loves.findOne({ id_account: account.id, id_song: id_song });
                if (existingEntry) {
                    return res.status(400).json({ message: "Bài hát có trong yêu thích rồi" });
                }
                const newLove = await new Loves({
                    id_account: account.id,
                    id_song: id_song,
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
                id_song,
                name_song,
                description,
            } = req.body;
            console.log(name_song);
            const updatedSong = await Songs.findByIdAndUpdate(
                id_song,
                {
                    $set: {
                        name_song: name_song,
                        description: description,
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
                const id_album = req.body.id_album;
                const id_song = req.body.id_song;

                const song = await Songs.findByIdAndUpdate(
                    { _id: id_song },
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
            const id_album = req.params.id || req.query.id;
            const song = await Songs.find({ id_album: id_album });
            if (song.length === 0) {
                return res.status(404).json({
                    message: 'No songs found for this album',
                });
            }
            res.status(200).json(song);
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    getEmotions: async (req, res) => {
        try {
            const sentence = req.body.sentence;
            console.log(sentence);
            if (!sentence) {
                return res.status(501).json({ error: "Text is required" });
            }
            const response = await axios.get("http://127.0.0.1:8000/v1/get_emotions/", {
                params: { sentence },
            });

            const lable = response.data.result[0]?.label;
            const regex = new RegExp(lable, "i");
            console.log(lable);
            console.log(regex);
            const type = await Types.find({ name_type: { $regex: regex } }).lean();
            console.log(type[0].name_type);
            // const songResults = await Songs.aggregate([
            //     { $match: { id_type: type[0]._id } },


            //     {
            //         $lookup: {
            //             from: "listens",
            //             localField: "_id",
            //             foreignField: "id_song",
            //             as: "listen_info"
            //         }
            //     },

            //     { $unwind: "$listen_info" },


            //     { $sort: { "listen_info.listen_time": -1 } },


            //     {
            //         $project: {
            //             name_song: 1,
            //             listen_time: "$listen_info.listen_time",
            //             id_account: "$listen_info.id_account",
            //         }
            //     }
            // ]);
            // if (songResults.length === 0) {
            const songFinds = await Songs.find({ id_type: type[0]._id })
            return res.status(200).json(songFinds);
            // }
            // return res.status(200).json(songResults);

        } catch (e) {
            return res.status(500).json({ e: "failed to fetch predictions" });
        }
    },
    getEmotionsForAccount: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ err: "No refresh token provided" });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ err: "Invalid refresh token" });
                }
                const sentence = req.body.sentence;
                console.log(sentence);
                if (!sentence) {
                    return res.status(501).json({ error: "Text is required" });
                }
                const response = await axios.get("http://127.0.0.1:8000/v1/get_emotions/", {
                    params: { sentence },
                });

                const lable = response.data.result[0]?.label;
                const regex = new RegExp(lable, "i");
                console.log(lable);
                console.log(regex);
                const type = await Types.find({ name_type: { $regex: regex } }).lean();
                console.log(type[0].name_type);

                const songFinds = await Songs.find({ id_type: type[0]._id })

                const listenedSongs = await Listens.aggregate([
                    {
                        $match: {
                            id_account: mongoose.Types.ObjectId(account.id)
                        }
                    },
                    {
                        $lookup: {
                            from: 'songs',
                            localField: 'id_song',
                            foreignField: '_id',
                            as: 'song_info'
                        }
                    },
                    {
                        $unwind: '$song_info'
                    },
                    {
                        $project: {
                            _id: '$song_info._id',
                            name_song: '$song_info.name_song',
                            link: '$song_info.link',
                            image: '$song_info.image',
                            lyrics: '$song_info.lyrics',
                            description: '$song_info.description',
                            create_date: '$song_info.create_date',
                            id_accounts: '$song_info.id_accounts',
                            feat: '$song_info.feat',
                            id_album: '$song_info.id_album',
                            id_type: '$song_info.id_type'
                        }
                    }
                ]);
                const filteredSongs = listenedSongs.filter(song => song.id_type.toString() === type[0]._id.toString()).reverse();
                const collectionSongs = [...filteredSongs, ...songFinds];
                const finalSongs = Array.from(new Map(collectionSongs.map(song => [song._id.toString(), song])).values());
                return res.status(200).json(finalSongs);
            });
        } catch (e) {
            return res.status(500).json({ e: "failed to fetch predictions" });
        }
    },
    getSongsByIdAccount: async (req, res) => {
        try {
            const account_id = req.params.id || req.query.id;
            const songs = await Songs.find({ id_accounts: account_id });
            return res.json(songs);
        } catch (e) {
            return res.status(500).json({ e });
        }
    },
    getLovedSongsbyIdAccount: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ err: "No refresh token provided" });
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, account) => {
                if (err) {
                    return res.status(403).json({ err: "Invalid refresh token" });
                }
                const lovedSongs = await Loves.find({ id_account: account.id }).populate('id_song');
                const songs = lovedSongs.map(item => item.id_song);
                return res.status(200).json(songs);
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    }

}

module.exports = songController;