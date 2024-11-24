const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    account_name: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    create_date: {
        type: Date,
        required: true,
    },
    admin: {
        type: Boolean,
        required: true,
    }
});

let Accounts = mongoose.model("Accounts", accountSchema);

module.exports = { Accounts };