const { validationResult } = require('express-validator');
const { Deal, Property, Client } = require('../models');
const { sequelize } = require('../config/db');

const createDeal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const transaction = await sequelize.transaction();

  try {
    const { property_id, client_id, final_price, deal_type } = req.body;

    await Deal.create({
      property_id,
      client_id,
      final_price,
      deal_type,
      status: 'completed',
    }, { transaction });

    const status = deal_type === 'rent' ? 'rented' : 'sold';
    await Property.update(
      { status },
      { where: { property_id }, transaction }
    );

    await transaction.commit();
    res.status(201).json({ message: 'Deal created successfully and property status updated' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

const getDeals = async (req, res) => {
  try {
    const deals = await Deal.findAll({
      include: [
        { model: Property, as: 'Property', attributes: ['property_type', 'location'] },
        { model: Client, as: 'Client', attributes: ['client_name'] },
      ],
    });

    const formattedDeals = deals.map(deal => ({
      deal_id: deal.deal_id,
      property_id: deal.property_id,
      client_id: deal.client_id,
      final_price: deal.final_price,
      deal_type: deal.deal_type,
      status: deal.status,
      date: deal.created_at,
      property_type: deal.Property?.property_type,
      location: deal.Property?.location,
      client_name: deal.Client?.client_name,
    }));

    res.json(formattedDeals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    const deal = await Deal.findByPk(id, {
      include: [
        { model: Property, as: 'Property', attributes: ['property_type', 'location'] },
        { model: Client, as: 'Client', attributes: ['client_name'] },
      ],
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const formattedDeal = {
      deal_id: deal.deal_id,
      property_id: deal.property_id,
      client_id: deal.client_id,
      final_price: deal.final_price,
      deal_type: deal.deal_type,
      status: deal.status,
      date: deal.created_at,
      property_type: deal.Property?.property_type,
      location: deal.Property?.location,
      client_name: deal.Client?.client_name,
    };

    res.json(formattedDeal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createDeal, getDeals, getDealById };
