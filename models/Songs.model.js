const mongoose = require('mongoose');


const songSchema = new mongoose.Schema({

    name_song: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        required: true,
        unique: true,
    },
    lyrics: {
        type: String,
        index: 'text'
    },
    description: {
        type: String,
        index: 'text'
    },
    create_date: {
        type: String,
        required: true,
    },
    id_accounts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Accounts",
        required: true
    },
    feat: [{
        type: String,

    }],
    id_album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Albums"
    },
    id_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Types"
    },
});

let Songs = mongoose.model("Songs", songSchema);

module.exports = Songs;