const mongoose = require('mongoose');

const connectDB = async () => {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task7db';
    
    // Connection event listeners
    mongoose.connection.on('connecting', () => {
        console.log('Connecting to MongoDB...');
    });

    mongoose.connection.on('connected', () => {
        console.log('Successfully connected to MongoDB.');
    });

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB connection lost.');
    });

    try {
        await mongoose.connect(dbUri);
    } catch (error) {
        console.error('Failed to establish initial MongoDB connection:', error.message);
    }
};

module.exports = {
    mongoose,
    connectDB
};
