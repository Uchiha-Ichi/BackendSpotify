const mongoose = require('mongoose');


const playlist_songSchema = new mongoose.Schema({
    id_song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Songs",
        required: true
    },
    id_playlist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PlayLists",
        required: true
    }
});

let PlayList_Songs = mongoose.model("PlayList_Song", playlist_songSchema);

module.exports = PlayList_Songs;


