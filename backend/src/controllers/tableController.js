const Table = require('../models/Table');
const { sequelize } = require('../config/database');
const notificationService = require('../services/notificationService');

// @desc    Get all tables
// @route   GET /api/restaurant/tables
// @access  Private
const getAllTables = async (req, res) => {
  try {
    const tables = await Table.findAll({
      order: [['tableNumber', 'ASC']]
    });
    res.status(200).json(tables);
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tables' });
  }
};

// @desc    Get table by ID
// @route   GET /api/restaurant/tables/:id
// @access  Private
const getTableById = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.status(200).json(table);
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch table' });
  }
};

// @desc    Create table
// @route   POST /api/restaurant/tables
// @access  Private (Owner, Manager)
const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, section, status } = req.body;
    
    // Check if table number already exists
    const existingTable = await Table.findOne({ where: { tableNumber } });
    if (existingTable) {
      return res.status(400).json({ success: false, message: 'Table number already exists' });
    }
    
    const table = await Table.create({
      tableNumber,
      capacity: capacity || 4,
      section: section || 'Main',
      status: status || 'available'
    });
    
    res.status(201).json(table);
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({ success: false, message: 'Failed to create table' });
  }
};

// @desc    Update table
// @route   PUT /api/restaurant/tables/:id
// @access  Private (Owner, Manager)
const updateTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    
    // If table number is being changed, check for duplicates
    if (req.body.tableNumber && req.body.tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({ 
        where: { tableNumber: req.body.tableNumber } 
      });
      if (existingTable) {
        return res.status(400).json({ success: false, message: 'Table number already exists' });
      }
    }
    
    await table.update(req.body);
    res.status(200).json(table);
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ success: false, message: 'Failed to update table' });
  }
};

// @desc    Delete table
// @route   DELETE /api/restaurant/tables/:id
// @access  Private (Owner, Manager)
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    await table.destroy();
    res.status(200).json({ success: true, message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete table' });
  }
};

// @desc    Update table status
// @route   PATCH /api/restaurant/tables/:id/status
// @access  Private
const updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    
    const previousStatus = table.status;
    await table.update({ status });
    const io = req.app.get('io');
    if (io && previousStatus !== status) {
      const title = status === 'reserved'
        ? 'Table reserved'
        : status === 'occupied'
          ? 'Table occupied'
          : status === 'available'
            ? 'Table available'
            : `Table ${status}`;
      const message = `Table ${table.tableNumber} is now ${status}.`;
      notificationService.emitNotification(
        io,
        'table_status',
        title,
        message,
        { tableId: table.id, status }
      );
    }
    res.status(200).json(table);
  } catch (error) {
    console.error('Update table status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update table status' });
  }
};

// @desc    Get table statistics
// @route   GET /api/restaurant/tables/stats
// @access  Private
const getTableStats = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
      FROM "Tables"
    `);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get table stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch table statistics' });
  }
};

// @desc    Get available tables
// @route   GET /api/restaurant/tables/available
// @access  Private
const getAvailableTables = async (req, res) => {
  try {
    const tables = await Table.findAll({
      where: { status: 'available' },
      order: [['tableNumber', 'ASC']]
    });
    res.status(200).json(tables);
  } catch (error) {
    console.error('Get available tables error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch available tables' });
  }
};

module.exports = {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  getTableStats,
  getAvailableTables
};