const StockTransaction = require('../models/StockTranscation');
const Product = require('../models/Product');
const { sequelize } = require('../config/database');

// @desc    Get all stock
// @route   GET /api/inventory/stock
// @access  Private
const getAllStock = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'name', 'unit', 'quantity', 'reorderLevel', 'unitPrice', 'costPrice'],
      order: [['name', 'ASC']]
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock' });
  }
};

// @desc    Stock in
// @route   POST /api/inventory/stock/in
// @access  Private (Owner, Manager, Store Manager)
const stockIn = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { productId, quantity, unitPrice, notes } = req.body;
    
    if (!productId || !quantity) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
    }
    
    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Update product quantity
    const newQuantity = parseFloat(product.quantity) + parseFloat(quantity);
    const newUnitPrice = unitPrice || product.unitPrice;
    await product.update({ 
      quantity: newQuantity,
      unitPrice: newUnitPrice
    }, { transaction });
    
    // Create transaction record
    await StockTransaction.create({
      productId,
      type: 'in',
      quantity,
      unitPrice: newUnitPrice,
      totalPrice: quantity * newUnitPrice,
      notes: notes || 'Stock in',
      reference: `STOCK-IN-${Date.now()}`
    }, { transaction });
    
    await transaction.commit();
    res.status(200).json({ 
      success: true, 
      message: 'Stock in recorded successfully',
      data: product
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Stock in error:', error);
    res.status(500).json({ success: false, message: 'Failed to record stock in' });
  }
};

// @desc    Stock out
// @route   POST /api/inventory/stock/out
// @access  Private (Owner, Manager, Store Manager)
const stockOut = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { productId, quantity, notes } = req.body;
    
    if (!productId || !quantity) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
    }
    
    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (parseFloat(product.quantity) < parseFloat(quantity)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }
    
    // Update product quantity
    const newQuantity = parseFloat(product.quantity) - parseFloat(quantity);
    await product.update({ quantity: newQuantity }, { transaction });
    
    // Create transaction record
    await StockTransaction.create({
      productId,
      type: 'out',
      quantity,
      unitPrice: product.unitPrice,
      totalPrice: quantity * product.unitPrice,
      notes: notes || 'Stock out',
      reference: `STOCK-OUT-${Date.now()}`
    }, { transaction });
    
    await transaction.commit();
    res.status(200).json({ 
      success: true, 
      message: 'Stock out recorded successfully',
      data: product
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Stock out error:', error);
    res.status(500).json({ success: false, message: 'Failed to record stock out' });
  }
};

// @desc    Get stock transactions
// @route   GET /api/inventory/stock/transactions
// @access  Private
const getStockTransactions = async (req, res) => {
  try {
    const { limit = 100, productId } = req.query;
    const where = {};
    if (productId) where.productId = productId;
    
    const transactions = await StockTransaction.findAll({
      where,
      include: [{ model: Product, attributes: ['name', 'unit'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });
    
    const formatted = transactions.map(t => ({
      ...t.toJSON(),
      productName: t.Product?.name || 'Unknown',
      productUnit: t.Product?.unit || 'N/A'
    }));
    
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Get stock transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock transactions' });
  }
};

// @desc    Get stock summary
// @route   GET /api/inventory/stock/summary
// @access  Private
const getStockSummary = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalProducts,
        SUM(quantity) as totalQuantity,
        SUM(CASE WHEN quantity <= reorderLevel THEN 1 ELSE 0 END) as lowStockCount,
        SUM(quantity * unitPrice) as totalValue
      FROM "Products"
    `);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get stock summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock summary' });
  }
};

module.exports = {
  getAllStock,
  stockIn,
  stockOut,
  getStockTransactions,
  getStockSummary
};