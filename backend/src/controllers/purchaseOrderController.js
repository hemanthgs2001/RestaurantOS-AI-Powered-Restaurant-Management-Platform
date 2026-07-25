const PurchaseOrder = require('../models/PurchaseOrder');
const Supplier = require('../models/Supplier');
const { sequelize } = require('../config/database');

// @desc    Get all purchase orders
// @route   GET /api/inventory/purchase-orders
// @access  Private
const getAllPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.findAll({
      include: [{ model: Supplier, attributes: ['name', 'contactPerson', 'phone'] }],
      order: [['createdAt', 'DESC']]
    });
    
    const formatted = orders.map(o => ({
      ...o.toJSON(),
      supplierName: o.Supplier?.name || 'Unknown'
    }));
    
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchase orders' });
  }
};

// @desc    Get purchase order by ID
// @route   GET /api/inventory/purchase-orders/:id
// @access  Private
const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [{ model: Supplier, attributes: ['name', 'contactPerson', 'phone', 'email'] }]
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchase order' });
  }
};

// @desc    Create purchase order
// @route   POST /api/inventory/purchase-orders
// @access  Private (Owner, Manager, Store Manager)
const createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, orderNumber, totalAmount, expectedDelivery, notes, status } = req.body;
    
    if (!supplierId) {
      return res.status(400).json({ success: false, message: 'Supplier is required' });
    }
    
    // Check if supplier exists
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    
    // Generate order number if not provided
    const orderNum = orderNumber || `PO-${Date.now().toString().slice(-8)}`;
    
    const order = await PurchaseOrder.create({
      supplierId,
      orderNumber: orderNum,
      totalAmount: totalAmount || 0,
      expectedDelivery: expectedDelivery || null,
      notes: notes || '',
      status: status || 'draft',
      orderDate: new Date()
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create purchase order' });
  }
};

// @desc    Update purchase order
// @route   PUT /api/inventory/purchase-orders/:id
// @access  Private (Owner, Manager, Store Manager)
const updatePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    await order.update(req.body);
    res.status(200).json(order);
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update purchase order' });
  }
};

// @desc    Delete purchase order
// @route   DELETE /api/inventory/purchase-orders/:id
// @access  Private (Owner, Manager)
const deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    await order.destroy();
    res.status(200).json({ success: true, message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete purchase order' });
  }
};

// @desc    Update purchase order status
// @route   PATCH /api/inventory/purchase-orders/:id/status
// @access  Private
const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    
    // If status is 'received', update delivery date
    const updateData = { status };
    if (status === 'received') {
      updateData.deliveryDate = new Date();
    }
    
    await order.update(updateData);
    res.status(200).json(order);
  } catch (error) {
    console.error('Update purchase order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update purchase order status' });
  }
};

// @desc    Get purchase order statistics
// @route   GET /api/inventory/purchase-orders/stats
// @access  Private
const getPurchaseOrderStats = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(totalAmount) as totalAmount,
        AVG(totalAmount) as avgAmount
      FROM "PurchaseOrders"
    `);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get purchase order stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchase order statistics' });
  }
};

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
  getPurchaseOrderStats
};