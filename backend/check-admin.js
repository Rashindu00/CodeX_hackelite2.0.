const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdminUser() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect_ai';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to database');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@mediconnect.lk' });
    
    if (!adminUser) {
      console.log('Admin user not found');
    } else {
      console.log('Admin user found:');
      console.log('ID:', adminUser._id);
      console.log('Email:', adminUser.email);
      console.log('Full Name:', adminUser.fullName);
      console.log('Role:', adminUser.role);
      console.log('Password Hash:', adminUser.password ? 'Present' : 'Missing');
      console.log('Password Length:', adminUser.password ? adminUser.password.length : 0);
      console.log('Password starts with $2b$:', adminUser.password ? adminUser.password.startsWith('$2b$') : false);
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdminUser();