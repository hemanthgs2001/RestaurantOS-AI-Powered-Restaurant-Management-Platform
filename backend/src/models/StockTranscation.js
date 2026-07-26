const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Product = require('./Product');

const StockTranscation = sequelize.define('StockTranscation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('in', 'out', 'adjustment'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
  },
  reference: {
    type: DataTypes.STRING,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

// Associations
StockTranscation.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(StockTranscation, { foreignKey: 'productId' });

module.exports = StockTranscation;