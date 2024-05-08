const mongoose=require('mongoose')

const schema=new mongoose.Schema({
    username:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    phone:{
        type:Number
    },
    otp:{
        type:Number,
    },
    loggedIn:{
        type:Date,
        default:Date.now()
    }
})

module.exports=mongoose.model('login',schema)