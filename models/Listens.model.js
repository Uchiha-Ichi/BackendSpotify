const mongoose = require('mongoose');

const listenSchema = new mongoose.Schema({
    id_account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Accounts",
        required: true
    },
    id_song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Songs",
        required: true
    },
    listen_time: {
        type: Date,
        required: true
    }
});

let Listens = mongoose.model("Listens", listenSchema);

module.exports = Listens;