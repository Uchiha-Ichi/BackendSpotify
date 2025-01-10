const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    name_album: {
        type: String,
        required: true,
    },
    create_date: {
        type: String,
        required: true,
    },
    id_account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Accounts",
        required: true
    }
});

let Albums = mongoose.model("Albums", albumSchema);

module.exports = Albums;