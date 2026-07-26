const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Supplier = require('./Supplier');

const SupplierInvoice = sequelize.define('SupplierInvoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Supplier,
      key: 'id',
    },
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  invoiceDate: {
    type: DataTypes.DATE,
  },
  dueDate: {
    type: DataTypes.DATE,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'pending',
  },
  filePath: {
    type: DataTypes.STRING,
  },
  extractedData: {
    type: DataTypes.JSONB,
  },
}, {
  timestamps: true,
});

// Associations (needed for `include: [{ model: Supplier }]` in the controllers)
SupplierInvoice.belongsTo(Supplier, { foreignKey: 'supplierId' });
Supplier.hasMany(SupplierInvoice, { foreignKey: 'supplierId' });

module.exports = SupplierInvoice;