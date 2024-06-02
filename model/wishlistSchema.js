const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userID: { type: String },

    products: [{
        productID: { type: mongoose.Schema.Types.ObjectId },
    }, { _id: false }] 
    
}, { timestamps: true });

module.exports = mongoose.model('wishlist', schema);
