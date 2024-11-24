const mongoose = require('mongoose');


const typeSchema = new mongoose.Schema({

    name_type: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        index: 'text'
    }
});

let Types = mongoose.model("Types", typeSchema);

module.exports = Types;