const { validationResult } = require('express-validator');
const { Deal, Property, Person, PersonPropertyRole } = require('../models');
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

    const owner = await Person.findByPk(owner_id, { transaction });
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

      const buyer = await Person.findByPk(buyer_id, { transaction });
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
        status: 'completed',
      }, { transaction });

      const currentOwnerRole = await PersonPropertyRole.findOne({
        where: { property_id, role: 'OWNER', end_date: null },
        transaction,
      });

      if (currentOwnerRole) {
        await currentOwnerRole.update({ end_date: new Date() }, { transaction });
      }

      await PersonPropertyRole.create({
        person_id: buyer_id,
        property_id,
        role: 'OWNER',
        start_date: new Date(),
      }, { transaction });

      const currentTenantRole = await PersonPropertyRole.findOne({
        where: { property_id, role: 'TENANT', end_date: null },
        transaction,
      });

      if (currentTenantRole && tenant_id && currentTenantRole.person_id !== tenant_id) {
        await currentTenantRole.update({ end_date: new Date() }, { transaction });
      }

      console.log('Before SALE Property.update - Property ID:', property_id);
      console.log('Before SALE - Current property:', {
        property_id: property.property_id,
        is_available_for_sale: property.is_available_for_sale,
        status: property.status
      });
      
      const saleUpdateResult = await Property.update(
        { status: 'sold', is_available_for_sale: 0 },
        { where: { property_id }, transaction }
      );
      console.log('SALE Property.update result:', saleUpdateResult);
      
      const updatedProperty = await Property.findByPk(property_id, { transaction });
      console.log('After SALE update - Property data:', {
        property_id: updatedProperty.property_id,
        is_available_for_sale: updatedProperty.is_available_for_sale,
        status: updatedProperty.status
      });
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

      const tenant = await Person.findByPk(buyer_id, { transaction });
      if (!tenant) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Tenant not found' });
      }

      const deal = await Deal.create({
        property_id,
        deal_type: 'RENT',
        owner_id,
        buyer_id,
        tenant_id: buyer_id,
        price,
        start_date,
        notes,
        status: 'completed',
      }, { transaction });

      const currentTenantRole = await PersonPropertyRole.findOne({
        where: { property_id, role: 'TENANT', end_date: null },
        transaction,
      });

      if (currentTenantRole) {
        await currentTenantRole.update({ end_date: new Date() }, { transaction });
      }

      await PersonPropertyRole.create({
        person_id: buyer_id,
        property_id,
        role: 'TENANT',
        start_date: new Date(),
      }, { transaction });

      console.log('Before RENT Property.update - Property ID:', property_id);
      console.log('Before RENT - Current property:', {
        property_id: property.property_id,
        is_available_for_rent: property.is_available_for_rent,
        status: property.status
      });
      
      const rentUpdateResult = await Property.update(
        { status: 'rented', is_available_for_rent: 0 },
        { where: { property_id }, transaction }
      );
      console.log('RENT Property.update result:', rentUpdateResult);
      
      const updatedProperty = await Property.findByPk(property_id, { transaction });
      console.log('After RENT update - Property data:', {
        property_id: updatedProperty.property_id,
        is_available_for_rent: updatedProperty.is_available_for_rent,
        status: updatedProperty.status
      });
    } else {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid deal type. Must be SALE or RENT' });
    }

    await transaction.commit();
    console.log('Transaction committed successfully');
    
    const finalProperty = await Property.findByPk(property_id);
    console.log('Final property state:', {
      property_id: finalProperty.property_id,
      is_available_for_sale: finalProperty.is_available_for_sale,
      is_available_for_rent: finalProperty.is_available_for_rent,
      status: finalProperty.status
    });
    
    res.status(201).json({ 
      message: `${deal_type} deal created successfully and property updated`,
      property: {
        property_id: finalProperty.property_id,
        is_available_for_sale: Boolean(finalProperty.is_available_for_sale),
        is_available_for_rent: Boolean(finalProperty.is_available_for_rent),
        status: finalProperty.status
      }
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
        { model: Property, as: 'DealProperty', attributes: ['property_id', 'property_type', 'location', 'city', 'sale_price', 'rent_price'] },
        { model: Person, as: 'Owner', attributes: ['person_id', 'full_name', 'phone'] },
        { model: Person, as: 'Buyer', attributes: ['person_id', 'full_name', 'phone'] },
        { model: Person, as: 'Tenant', attributes: ['person_id', 'full_name', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
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
        { model: Property, as: 'DealProperty', attributes: ['property_id', 'property_type', 'location', 'city', 'sale_price', 'rent_price', 'status'] },
        { model: Person, as: 'Owner', attributes: ['person_id', 'full_name', 'phone', 'email'] },
        { model: Person, as: 'Buyer', attributes: ['person_id', 'full_name', 'phone', 'email'] },
        { model: Person, as: 'Tenant', attributes: ['person_id', 'full_name', 'phone', 'email'] },
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

module.exports = { createDeal, getDeals, getDealById };
