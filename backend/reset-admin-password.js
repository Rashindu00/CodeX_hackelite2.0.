const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect');
    console.log('Connected to database');

    // Find admin user
    const adminUser = await User.findOne({ 
      email: 'admin@mediconnect.lk',
      role: 'admin'
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('Admin user found, resetting password...');

    // Generate new password hash
    const newPassword = 'Admin@123456';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    console.log('New password hash generated:', hashedPassword.substring(0, 20) + '...');
    console.log('Hash starts with $2b$:', hashedPassword.startsWith('$2b$'));

    // Update password
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log('✅ Admin password reset successfully!');
    console.log('📧 Email: admin@mediconnect.lk');
    console.log('🔐 Password: Admin@123456');
    console.log('');
    console.log('You can now login with these credentials.');

    // Verify the update
    const updatedAdmin = await User.findById(adminUser._id);
    console.log('');
    console.log('Verification:');
    console.log('Password hash length:', updatedAdmin.password.length);
    console.log('Password starts with $2b$:', updatedAdmin.password.startsWith('$2b$'));

    // Test password comparison
    const isMatch = await bcrypt.compare('Admin@123456', updatedAdmin.password);
    console.log('Password verification test:', isMatch ? '✅ PASS' : '❌ FAIL');

  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the script
resetAdminPassword();