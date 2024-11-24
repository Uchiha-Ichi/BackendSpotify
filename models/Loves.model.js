const mongoose = require('mongoose');


const loveSchema = new mongoose.Schema({
    id_song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Songs",
        required: true
    },
    id_account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Accounts",
        required: true
    },
    love_time: {
        type: Date,
        required: true
    }
});

let Loves = mongoose.model("Loves", loveSchema);

module.exports = Loves;