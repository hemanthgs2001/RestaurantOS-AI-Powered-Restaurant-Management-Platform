const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExpenseRecord = sequelize.define('ExpenseRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'other'),
  },
  receipt: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});

module.exports = ExpenseRecord;