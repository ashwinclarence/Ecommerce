const mongoose=require('mongoose');
const { defaultMaxListeners } = require('nodemailer/lib/xoauth2');
const addressSchema = require('./addressSchema');

// defining the schema for user collection
const schema =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    address:{
        type:[addressSchema],
    },
    isBlocked:{
        type:Boolean,
        default:false
    }
})

module.exports= mongoose.model("user",schema);
