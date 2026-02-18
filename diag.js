console.log('Starting diagnostic...');
try {
    require('dotenv').config();
    console.log('dotenv ok');
    require('express');
    console.log('express ok');
    require('mongoose');
    console.log('mongoose ok');
    require('cors');
    console.log('cors ok');
    require('nodemailer');
    console.log('nodemailer ok');
    require('jsonwebtoken');
    console.log('jsonwebtoken ok');
    require('google-auth-library');
    console.log('google-auth-library ok');
    require('bcryptjs');
    console.log('bcryptjs ok');
    console.log('All modules required successfully');
} catch (err) {
    console.error('DIAGNOSTIC FAILED');
    console.error(err);
    process.exit(1);
}
