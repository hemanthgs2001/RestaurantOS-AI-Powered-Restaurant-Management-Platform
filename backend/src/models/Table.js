const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Table = sequelize.define('Table', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tableNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
  },
  status: {
    type: DataTypes.ENUM('available', 'reserved', 'maintenance'),
    defaultValue: 'available',
  },
  section: {
    type: DataTypes.STRING,
  },
  // Timestamp of when the reservation starts (the selected in-time)
  bookedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Auto-computed as bookedAt + the default booking duration - the table
  // auto-frees back to 'available' once this passes
  outTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Table;