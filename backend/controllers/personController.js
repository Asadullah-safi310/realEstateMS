const { validationResult } = require('express-validator');
const { User, Property } = require('../models');
const { sequelize } = require('../config/db');

const createPerson = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { full_name, phone, email, national_id, address } = req.body;

    const existingPerson = await User.findOne({ where: { phone } });
    if (existingPerson) {
      return res.status(400).json({ error: 'User with this phone already exists' });
    }

    // Create User with default password '123456' and username from email or phone
    const username = email ? email.split('@')[0] : phone;
    const person = await User.create({
      username,
      full_name,
      phone,
      email,
      national_id,
      address,
      password_hash: '123456', // Default password
    });

    res.status(201).json(person);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPersons = async (req, res) => {
  try {
    const persons = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Property,
          as: 'Properties', // Assuming User.hasMany(Property) is aliased as Properties or default
          attributes: ['property_id', 'property_type', 'location'],
        },
      ],
    });

    res.json(persons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPersonById = async (req, res) => {
  try {
    const { id } = req.params;
    const person = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Property,
          as: 'Properties',
          attributes: ['property_id', 'property_type', 'location', 'city', 'sale_price', 'rent_price'],
        },
      ],
    });

    if (!person) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(person);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePerson = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { full_name, phone, email, national_id, address } = req.body;

    const person = await User.findByPk(id);
    if (!person) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (phone !== person.phone) {
      const existingPerson = await User.findOne({ where: { phone } });
      if (existingPerson) {
        return res.status(400).json({ error: 'User with this phone already exists' });
      }
    }

    await person.update({
      full_name,
      phone,
      email,
      national_id,
      address,
    });

    res.json(person);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePerson = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const person = await User.findByPk(id, { transaction });
    if (!person) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user owns properties
    const properties = await Property.findAll({
      where: { owner_id: id },
      transaction,
    });

    if (properties.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cannot delete user who owns properties. Transfer or delete properties first.' });
    }

    await person.destroy({ transaction });
    await transaction.commit();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  req.params.id = req.user.user_id;
  return getPersonById(req, res);
};

const updateProfile = async (req, res) => {
  req.params.id = req.user.user_id;
  return updatePerson(req, res);
};

module.exports = {
  createPerson,
  getPersons,
  getPersonById,
  updatePerson,
  deletePerson,
  getProfile,
  updateProfile,
};
