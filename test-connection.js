require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/habit-buddy';

async function testConnection() {
    console.log('--- DB Connection Diagnostics ---');
    console.log('URI Prefix:', MONGODB_URI.substring(0, 15));

    try {
        console.log('Attempting to connect with 10s timeout...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('✅ Connection Successful!');
        console.log('ReadyState:', mongoose.connection.readyState);
        console.log('DB Name:', mongoose.connection.name);
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed!');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        process.exit(1);
    }
}

testConnection();
