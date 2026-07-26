const { Op } = require('sequelize');
const Order = require('../models/Order');
const { sequelize } = require('../config/database');
const notificationService = require('../services/notificationService');

const VALID_STATUSES = ['accepted', 'cancelled'];

// Generates the next sequential order number for "today" (since local
// midnight), so numbering starts at 1 and resets every 24 hours.
const generateOrderNumber = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaysOrders = await Order.findAll({
    where: { createdAt: { [Op.gte]: startOfDay } },
    attributes: ['orderNumber']
  });

  let maxNumber = 0;
  todaysOrders.forEach((order) => {
    const parsed = parseInt(order.orderNumber, 10);
    if (!Number.isNaN(parsed) && parsed > maxNumber) {
      maxNumber = parsed;
    }
  });

  return String(maxNumber + 1);
};

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
// Body accepts an optional `tableNumber` (dine-in table the order belongs to).
// `orderNumber` is auto-generated (1, 2, 3... resetting daily) unless explicitly provided.
const createOrder = async (req, res) => {
  try {
    if (!req.body.orderNumber) {
      req.body.orderNumber = await generateOrderNumber();
    }

    // Normalize tableNumber (allow blank string from forms to become null)
    if (req.body.tableNumber === '' || req.body.tableNumber === undefined) {
      req.body.tableNumber = null;
    }

    const order = await Order.create(req.body);
    const io = req.app.get('io');
    if (io) {
      const tableInfo = order.tableNumber ? ` (Table ${order.tableNumber})` : '';
      notificationService.emitNotification(
        io,
        'order_received',
        'New order received',
        `Order #${order.orderNumber}${tableInfo} was placed and is pending processing.`,
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

    if (req.body.tableNumber === '') {
      req.body.tableNumber = null;
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
// Status is limited to 'accepted' or 'cancelled'.
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.status;
    await order.update({ status });
    const io = req.app.get('io');
    if (io && previousStatus !== status) {
      const title = status === 'accepted' ? 'Order accepted' : 'Order cancelled';
      const message = `Order #${order.orderNumber} status changed to ${status}.`;
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
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
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