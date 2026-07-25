const Order = require('../models/Order');
const { sequelize } = require('../config/database');
const notificationService = require('../services/notificationService');

// @desc    Get all orders
// @route   GET /api/restaurant/orders
// @access  Private
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// @desc    Get single order
// @route   GET /api/restaurant/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

// @desc    Create order
// @route   POST /api/restaurant/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    // Generate order number if not provided
    if (!req.body.orderNumber) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      req.body.orderNumber = `ORD-${year}${month}${day}-${random}`;
    }
    
    const order = await Order.create(req.body);
    const io = req.app.get('io');
    if (io) {
      notificationService.emitNotification(
        io,
        'order_received',
        'New order received',
        `Order ${order.orderNumber || order.id} was placed and is pending processing.`,
        { orderId: order.id, status: order.status }
      );
    }
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// @desc    Update order
// @route   PUT /api/restaurant/orders/:id
// @access  Private
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    await order.update(req.body);
    res.status(200).json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};

// @desc    Delete order
// @route   DELETE /api/restaurant/orders/:id
// @access  Private
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    await order.destroy();
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
};

// @desc    Update order status
// @route   PATCH /api/restaurant/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
        const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const previousStatus = order.status;
    await order.update({ status });
    const io = req.app.get('io');
    if (io && previousStatus !== status) {
      const titles = {
        preparing: 'Order preparing',
        ready: 'Order prepared',
        completed: 'Order completed',
      };
      const title = titles[status] || `Order ${status}`;
      const message = `Order ${order.orderNumber || order.id} status changed to ${status}.`;
      notificationService.emitNotification(
        io,
        'order_status',
        title,
        message,
        { orderId: order.id, status }
      );
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

// @desc    Get orders by status
// @route   GET /api/restaurant/orders/status/:status
// @access  Private
const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await Order.findAll({
      where: { status },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get orders by status error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// @desc    Get order statistics
// @route   GET /api/restaurant/orders/stats
// @access  Private
const getOrderStats = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
        SUM(CASE WHEN status = 'served' THEN 1 ELSE 0 END) as served,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(totalAmount) as totalRevenue
      FROM "Orders"
    `);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order statistics' });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrdersByStatus,
  getOrderStats
};