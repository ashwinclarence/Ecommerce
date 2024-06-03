const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    couponCode: {
        type: String,
    },
    discount: {
        type: Number,
    },
    expiryDate: {
        type: Date,
    },
    minAmount: {
        type: Number,
       
    },
    maxAmount: {
        type: Number,
     
    },
});

 module.exports= mongoose.model("coupon", schema);