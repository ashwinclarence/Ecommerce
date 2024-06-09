const mongoose = require('mongoose');
const addressSchema = require('./addressSchema');

// defining the schema for user collection
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    address: {
        type: [addressSchema],
        default: []
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    googleID: {
        type: String
    },
    wallet: {
        type: Number,
        default: 0,
    }
}, { timestamps: true })

module.exports = mongoose.model("user", schema);
