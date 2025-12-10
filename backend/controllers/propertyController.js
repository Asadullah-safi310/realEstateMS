const { validationResult } = require('express-validator');
const { Property, Deal } = require('../models');
const path = require('path');

const createProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { owner_id, property_type, purpose, price, location, city, area_size, bedrooms, bathrooms, description, latitude, longitude } = req.body;
    await Property.create({
      owner_id,
      property_type,
      purpose,
      price,
      location,
      city,
      area_size,
      bedrooms,
      bathrooms,
      description,
      latitude: latitude || null,
      longitude: longitude || null,
    });
    res.status(201).json({ message: 'Property created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProperties = async (req, res) => {
  try {
    const properties = await Property.findAll();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchProperties = async (req, res) => {
  try {
    const { city, property_type, purpose, min_price, max_price, bedrooms, status } = req.query;
    const where = {};

    if (city) where.city = city;
    if (property_type) where.property_type = property_type;
    if (purpose) where.purpose = purpose;
    if (bedrooms) where.bedrooms = bedrooms;
    if (status) where.status = status;
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[require('sequelize').Op.gte] = min_price;
      if (max_price) where.price[require('sequelize').Op.lte] = max_price;
    }

    const properties = await Property.findAll({ where });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { owner_id, property_type, purpose, price, location, city, area_size, bedrooms, bathrooms, description, latitude, longitude } = req.body;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    await property.update({
      owner_id,
      property_type,
      purpose,
      price,
      location,
      city,
      area_size,
      bedrooms,
      bathrooms,
      description,
      latitude: latitude || null,
      longitude: longitude || null,
    });

    res.json({ message: 'Property updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    await property.update({ status });
    res.json({ message: 'Property status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const dealCount = await Deal.count({ where: { property_id: id } });
    if (dealCount > 0) {
      return res.status(400).json({ error: 'Cannot delete property with existing deals' });
    }

    await property.destroy();
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadFiles = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const photos = [];
    const attachments = [];

    if (req.files) {
      req.files.forEach(file => {
        const fileUrl = `/uploads/${file.filename}`;
        if (file.mimetype.startsWith('image/')) {
          photos.push(fileUrl);
        } else {
          attachments.push(fileUrl);
        }
      });
    }

    const existingPhotos = Array.isArray(property.photos) ? property.photos : [];
    const existingAttachments = Array.isArray(property.attachments) ? property.attachments : [];

    await property.update({
      photos: [...existingPhotos, ...photos],
      attachments: [...existingAttachments, ...attachments],
    });

    res.json({
      message: 'Files uploaded successfully',
      photos: property.photos,
      attachments: property.attachments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileUrl, type } = req.body;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (type === 'photo') {
      property.photos = Array.isArray(property.photos)
        ? property.photos.filter(f => f !== fileUrl)
        : [];
    } else if (type === 'attachment') {
      property.attachments = Array.isArray(property.attachments)
        ? property.attachments.filter(f => f !== fileUrl)
        : [];
    }

    await property.save();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  searchProperties,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
  uploadFiles,
  deleteFile,
};
