const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
    },
    oneStar:{
        type:Number,
        default:0
    },
    twoStar:{
        type:Number,
        default:0
    },
    threeStar:{
        type:Number,
        default:0
    },
    fourStar:{
        type:Number,
        default:0
    },
    FiveStar:{
        type:Number,
        default:0
    },
    reviews:[
        {
            userID:{
                type:String
            },
            description:{
                type:String
            },
            star:{
                type:Number,
                enum:[1,2,3,4,5]
            }
        }
    ]
})


module.exports=mongoose.model('review',schema)