const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function fixAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect');
    console.log('Connected to database');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@mediconnect.lk' });
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    console.log('Admin user found, fixing password...');

    // New password
    const newPassword = 'Admin@123456';
    
    // Generate proper bcrypt hash with higher salt rounds
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('New password hash generated:', hashedPassword.substring(0, 20) + '...');
    console.log('Hash starts with $2a$ or $2b$:', hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$'));
    
    // Test the hash before saving
    const testVerification = await bcrypt.compare(newPassword, hashedPassword);
    console.log('Pre-save verification test:', testVerification ? '✅ PASS' : '❌ FAIL');
    
    if (!testVerification) {
      console.log('❌ Hash verification failed before saving. Aborting.');
      process.exit(1);
    }

    // Update admin password using direct MongoDB update
    const result = await User.updateOne(
      { email: 'admin@mediconnect.lk' },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );

    console.log('Update result:', result);

    if (result.modifiedCount === 1) {
      console.log('✅ Admin password updated successfully!');
      
      // Verify the update
      const updatedAdmin = await User.findOne({ email: 'admin@mediconnect.lk' });
      const finalVerification = await bcrypt.compare(newPassword, updatedAdmin.password);
      
      console.log('\n📧 Email: admin@mediconnect.lk');
      console.log('🔐 Password: Admin@123456');
      console.log('\nVerification:');
      console.log('Password hash length:', updatedAdmin.password.length);
      console.log('Password starts with $2a$ or $2b$:', updatedAdmin.password.startsWith('$2a$') || updatedAdmin.password.startsWith('$2b$'));
      console.log('Final verification test:', finalVerification ? '✅ PASS' : '❌ FAIL');
      
      if (finalVerification) {
        console.log('\n🎉 Admin login is now ready!');
        console.log('You can login at /login with the above credentials.');
      } else {
        console.log('\n❌ Final verification failed. Please try again.');
      }
    } else {
      console.log('❌ Failed to update admin password');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
    process.exit(0);
  }
}

fixAdminPassword();