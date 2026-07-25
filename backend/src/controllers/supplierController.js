const Supplier = require('../models/Supplier');
const { sequelize } = require('../config/database');

// @desc    Get all suppliers
// @route   GET /api/restaurant/suppliers
// @access  Private
const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(suppliers);
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers' });
  }
};

// @desc    Get supplier by ID
// @route   GET /api/restaurant/suppliers/:id
// @access  Private
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.status(200).json(supplier);
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supplier' });
  }
};

// @desc    Create supplier
// @route   POST /api/restaurant/suppliers
// @access  Private (Owner, Manager, Store Manager)
const createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, taxId, paymentTerms } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }
    
    const supplier = await Supplier.create({
      name,
      contactPerson: contactPerson || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      taxId: taxId || '',
      paymentTerms: paymentTerms || ''
    });
    
    res.status(201).json(supplier);
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ success: false, message: 'Failed to create supplier' });
  }
};

// @desc    Update supplier
// @route   PUT /api/restaurant/suppliers/:id
// @access  Private (Owner, Manager, Store Manager)
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    await supplier.update(req.body);
    res.status(200).json(supplier);
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ success: false, message: 'Failed to update supplier' });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/restaurant/suppliers/:id
// @access  Private (Owner, Manager)
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    await supplier.destroy();
    res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete supplier' });
  }
};

// @desc    Search suppliers
// @route   GET /api/restaurant/suppliers/search
// @access  Private
const searchSuppliers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    
    const [results] = await sequelize.query(`
      SELECT * FROM "Suppliers" 
      WHERE name ILIKE :query 
      OR contactPerson ILIKE :query 
      OR email ILIKE :query
      ORDER BY name ASC
    `, {
      replacements: { query: `%${q}%` }
    });
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Search suppliers error:', error);
    res.status(500).json({ success: false, message: 'Failed to search suppliers' });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers
};