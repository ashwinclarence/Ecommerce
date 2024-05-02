const mongoose=require('mongoose')


const schema=new mongoose.Schema({
    categoryName:{
        type:String,
        require:true,
    },
    categoryDescription:{
        type:String,
        require:true
    },
    categoryAddedOn:{
        type:Date,
        require:true
    },
    parentCategory:{
        type:Boolean,
        require:true
    }
})

module.exports=mongoose.model("category",schema)