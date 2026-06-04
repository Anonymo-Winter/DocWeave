import mongoose from "mongoose";

const connectDB = async (mongo_url) => {
    try {
        await mongoose.connect(mongo_url);
        console.log("⚡ Connected to MongoDB");
    } catch (error) {
        console.error("💀 Failed to connect to MongoDB: " + error.message);
    }
};

export default connectDB;
