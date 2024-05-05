const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    productDescription: {
        type: String,
        required: true,
    },
    productQuantity: {
        type: Number,
        required: true
    },
    productCategory: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'category' 
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});
