require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/habit-buddy';

console.log('--- MONGODB CONNECTION TEST ---');
console.log(`Attempting to connect to: ${MONGODB_URI.split('@').pop()}`); // Log URI without credentials

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ SUCCESS: Connected to MongoDB successfully!');
        console.log('Database Name:', mongoose.connection.name);
        console.log('Host:', mongoose.connection.host);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ ERROR: Could not connect to MongoDB.');
        console.error('Error Details:', err.message);
        console.log('\n--- Troubleshooting Tips ---');
        console.log('1. Check if your MongoDB instance is running.');
        console.log('2. Verify the MONGODB_URI in your server/.env file.');
        console.log('3. If using MongoDB Atlas, ensure your IP address is whitelisted in "Network Access".');
        console.log('4. Ensure your username and password in the connection string are correct.');
        process.exit(1);
    });
