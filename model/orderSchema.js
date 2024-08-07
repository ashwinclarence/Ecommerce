const mongoose = require("mongoose");

// ['Pending', 'Shipped', 'Delivered', 'Returned'] 
const schema = new mongoose.Schema({
    userID: { type: String },
    products: [{
        productID: { 
            type: mongoose.Schema.Types.ObjectId ,
            ref:"product"
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
        discount: { 
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
        type:Number,
        default:0
    },
    couponID:{
        type:String,
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
    }, 
    deliveryDate:{
        type:Date,
    },
    orderStatus: { 
        type: String, 
        enum:['Pending','Confirmed','Shipping', 'Delivered','Pending-Returned', 'Returned', 'Cancelled']
    },
    reasonForCancel: {
        type:String
    },
    reasonForRejection: {
        type:String
    }
},{timestamps:true})


module.exports = mongoose.model("Order", schema);
