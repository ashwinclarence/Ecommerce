const mongoose = require("mongoose");

// ['Pending', 'Shipped', 'Delivered', 'Returned'] 
const schema = new mongoose.Schema({
    userID: { type: String },
    products: [{
        productID: { 
            type: mongoose.Schema.Types.ObjectId 
        },
        productName: { 
            type: String 
        },
        brand: { 
            type: String 
        },
        quantity: { 
            type: Number 
        },
        price: { 
            type: Number 
        },
        productStatus: { 
            type: String, 
            enum:['Confirmed', 'Pending', 'Delivered', 'Returned', 'Cancelled']
        },
        discountPrice: { 
            type: Number 
        },
        productImage: { 
            type: String 
        }
    }],
    totalQuantity: { 
        type: Number 
    },
    totalPrice: { 
        type: Number 
    },
    address: {
        contactName: String,
        pincode: String,
        homeAddress: String,
        areaAddress: String,
        landmark: String
    },
    couponDiscount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'coupon',
        default:null
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: [ 'Cash on delivery','Razor pay', 'Wallet']
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    paymentId: {
        type: String,
        required: false
    }
},{timestamps:true})


module.exports = mongoose.model("Order", schema);
