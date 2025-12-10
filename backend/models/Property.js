const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Property = sequelize.define('Property', {
  property_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  property_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  purpose: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
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
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'available',
  },
}, {
  tableName: 'properties',
  timestamps: true,
});

module.exports = Property;
