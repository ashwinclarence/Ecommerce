const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    offerFor: {
        type: String,
        required: true,
        enum: ["PRODUCT", "CATEGORY", "REFERRAL"]
    },
    //   offerType: {
    //     type: String,
    //     required: true,
    //     enum: ['FLAT', 'PERCENTAGE']
    //   },
    offerCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
    },
    offerProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
    },
    offerValue: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("offer", schema);
