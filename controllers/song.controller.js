const Songs = require("../models/Songs.model");
const jwt = require("jsonwebtoken");
const Loves = require("../models/Loves.model");
const { uploadSong, uploadIMG } = require("../driveApi.js");
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const songController = {
    getAllSongs: async (req, res) => {
        try {
            let songs = await Songs.find();
            res.status(200).json(songs);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    getSongById: async (req, res) => {
        try {
            let songs = await Songs.findById(req.params.id);
            if (!songs) res.status(404).json("Song not found");
            const songLink = songs.link;
            const songIMG = songs.img;
            try {
                const response = await axios.get(songLink, {
                    responseType: 'stream',
                });
                res.setHeader('Content-Type', response.headers['content-type']);
                res.setHeader('Content-Disposition', response.headers['content-disposition']);

                response.data.pipe(res);
            } catch (e) { res.status(500).json('Unable to fetch the file.'); }
        }
        catch (err) {
            res.status(500).json(err);
        }
    },
    deleteSong: async (req, res) => {
        try {
            await Songs.findByIdAndDelete(req.params.id);
            res.status(200).json("Songs deleted");
        } catch (err) {
            res.status(500).json(err);
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
                //console.log('req.files', req)
                const filePath = req.files.filePath;

                const imgPath = req.files.imgPath;
                //console.log(filePath, imgPath);
                const name_song = "APT";
                const id_type = "67337be1ecde5f35a98ea27c";
                // const { name_song, lyrics, description, id_type } = req.body;
                let artist = account.id;
                let id_account = [artist];
                // if (accountIds !== null) {
                //     id_account = id_account.concat(accountIds);
                // }
                const driveLink = await uploadSong(filePath, name_song);
                //console.log('Drive link:', driveLink);
                if (!driveLink) {
                    return res.status(500).json({ error: "Không thể upload file lên Google Drive." });
                }

                const driveLinkIMG = await uploadIMG(imgPath, name_song);
                console.log("artist", id_account);
                if (!driveLinkIMG) {
                    return res.status(500).json({ error: "Không thể upload ảnh lên Google Drive." });
                }
                const newSong = await new Songs({
                    name_song: name_song,
                    link: driveLink,
                    lyrics: null,
                    image: driveLinkIMG,
                    description: null,
                    create_date: new Date(),
                    id_accounts: id_account,
                    id_album: null,
                    id_type: id_type
                });
                const song = await newSong.save();
                res.status(200).json(song);
            }
            );
        } catch (err) {
            console.error("Lỗi khi thêm bài hát:", err);
            res.status(500).json({ err: "Lỗi server." });
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
                res.status(200).json(love);
            }
            );
        }
        catch (err) {
            res.status(500).json(err);
        }
    },
    removeSongFromLove: async (req, res) => {
        try {
            await Loves.findOneAndDelete({ id_song: req.params.id_song });
            res.status(200).json("Songs removed successfully");
        }
        catch (err) {
            res.status(500).json(err);

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

            res.status(200).json({ message: "Song updated successfully", data: updatedSong });
        } catch (err) {
            res.status(500).json(err);
        }
    }


}

module.exports = songController;