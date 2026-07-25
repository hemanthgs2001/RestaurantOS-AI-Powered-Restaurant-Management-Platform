const Product = require('../models/Product');
const { sequelize } = require('../config/database');

// @desc    Get all products
// @route   GET /api/inventory/products
// @access  Private
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// @desc    Get product by ID
// @route   GET /api/inventory/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// @desc    Create product
// @route   POST /api/inventory/products
// @access  Private (Owner, Manager, Store Manager)
const createProduct = async (req, res) => {
  try {
    const { name, description, sku, unit, quantity, reorderLevel, unitPrice, costPrice } = req.body;
    
    if (!name || !unit) {
      return res.status(400).json({ success: false, message: 'Name and unit are required' });
    }
    
    // Check if SKU already exists
    if (sku) {
      const existingProduct = await Product.findOne({ where: { sku } });
      if (existingProduct) {
        return res.status(400).json({ success: false, message: 'SKU already exists' });
      }
    }
    
    const product = await Product.create({
      name,
      description: description || '',
      sku: sku || '',
      unit,
      quantity: quantity || 0,
      reorderLevel: reorderLevel || 10,
      unitPrice: unitPrice || 0,
      costPrice: costPrice || 0
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

// @desc    Update product
// @route   PUT /api/inventory/products/:id
// @access  Private (Owner, Manager, Store Manager)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // If SKU is being changed, check for duplicates
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ 
        where: { sku: req.body.sku } 
      });
      if (existingProduct) {
        return res.status(400).json({ success: false, message: 'SKU already exists' });
      }
    }
    
    await product.update(req.body);
    res.status(200).json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// @desc    Delete product
// @route   DELETE /api/inventory/products/:id
// @access  Private (Owner, Manager)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await product.destroy();
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

// @desc    Get low stock products
// @route   GET /api/inventory/products/low-stock
// @access  Private
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: sequelize.literal('quantity <= reorderLevel'),
      order: [['quantity', 'ASC']]
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch low stock products' });
  }
};

// @desc    Update product quantity
// @route   PATCH /api/inventory/products/:id/quantity
// @access  Private
const updateProductQuantity = async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    if (quantity === undefined || !operation) {
      return res.status(400).json({ success: false, message: 'Quantity and operation are required' });
    }
    
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    let newQuantity;
    if (operation === 'add') {
      newQuantity = parseFloat(product.quantity) + parseFloat(quantity);
    } else if (operation === 'subtract') {
      newQuantity = parseFloat(product.quantity) - parseFloat(quantity);
      if (newQuantity < 0) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid operation. Use "add" or "subtract"' });
    }
    
    await product.update({ quantity: newQuantity });
    res.status(200).json(product);
  } catch (error) {
    console.error('Update product quantity error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product quantity' });
  }
};

// @desc    Get product statistics
// @route   GET /api/inventory/products/stats
// @access  Private
const getProductStats = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN quantity <= reorderLevel THEN 1 ELSE 0 END) as lowStock,
        AVG(unitPrice) as avgPrice,
        SUM(quantity * unitPrice) as totalValue
      FROM "Products"
    `);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product statistics' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  updateProductQuantity,
  getProductStats
};