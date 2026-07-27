const Order = require('../models/Order');
const { sequelize } = require('../config/database');
const notificationService = require('../services/notificationService');

// Order lifecycle is limited to these 3 states.
const VALID_STATUSES = ['accepted', 'cancelled', 'completed'];

// Turns a Sequelize error into a client-safe, human-readable message
// instead of a generic "Failed to ..." string, and always logs the full
// error server-side so root causes (missing column, bad enum value,
// failed validation, etc.) are visible instead of hidden behind a 500.
const describeError = (error) => {
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    return error.errors?.map((e) => e.message).join('; ') || error.message;
  }
  if (error.name === 'SequelizeDatabaseError') {
    // e.g. "column tableNumber does not exist" or
    // "invalid input value for enum enum_Orders_status: \"pending\""
    return error.parent?.message || error.message;
  }
  return error.message;
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
    res.status(500).json({ success: false, message: 'Failed to fetch orders', detail: describeError(error) });
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
    res.status(500).json({ success: false, message: 'Failed to fetch order', detail: describeError(error) });
  }
};

// @desc    Create order
// @route   POST /api/restaurant/orders
// @access  Private
// Body accepts an optional `tableNumber` (dine-in table the order belongs to).
// `orderNumber` is auto-generated (1, 2, 3... resetting daily) unless explicitly provided.
const createOrder = async (req, res) => {
  try {
    // Order number is entered manually by staff, not auto-generated.
    if (!req.body.orderNumber || !String(req.body.orderNumber).trim()) {
      return res.status(400).json({ success: false, message: 'Order number is required' });
    }
    req.body.orderNumber = String(req.body.orderNumber).trim();

    // Normalize tableNumber (allow blank string from forms to become null)
    if (req.body.tableNumber === '' || req.body.tableNumber === undefined) {
      req.body.tableNumber = null;
    }

    // Guard against an invalid/unsupported status ever reaching the DB
    // (e.g. a stale frontend still sending 'pending' or 'preparing').
    if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const order = await Order.create(req.body);
    const io = req.app.get('io');
    if (io) {
      const tableInfo = order.tableNumber ? ` (Table ${order.tableNumber})` : '';
      await notificationService.emitNotification(
        io,
        'order_received',
        'New order received',
        `Order #${order.orderNumber}${tableInfo} was placed.`,
        { orderId: order.id, status: order.status }
      );
    }
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', detail: describeError(error) });
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

    if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    await order.update(req.body);
    res.status(200).json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order', detail: describeError(error) });
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
    res.status(500).json({ success: false, message: 'Failed to delete order', detail: describeError(error) });
  }
};

// @desc    Update order status
// @route   PATCH /api/restaurant/orders/:id/status
// @access  Private
// Status is limited to 'accepted', 'cancelled', or 'completed'.
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
      const titles = {
        accepted: 'Order accepted',
        cancelled: 'Order cancelled',
        completed: 'Order completed'
      };
      const message = `Order #${order.orderNumber} status changed to ${status}.`;
      await notificationService.emitNotification(
        io,
        'order_status',
        titles[status] || 'Order status updated',
        message,
        { orderId: order.id, status }
      );
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status', detail: describeError(error) });
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
    res.status(500).json({ success: false, message: 'Failed to fetch orders', detail: describeError(error) });
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
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM("totalAmount") as totalRevenue
      FROM "Orders"
    `);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order statistics', detail: describeError(error) });
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