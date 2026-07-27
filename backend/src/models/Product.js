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
  unit: {
    type: DataTypes.STRING,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  reorderLevel: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 10,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = Product;