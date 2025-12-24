const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Deal = sequelize.define('Deal', {
  deal_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  deal_type: {
    type: DataTypes.ENUM('SALE', 'RENT'),
    allowNull: false,
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Current owner before the deal',
  },
  buyer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Person becoming the new owner (for SALE) or tenant (for RENT)',
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tenant (for SALE, if property has tenant)',
  },
  price: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'PENDING',
  },
  deal_completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'deals',
  timestamps: true,
});

module.exports = Deal;
