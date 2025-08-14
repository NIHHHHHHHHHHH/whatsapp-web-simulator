
// DATABASE CONNECTION - config/database.js

const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB database
 * Uses environment variables for configuration
 */
async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DATABASE_NAME,
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });
        
        console.log('Database connected successfully');
        console.log(`Database: ${process.env.DATABASE_NAME}`);
        
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

// Database event handlers
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.error('Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown handler
process.on('SIGINT', async () => {
    console.log('\n Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
});

module.exports = { connectDatabase };












