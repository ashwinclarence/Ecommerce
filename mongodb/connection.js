const mongoose =require("mongoose")

// mongodb connection using the connection string
mongoose.connect('mongodb://localhost:27017/cleatcraft').then(()=>{
    console.log("Mongodb Connected")
}).catch((err)=>{
    console.log(`Mongodb connection error ${err}`)
})



module.exports =collectionModel;