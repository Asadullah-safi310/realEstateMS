const { Sequelize } = require('sequelize');
const { User } = require('./models');

const sequelize = new Sequelize(
  'real_estate_pms',
  'root',
  'Mysql@4405',
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

// Override the sequelize instance in the model if needed, but since we are importing models/index.js 
// which initializes with config, we might need to bypass that or ensure environment variables are set.
// A better way is to set process.env before requiring models

process.env.DB_NAME = 'real_estate_pms';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'Mysql@4405';
process.env.DB_HOST = 'localhost';

async function checkUser() {
  try {
    // Re-require to pick up env vars if the module logic allows, 
    // but standard models/index.js often reads config/db.js which uses dotenv.
    // Let's just try to query directly using the sequelize instance we just made 
    // IF the models are attached to it. But they are attached to the instance in config/db.js.
    
    // Instead of hacking the models, I'll just use a raw query to get a user email.
    
    await sequelize.authenticate();
    const [results] = await sequelize.query("SELECT email FROM users LIMIT 1");
    
    if (results.length > 0) {
        console.log(`Found user: ${results[0].email}`);
    } else {
        console.log('No user found');
    }
  } catch (err) {
      console.error(err);
  } finally {
      await sequelize.close();
  }
}

checkUser();
