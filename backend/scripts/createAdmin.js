const { sequelize } = require('../config/db');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const adminEmail = 'admin@realestate.com';
    const adminPassword = 'admin123';
    const adminUsername = 'admin';

    // Check if admin exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      // Update to ensure role is admin
      existingAdmin.role = 'admin';
      // Reset password if needed (optional, but good for "what is my password" requests)
      existingAdmin.password_hash = adminPassword; // Hook will hash this
      await existingAdmin.save();
      console.log(`Admin user updated. Email: ${adminEmail}, Password: ${adminPassword}`);
    } else {
      await User.create({
        username: adminUsername,
        email: adminEmail,
        password_hash: adminPassword, // Hook will hash this
        full_name: 'System Administrator',
        phone: '0000000000',
        role: 'admin',
        is_active: true
      });
      console.log(`Admin user created. Email: ${adminEmail}, Password: ${adminPassword}`);
    }

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await sequelize.close();
  }
};

createAdmin();
