const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'real_estate_pms',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Clean up orphan records that cause FK constraint failures
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Cleanup remaining orphan records if any
      // ...
    } catch (cleanupError) {
      // Ignore errors if tables don't exist yet
      // console.log('Cleanup skipped:', cleanupError.message);
    } finally {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    await sequelize.sync({ alter: true });
    console.log('All models synchronized successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, initDB };
