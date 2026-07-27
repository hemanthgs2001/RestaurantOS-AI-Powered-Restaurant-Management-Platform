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
    defaultValue: 0, // failed extractions won't have a total yet
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
    // Existing payment-tracking status — left exactly as-is, untouched by
    // AI processing so any other part of the app that relies on it (e.g.
    // marking an invoice paid) keeps working.
    type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'pending',
  },

  // --- New: AI/OCR extraction fields ---------------------------------
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  supplierName: {
    // Free-text supplier name as read off the invoice by the AI. Separate
    // from `supplierId`, which links to a matched Supplier record — that
    // matching is a separate concern from OCR extraction.
    type: DataTypes.STRING,
    allowNull: true,
  },
  billTo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  items: {
    // [{ description, quantity, unitPrice, total }]
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
  isHandwritten: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  extractionStatus: {
    // Did the AI extraction succeed? Independent from payment `status`.
    type: DataTypes.ENUM('processed', 'failed'),
    allowNull: false,
    defaultValue: 'processed',
  },
  notes: {
    // Failure reason when extractionStatus === 'failed'
    type: DataTypes.TEXT,
    allowNull: true,
  },
  originalFileName: {
    type: DataTypes.STRING,
    allowNull: true,
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

