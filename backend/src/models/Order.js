const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Sequential per-day number ("1", "2", ...). Resets to 1 every 24 hours,
  // so it is intentionally NOT unique across different days.
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tableNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('accepted', 'cancelled'),
    defaultValue: 'accepted',
  },
  // Snapshot of the menu items selected for this order, captured at the
  // time of ordering (so later menu price changes don't rewrite history).
  // Shape: [{ menuItemId, name, price, quantity, subtotal }]
  items: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'partially_paid'),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'mobile', 'other'),
  },
  orderType: {
    type: DataTypes.ENUM('dine_in', 'takeaway', 'delivery'),
    defaultValue: 'dine_in',
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = Order;