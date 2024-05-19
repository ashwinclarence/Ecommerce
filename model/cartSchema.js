const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
    productCount: {
        type: Number,
    },
    productPrice: {
        type: Number,
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    items: [itemSchema],
});

module.exports = mongoose.model('cart', cartSchema);


