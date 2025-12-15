const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Property = sequelize.define('Property', {
  property_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  property_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  purpose: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  sale_price: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
  },
  rent_price: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  area_size: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  photos: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of photo URLs',
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of attachment file paths',
  },
  videos: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of video URLs (uploaded or external)',
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'available',
  },
  is_available_for_sale: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_available_for_rent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_photo_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_attachment_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_video_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'properties',
  timestamps: true,
});

module.exports = Property;
