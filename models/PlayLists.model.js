const mongoose = require('mongoose');


const playlistSchema = new mongoose.Schema({
    name_playlist: {
        type: String,
        required: true,

    },
    id_account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Accounts",
        required: true
    },

});

let PlayLists = mongoose.model("PlayLists", playlistSchema);

module.exports = PlayLists;