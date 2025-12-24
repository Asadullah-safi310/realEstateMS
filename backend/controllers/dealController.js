const { validationResult } = require('express-validator');
const { Deal, Property, User, PropertyHistory } = require('../models');
const { sequelize } = require('../config/db');

const createDeal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const transaction = await sequelize.transaction();

  try {
    const { deal_type, property_id, owner_id, buyer_id, tenant_id, price, start_date, notes } = req.body;

    const property = await Property.findByPk(property_id, { transaction });
    if (!property) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Property not found' });
    }

    const owner = await User.findByPk(owner_id, { transaction });
    if (!owner) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Owner not found' });
    }

    if (deal_type === 'SALE') {
      if (!Boolean(property.is_available_for_sale)) {
        await transaction.rollback();
        return res.status(400).json({ error: 'This property is not available for sale' });
      }
      if (!buyer_id) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Buyer ID is required for SALE deal' });
      }

      const buyer = await User.findByPk(buyer_id, { transaction });
      if (!buyer) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Buyer not found' });
      }

      const deal = await Deal.create({
        property_id,
        deal_type: 'SALE',
        owner_id,
        buyer_id,
        tenant_id: tenant_id || null,
        price,
        notes,
        status: 'COMPLETED',
        deal_completed_at: new Date(),
      }, { transaction });

      // Create History
      await PropertyHistory.create({
        property_id,
        previous_owner_id: owner_id,
        new_owner_id: buyer_id,
        change_type: 'TRANSFERRED_SALE',
        change_date: new Date(),
        details: { price, notes },
      }, { transaction });

      // Update Property Owner and Status
      await Property.update(
        { 
          owner_id: buyer_id,
          status: 'sold', 
          is_available_for_sale: false 
        },
        { where: { property_id }, transaction }
      );

    } else if (deal_type === 'RENT') {
      if (!Boolean(property.is_available_for_rent)) {
        await transaction.rollback();
        return res.status(400).json({ error: 'This property is not available for rent' });
      }
      if (!buyer_id) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Tenant ID is required for RENT deal' });
      }

      if (!start_date) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Start date is required for RENT deal' });
      }

      const tenant = await User.findByPk(buyer_id, { transaction });
      if (!tenant) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const deal = await Deal.create({
        property_id,
        deal_type: 'RENT',
        owner_id,
        buyer_id, // Tenant is stored in buyer_id for RENT deals in this logic or tenant_id?
        tenant_id: buyer_id,
        price,
        start_date,
        notes,
        status: 'COMPLETED',
        deal_completed_at: new Date(),
      }, { transaction });

      // Create History
      await PropertyHistory.create({
        property_id,
        previous_owner_id: owner_id, // Owner doesn't change
        new_owner_id: owner_id,
        change_type: 'RENTED',
        change_date: new Date(),
        details: { tenant_id: buyer_id, price, notes },
      }, { transaction });

      // Update Property Status
      await Property.update(
        { status: 'rented', is_available_for_rent: false },
        { where: { property_id }, transaction }
      );

    } else {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid deal type. Must be SALE or RENT' });
    }

    await transaction.commit();
    
    const finalProperty = await Property.findByPk(property_id);
    
    res.status(201).json({ 
      message: `${deal_type} deal created successfully and property updated`,
      property: finalProperty
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

const getDeals = async (req, res) => {
  try {
    const deals = await Deal.findAll({
      include: [
        { model: Property, as: 'Property', attributes: ['property_id', 'property_type', 'location', 'city', 'sale_price', 'rent_price'] },
        { model: User, as: 'Owner', attributes: ['user_id', 'full_name', 'phone'] },
        { model: User, as: 'Buyer', attributes: ['user_id', 'full_name', 'phone'] },
        { model: User, as: 'Tenant', attributes: ['user_id', 'full_name', 'phone'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    const deal = await Deal.findByPk(id, {
      include: [
        { model: Property, as: 'Property', attributes: ['property_id', 'property_type', 'location', 'city', 'sale_price', 'rent_price', 'status'] },
        { model: User, as: 'Owner', attributes: ['user_id', 'full_name', 'phone', 'email'] },
        { model: User, as: 'Buyer', attributes: ['user_id', 'full_name', 'phone', 'email'] },
        { model: User, as: 'Tenant', attributes: ['user_id', 'full_name', 'phone', 'email'] },
      ],
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDealsByUser = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { Op } = require('sequelize');

    const deals = await Deal.findAll({
      where: {
        [Op.or]: [
          { owner_id: userId },
          { buyer_id: userId },
          { tenant_id: userId }
        ]
      },
      include: [
        { model: Property, as: 'Property', attributes: ['property_id', 'property_type', 'location', 'city', 'sale_price', 'rent_price'] },
        { model: User, as: 'Owner', attributes: ['user_id', 'full_name', 'phone'] },
        { model: User, as: 'Buyer', attributes: ['user_id', 'full_name', 'phone'] },
        { model: User, as: 'Tenant', attributes: ['user_id', 'full_name', 'phone'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createDeal, getDeals, getDealById, getDealsByUser };
