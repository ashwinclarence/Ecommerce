const mongoose =require("mongoose")
const dotenv = require('dotenv').config();


// mongodb connection using the connection string
mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then(()=>{
    console.log("Mongodb Connected")
}).catch((err)=>{
    console.log(`Mongodb connection error ${err}`)
})

module.exports = mongoose.connection;
