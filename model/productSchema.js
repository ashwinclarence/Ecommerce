const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productBrand: {
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
    // productCategory: {
    //    type: mongoose.Schema.Types.ObjectId,
    //    ref: 'category'  
    // },
    productCategory: {
        type: String,
        required: true,
    },

    productImage: {
        type: [],
        required:true
    },
    // productRatings:,
    productDiscount:{
        type:Number,
    },
    addedOn: {
        type: Date,
        default: Date.now,
    },
    updatedOn: {
        type: Date,
        default: Date.now,
    },
    isActive:{
        type:Boolean,
        default:true,
    }
});


module.exports = mongoose.model('product', schema)
