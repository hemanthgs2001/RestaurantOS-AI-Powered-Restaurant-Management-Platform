const SupplierInvoice = require('../models/SupplierInvoice');
const Supplier = require('../models/Supplier');
const { sequelize } = require('../config/database');

// @desc    Get all supplier invoices
// @route   GET /api/expense/supplier-invoices
// @access  Private
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await SupplierInvoice.findAll({
      include: [{ model: Supplier, attributes: ['name', 'contactPerson', 'phone'] }],
      order: [['createdAt', 'DESC']]
    });
    
    const formatted = invoices.map(i => ({
      ...i.toJSON(),
      supplierName: i.Supplier?.name || 'Unknown'
    }));
    
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Get supplier invoices error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supplier invoices' });
  }
};

// @desc    Get supplier invoice by ID
// @route   GET /api/expense/supplier-invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await SupplierInvoice.findByPk(req.params.id, {
      include: [{ model: Supplier, attributes: ['name', 'contactPerson', 'phone', 'email'] }]
    });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Get supplier invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supplier invoice' });
  }
};

// @desc    Create supplier invoice
// @route   POST /api/expense/supplier-invoices
// @access  Private (Owner, Manager, Store Manager)
const createInvoice = async (req, res) => {
  try {
    const { supplierId, invoiceNumber, invoiceDate, dueDate, totalAmount, taxAmount, discountAmount, status, filePath, extractedData } = req.body;
    
    if (!supplierId || !invoiceNumber || !totalAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Supplier, invoice number, and total amount are required' 
      });
    }
    
    // Check if supplier exists
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    
    const invoice = await SupplierInvoice.create({
      supplierId,
      invoiceNumber,
      invoiceDate: invoiceDate || new Date(),
      dueDate: dueDate || null,
      totalAmount,
      taxAmount: taxAmount || 0,
      discountAmount: discountAmount || 0,
      status: status || 'pending',
      filePath: filePath || '',
      extractedData: extractedData || {}
    });
    
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create supplier invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to create supplier invoice' });
  }
};

// @desc    Update supplier invoice
// @route   PUT /api/expense/supplier-invoices/:id
// @access  Private (Owner, Manager)
const updateInvoice = async (req, res) => {
  try {
    const invoice = await SupplierInvoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    await invoice.update(req.body);
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Update supplier invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to update supplier invoice' });
  }
};

// @desc    Delete supplier invoice
// @route   DELETE /api/expense/supplier-invoices/:id
// @access  Private (Owner, Manager)
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await SupplierInvoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    await invoice.destroy();
    res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete supplier invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete supplier invoice' });
  }
};

// @desc    Update invoice status
// @route   PATCH /api/expense/supplier-invoices/:id/status
// @access  Private
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    const invoice = await SupplierInvoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    await invoice.update({ status });
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update invoice status' });
  }
};

// @desc    Get invoice statistics
// @route   GET /api/expense/supplier-invoices/stats
// @access  Private
const getInvoiceStats = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(totalAmount) as totalAmount,
        SUM(CASE WHEN status = 'pending' OR status = 'overdue' THEN totalAmount ELSE 0 END) as outstandingAmount
      FROM "SupplierInvoices"
    `);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get invoice stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoice statistics' });
  }
};

// @desc    Get invoices by supplier
// @route   GET /api/expense/supplier-invoices/supplier/:supplierId
// @access  Private
const getInvoicesBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const invoices = await SupplierInvoice.findAll({
      where: { supplierId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Get invoices by supplier error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  getInvoiceStats,
  getInvoicesBySupplier
};