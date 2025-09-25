const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Admin user creation script
async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@mediconnect.lk' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@mediconnect.lk');
      console.log('You can login with existing credentials');
      process.exit(0);
    }

    // Create admin user
    const adminPassword = 'Admin@123456'; // Strong default password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = new User({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@mediconnect.lk',
      password: hashedPassword,
      phone: '+94771234567',
      role: 'admin',
      isVerified: true,
      isActive: true,
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        language: 'en',
        timezone: 'Asia/Colombo'
      }
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@mediconnect.lk');
    console.log('🔐 Password: Admin@123456');
    console.log('⚠️  Please change the password after first login!');
    console.log('');
    console.log('You can now login to the admin dashboard with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
createAdminUser();