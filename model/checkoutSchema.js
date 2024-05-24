const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userID: { type: String },
    products: [{
        productID: { type: mongoose.Schema.Types.ObjectId },
        productName: { type: String },
        brand: { type: String },
        quantity: { type: Number },
        price: { type: Number },
        productStatus: { type: String },
        discountPrice: { type: Number }
    }],
    totalQuantity: { type: Number },
    totalPrice: { type: Number },
    address: {
        contactName: String,
        pincode: String,
        homeAddress: String,
        areaAddress: String,
        landmark: String
    },
    paymentMethod: {
        type: String
    },
    orderDate: {
        type: Date
    }
})


module.exports = mongoose.model("Order", schema);

