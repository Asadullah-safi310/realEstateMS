const { User } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const userExists = await User.findOne({ 
      where: { 
        [Op.or]: [
          { phone }, //Checks if a user already has this phone number
          ...(email ? [{ email }] : []),    //... is the spread operator means, "Take everything inside this array and insert it here.”
          { username }  // Checks if a user already has this username in the whole user table
        ]
      } 
    });

    if (userExists) {
      if (userExists.phone === phone) {
        return res.status(400).json({ message: 'User with this phone number already exists' });
      }
      if (email && userExists.email === email) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      if (userExists.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    // create user or add new user into user table
    const user = await User.create({
      username,
      email,
      password_hash: password,
      full_name,
      phone,
    });

    if (user) {
      const token = generateToken(user.user_id);
      
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json({
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        token, // Optional: return token if client needs it for non-cookie auth
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }


  /* 
  Notes:
  [Op.or]: means ANY ONE of the following conditions can match
  If any condition is true → it means the user exists, and the database will return that user if any of 3 conditions match
  */
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const user = await User.findOne({ where: { phone } });

    if (user && (await user.validatePassword(password))) {
      const token = generateToken(user.user_id);

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.json({
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid phone number or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



/*
what is sequelize for?
We write JavaScript objects, Sequelize converts them into SQL queries, then MySQL2 sends those queries to the MySQL database so it can understand and execute them.
You → JavaScript
Sequelize → Translator (JS → SQL)
MySQL2 → Messenger or driver (sends SQL queries to the database)
MySQL → Listener & executor
No matter if you use ORM like Sequelize or raw SQL, you always need a driver/messenger to deliver queries from your code to the database. 
*/