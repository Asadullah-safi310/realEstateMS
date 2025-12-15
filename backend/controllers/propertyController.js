const { validationResult } = require('express-validator');
const { Property, Deal, Person, PersonPropertyRole } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const path = require('path');

const createProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const transaction = await sequelize.transaction();

  try {
    const { person_id, property_type, purpose, sale_price, rent_price, location, city, area_size, bedrooms, bathrooms, description, latitude, longitude, is_available_for_sale, is_available_for_rent, is_photo_available, is_attachment_available, is_video_available, videos } = req.body;

    const person = await Person.findByPk(person_id, { transaction });
    if (!person) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Person not found' });
    }

    const property = await Property.create({
      property_type,
      purpose,
      sale_price: sale_price || null,
      rent_price: rent_price || null,
      location,
      city,
      area_size,
      bedrooms,
      bathrooms,
      description,
      latitude: latitude || null,
      longitude: longitude || null,
      status: 'available',
      is_available_for_sale: is_available_for_sale === true || is_available_for_sale === 'true' ? true : false,
      is_available_for_rent: is_available_for_rent === true || is_available_for_rent === 'true' ? true : false,
      is_photo_available: is_photo_available === true || is_photo_available === 'true' ? true : false,
      is_attachment_available: is_attachment_available === true || is_attachment_available === 'true' ? true : false,
      is_video_available: is_video_available === true || is_video_available === 'true' ? true : false,
      videos: Array.isArray(videos) ? videos : [],
    }, { transaction });

    await PersonPropertyRole.create({
      person_id,
      property_id: property.property_id,
      role: 'OWNER',
      start_date: new Date(),
    }, { transaction });

    await transaction.commit();
    res.status(201).json({ message: 'Property created successfully', property_id: property.property_id });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

const getProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      include: [
        {
          model: PersonPropertyRole,
          as: 'PersonPropertyRoles',
          include: [
            { model: Person, as: 'Person', attributes: ['person_id', 'full_name', 'phone'] },
          ],
        },
      ],
    });

    const enrichedProperties = properties.map(prop => {
      const currentOwner = prop.PersonPropertyRoles?.find(r => r.role === 'OWNER' && !r.end_date);
      const currentTenant = prop.PersonPropertyRoles?.find(r => r.role === 'TENANT' && !r.end_date);
      const propJson = prop.toJSON();
      return {
        ...propJson,
        current_owner: currentOwner || null,
        current_tenant: currentTenant || null,
        is_available_for_sale: Boolean(propJson.is_available_for_sale),
        is_available_for_rent: Boolean(propJson.is_available_for_rent),
        is_photo_available: Boolean(propJson.is_photo_available),
        is_attachment_available: Boolean(propJson.is_attachment_available),
        is_video_available: Boolean(propJson.is_video_available),
      };
    });

    res.json(enrichedProperties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id, {
      include: [
        {
          model: PersonPropertyRole,
          as: 'PersonPropertyRoles',
          include: [
            { model: Person, as: 'Person', attributes: ['person_id', 'full_name', 'phone', 'email', 'address'] },
          ],
        },
      ],
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const currentOwner = property.PersonPropertyRoles?.find(r => r.role === 'OWNER' && !r.end_date);
    const currentTenant = property.PersonPropertyRoles?.find(r => r.role === 'TENANT' && !r.end_date);

    const propJson = property.toJSON();
    const enrichedProperty = {
      ...propJson,
      current_owner: currentOwner || null,
      current_tenant: currentTenant || null,
      is_available_for_sale: Boolean(propJson.is_available_for_sale),
      is_available_for_rent: Boolean(propJson.is_available_for_rent),
      is_photo_available: Boolean(propJson.is_photo_available),
      is_attachment_available: Boolean(propJson.is_attachment_available),
      is_video_available: Boolean(propJson.is_video_available),
    };

    res.json(enrichedProperty);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchProperties = async (req, res) => {
  try {
    const { city, property_type, purpose, min_sale_price, max_sale_price, min_rent_price, max_rent_price, bedrooms, status, availability } = req.query;
    const where = {};

    if (city) where.city = city;
    if (property_type) where.property_type = property_type;
    if (purpose) where.purpose = purpose;
    if (bedrooms) where.bedrooms = bedrooms;
    if (status) where.status = status;
    
    if (min_sale_price || max_sale_price) {
      where.sale_price = {};
      if (min_sale_price) where.sale_price[Op.gte] = min_sale_price;
      if (max_sale_price) where.sale_price[Op.lte] = max_sale_price;
    }

    if (min_rent_price || max_rent_price) {
      where.rent_price = {};
      if (min_rent_price) where.rent_price[Op.gte] = min_rent_price;
      if (max_rent_price) where.rent_price[Op.lte] = max_rent_price;
    }

    if (availability === 'sale') {
      where.is_available_for_sale = true;
    } else if (availability === 'rent') {
      where.is_available_for_rent = true;
    } else if (availability === 'both') {
      where[Op.or] = [
        { is_available_for_sale: true },
        { is_available_for_rent: true }
      ];
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
    const { property_type, purpose, sale_price, rent_price, location, city, area_size, bedrooms, bathrooms, description, latitude, longitude, is_available_for_sale, is_available_for_rent, is_photo_available, is_attachment_available, is_video_available } = req.body;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    await property.update({
      property_type,
      purpose,
      sale_price: sale_price || null,
      rent_price: rent_price || null,
      location,
      city,
      area_size,
      bedrooms,
      bathrooms,
      description,
      latitude: latitude || null,
      longitude: longitude || null,
      is_available_for_sale: is_available_for_sale === true || is_available_for_sale === 'true' ? true : false,
      is_available_for_rent: is_available_for_rent === true || is_available_for_rent === 'true' ? true : false,
      is_photo_available: is_photo_available === true || is_photo_available === 'true' ? true : false,
      is_attachment_available: is_attachment_available === true || is_attachment_available === 'true' ? true : false,
      is_video_available: is_video_available === true || is_video_available === 'true' ? true : false,
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
    const videos = [];
    const attachments = [];

    if (req.files) {
      req.files.forEach(file => {
        const fileUrl = `/uploads/${file.filename}`;
        if (file.mimetype.startsWith('image/')) {
          photos.push(fileUrl);
        } else if (file.mimetype.startsWith('video/')) {
          videos.push(fileUrl);
        } else {
          attachments.push(fileUrl);
        }
      });
    }

    const existingPhotos = Array.isArray(property.photos) ? property.photos : [];
    const existingVideos = Array.isArray(property.videos) ? property.videos : [];
    const existingAttachments = Array.isArray(property.attachments) ? property.attachments : [];

    const updateData = {
      photos: [...existingPhotos, ...photos],
      videos: [...existingVideos, ...videos],
      attachments: [...existingAttachments, ...attachments],
    };

    if (photos.length > 0) updateData.is_photo_available = true;
    if (videos.length > 0) updateData.is_video_available = true;
    if (attachments.length > 0) updateData.is_attachment_available = true;

    await property.update(updateData);

    const updatedProperty = await Property.findByPk(id);

    res.json({
      message: 'Files uploaded successfully',
      photos: updatedProperty.photos,
      videos: updatedProperty.videos,
      attachments: updatedProperty.attachments,
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
    } else if (type === 'video') {
      property.videos = Array.isArray(property.videos)
        ? property.videos.filter(f => f !== fileUrl)
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

const getAvailableProperties = async (req, res) => {
  try {
    const { dealType } = req.query;
    const where = {};

    if (dealType === 'SALE') {
      where.is_available_for_sale = true;
    } else if (dealType === 'RENT') {
      where.is_available_for_rent = true;
    } else {
      where[Op.or] = [
        { is_available_for_sale: true },
        { is_available_for_rent: true }
      ];
    }

    const properties = await Property.findAll({
      where,
      include: [
        {
          model: PersonPropertyRole,
          as: 'PersonPropertyRoles',
          include: [
            { model: Person, as: 'Person', attributes: ['person_id', 'full_name', 'phone'] },
          ],
        },
      ],
    });

    const enrichedProperties = properties.map(prop => {
      const currentOwner = prop.PersonPropertyRoles?.find(r => r.role === 'OWNER' && !r.end_date);
      const currentTenant = prop.PersonPropertyRoles?.find(r => r.role === 'TENANT' && !r.end_date);
      const propJson = prop.toJSON();
      return {
        ...propJson,
        current_owner: currentOwner || null,
        current_tenant: currentTenant || null,
        is_available_for_sale: Boolean(propJson.is_available_for_sale),
        is_available_for_rent: Boolean(propJson.is_available_for_rent),
      };
    });

    res.json(enrichedProperties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPropertiesByOwner = async (req, res) => {
  try {
    const { id } = req.params;

    const properties = await Property.findAll({
      include: [
        {
          model: PersonPropertyRole,
          as: 'PersonPropertyRoles',
          where: { person_id: id, role: 'OWNER', end_date: null },
          include: [
            { model: Person, as: 'Person', attributes: ['person_id', 'full_name', 'phone'] },
          ],
        },
      ],
    });

    const enrichedProperties = properties.map(prop => {
      const currentOwner = prop.PersonPropertyRoles?.find(r => r.role === 'OWNER' && !r.end_date);
      const currentTenant = prop.PersonPropertyRoles?.find(r => r.role === 'TENANT' && !r.end_date);
      const propJson = prop.toJSON();
      return {
        ...propJson,
        current_owner: currentOwner || null,
        current_tenant: currentTenant || null,
        is_available_for_sale: Boolean(propJson.is_available_for_sale),
        is_available_for_rent: Boolean(propJson.is_available_for_rent),
      };
    });

    res.json(enrichedProperties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPropertiesByTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const properties = await Property.findAll({
      include: [
        {
          model: PersonPropertyRole,
          as: 'PersonPropertyRoles',
          where: { person_id: id, role: 'TENANT', end_date: null },
          include: [
            { model: Person, as: 'Person', attributes: ['person_id', 'full_name', 'phone'] },
          ],
        },
      ],
    });

    const enrichedProperties = properties.map(prop => {
      const currentOwner = prop.PersonPropertyRoles?.find(r => r.role === 'OWNER' && !r.end_date);
      const currentTenant = prop.PersonPropertyRoles?.find(r => r.role === 'TENANT' && !r.end_date);
      const propJson = prop.toJSON();
      return {
        ...propJson,
        current_owner: currentOwner || null,
        current_tenant: currentTenant || null,
        is_available_for_sale: Boolean(propJson.is_available_for_sale),
        is_available_for_rent: Boolean(propJson.is_available_for_rent),
      };
    });

    res.json(enrichedProperties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePropertyAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { dealType } = req.body;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (dealType === 'SALE') {
      await property.update({ is_available_for_sale: false });
    } else if (dealType === 'RENT') {
      await property.update({ is_available_for_rent: false });
    } else {
      return res.status(400).json({ error: 'Invalid deal type. Must be SALE or RENT' });
    }

    res.json({ message: 'Property availability updated successfully', property });
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
  getAvailableProperties,
  getPropertiesByOwner,
  getPropertiesByTenant,
  updatePropertyAvailability,
};
