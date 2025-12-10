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
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  final_price: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
  },
  deal_type: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'completed',
  },
}, {
  tableName: 'deals',
  timestamps: true,
});

module.exports = Deal;
