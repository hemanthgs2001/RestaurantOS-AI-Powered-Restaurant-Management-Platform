const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const Order = require('../models/Order');
const Table = require('../models/Table');
const Product = require('../models/Product');
const ExpenseRecord = require('../models/ExpenseRecord');
const PurchaseOrder = require('../models/PurchaseOrder');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Total Revenue
    const totalRevenue = await Order.sum('totalAmount', {
      where: { status: 'completed' },
    });

    // Active Orders
    const activeOrders = await Order.count({
      where: { status: { [Op.in]: ['pending', 'preparing', 'ready'] } },
    });

    // Table Occupancy
    const totalTables = await Table.count();
    const occupiedTables = await Table.count({
      where: { status: 'occupied' },
    });
    const tableOccupancy = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

    // Low Stock Items
    const lowStockFilter = sequelize.where(
      sequelize.col('quantity'),
      '<=',
      sequelize.col('reorderLevel')
    );

    const lowStockItems = await Product.count({
      where: lowStockFilter,
    });

    // Active Orders List
    const activeOrdersList = await Order.findAll({
      where: { status: { [Op.in]: ['pending', 'preparing', 'ready'] } },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'orderNumber', 'status', 'totalAmount'],
    });

    // Low Stock Items List
    const lowStockItemsList = await Product.findAll({
      where: lowStockFilter,
      attributes: ['id', 'name', 'quantity', 'reorderLevel'],
      limit: 5,
    });

    // Table Occupancy Data
    const tableOccupancyData = [
      { name: 'Occupied', value: occupiedTables },
      { name: 'Available', value: totalTables - occupiedTables },
    ];

    // Purchase Summary
    const purchaseSummary = {
      totalOrders: await PurchaseOrder.count(),
      totalAmount: parseFloat(await PurchaseOrder.sum('totalAmount')) || 0,
      pendingOrders: await PurchaseOrder.count({ where: { status: 'sent' } }),
      completedOrders: await PurchaseOrder.count({ where: { status: 'received' } }),
    };

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: parseFloat(totalRevenue) || 0,
        activeOrders,
        tableOccupancy,
        lowStockItems: lowStockItems || 0,
        activeOrdersList: activeOrdersList || [],
        lowStockItemsList: lowStockItemsList || [],
        tableOccupancyData,
        purchaseSummary,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
    });
  }
};

// @desc    Get sales overview
// @route   GET /api/dashboard/sales
// @access  Private
const getSalesOverview = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Get sales data grouped by date
    const [results] = await sequelize.query(`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        COUNT(*) as orders,
        SUM("totalAmount") as revenue
      FROM "Orders"
      WHERE "status" = 'completed'
        AND "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `);

    const formattedData = results.map(row => ({
      date: new Date(row.date).toLocaleDateString(),
      orders: parseInt(row.orders),
      revenue: parseFloat(row.revenue) || 0,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('Sales overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales overview',
    });
  }
};

// @desc    Get monthly expenses
// @route   GET /api/dashboard/monthly-expenses
// @access  Private
const getMonthlyExpenses = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const [results] = await sequelize.query(`
      SELECT 
        EXTRACT(MONTH FROM "date") as month,
        SUM("amount") as amount
      FROM "ExpenseRecords"
      WHERE EXTRACT(YEAR FROM "date") = :year
      GROUP BY EXTRACT(MONTH FROM "date")
      ORDER BY month ASC
    `, {
      replacements: { year },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = results.map(row => ({
      month: monthNames[parseInt(row.month) - 1],
      amount: parseFloat(row.amount) || 0,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('Monthly expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly expenses',
    });
  }
};

module.exports = {
  getDashboardStats,
  getSalesOverview,
  getMonthlyExpenses,
};