const mongoose = require("mongoose");
const dotenv = require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000, 
        });
        console.log("Mongodb Connected");
    } catch (err) {
        console.error(`Mongodb connection error ${err}`);
    }
};

module.exports = connectDB;
