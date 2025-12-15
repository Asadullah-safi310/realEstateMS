const { validationResult } = require('express-validator');
const { Person, PersonPropertyRole, Property } = require('../models');
const { sequelize } = require('../config/db');

const createPerson = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { full_name, phone, email, national_id, address } = req.body;

    const existingPerson = await Person.findOne({ where: { phone } });
    if (existingPerson) {
      return res.status(400).json({ error: 'Person with this phone already exists' });
    }

    const person = await Person.create({
      full_name,
      phone,
      email,
      national_id,
      address,
    });

    res.status(201).json(person);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPersons = async (req, res) => {
  try {
    const persons = await Person.findAll({
      include: [
        {
          model: PersonPropertyRole,
          as: 'PersonPropertyRoles',
          include: [
            { model: Property, as: 'Property', attributes: ['property_id', 'property_type', 'location'] },
          ],
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
    const person = await Person.findByPk(id, {
      include: [
        {
          model: PersonPropertyRole,
          as: 'PersonPropertyRoles',
          include: [
            { model: Property, as: 'Property', attributes: ['property_id', 'property_type', 'location', 'city', 'sale_price', 'rent_price'] },
          ],
        },
      ],
    });

    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
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

    const person = await Person.findByPk(id);
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    if (phone !== person.phone) {
      const existingPerson = await Person.findOne({ where: { phone } });
      if (existingPerson) {
        return res.status(400).json({ error: 'Person with this phone already exists' });
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

    const person = await Person.findByPk(id, { transaction });
    if (!person) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Person not found' });
    }

    const roles = await PersonPropertyRole.findAll({
      where: { person_id: id },
      transaction,
    });

    if (roles.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cannot delete person with property roles. Remove roles first.' });
    }

    await person.destroy({ transaction });
    await transaction.commit();

    res.json({ message: 'Person deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPerson,
  getPersons,
  getPersonById,
  updatePerson,
  deletePerson,
};
