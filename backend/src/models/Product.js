const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  
}, {
  timestamps: true,
});

module.exports = Product;