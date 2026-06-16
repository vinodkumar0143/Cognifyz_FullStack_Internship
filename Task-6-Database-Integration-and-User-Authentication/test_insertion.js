const mongoose = require('./db');
const User = require('./models/User');

async function runTest() {
    try {
        // Clear any prior test entries to avoid duplicate key errors
        await User.deleteOne({ email: "vinod@gmail.com" });
        
        console.log("Saving test user...");
        const user = new User({
            name: "Vinod",
            email: "vinod@gmail.com",
            age: 22
        });

        await user.save();
        console.log("Database Insertion Successful:", user);

        console.log("Retrieving test user...");
        const retrieved = await User.findOne({ email: "vinod@gmail.com" });
        console.log("Database Retrieval Successful:", retrieved);
        
        await mongoose.disconnect();
        console.log("MongoDB Disconnected.");
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}

runTest();
