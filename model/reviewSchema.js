const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
    },
    rating:{
        type:Number,
        default:0
    },
    reviews: [
        {
            userID: {
                type: mongoose.Schema.Types.ObjectId,
                ref:"user"
            },
            description: {
                type: String
            },
            star: {
                type: Number,
                enum: [1, 2, 3, 4, 5]
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('review', schema);
