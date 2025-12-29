const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/nms_db")
        console.log("MongoDB Connected!");
    } catch (error) {
        console.error("MongoDB connection faild", error.message);
        process.exit(1)
    };
}

module.exports = connectDB;