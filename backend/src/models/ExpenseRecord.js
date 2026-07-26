const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ExpenseCategory = require('./ExpenseCategory');

const ExpenseRecord = sequelize.define('ExpenseRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: ExpenseCategory,
      key: 'id',
    },
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

// Associations (needed for `include: [{ model: ExpenseCategory }]` in the controllers)
ExpenseRecord.belongsTo(ExpenseCategory, { foreignKey: 'categoryId' });
ExpenseCategory.hasMany(ExpenseRecord, { foreignKey: 'categoryId' });

module.exports = ExpenseRecord;