const { Op } = require('sequelize');
const Table = require('../models/Table');
const { sequelize } = require('../config/database');
const notificationService = require('../services/notificationService');

// Max number of tables allowed inside a single section.
const MAX_TABLES_PER_SECTION = 10;

// A reservation only takes an in-time from the client; the out-time (when
// the table auto-frees) is always computed server-side as in-time + this
// duration. Change this single value to adjust the booking slot length.
const DEFAULT_BOOKING_DURATION_HOURS = 12;

const VALID_STATUSES = ['available', 'reserved', 'maintenance'];

// Finds tables that were reserved whose out-time has passed and flips them
// back to 'available', clearing the booking fields. Called at the top of
// the read/status endpoints so the table list is always self-healing -
// status changes purely on time, never requires a manual "make available"
// action.
const releaseExpiredTables = async (req) => {
  try {
    const expiredTables = await Table.findAll({
      where: {
        status: 'reserved',
        outTime: { [Op.ne]: null, [Op.lte]: new Date() }
      }
    });

    if (expiredTables.length === 0) return;

    const io = req?.app?.get('io');

    for (const table of expiredTables) {
      await table.update({ status: 'available', bookedAt: null, outTime: null });
      if (io) {
        await notificationService.emitNotification(
          io,
          'table_status',
          'Table available',
          `Table ${table.tableNumber} is now available (reservation time ended).`,
          { tableId: table.id, status: 'available' }
        );
      }
    }
  } catch (error) {
    console.error('Release expired tables error:', error);
  }
};

// @desc    Get all tables
// @route   GET /api/restaurant/tables
// @access  Private
const getAllTables = async (req, res) => {
  try {
    await releaseExpiredTables(req);
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
// Body: { tableNumber, capacity, section, status?, inTime? }
// Status can be set at creation time (available/reserved/maintenance) so a
// table never sits briefly as "available" and bookable by someone else
// before its intended status is applied. If status is 'reserved', inTime is
// required and out-time is auto-computed (inTime + DEFAULT_BOOKING_DURATION_HOURS).
const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, section, status, inTime } = req.body;

    // Check if table number already exists
    const existingTable = await Table.findOne({ where: { tableNumber } });
    if (existingTable) {
      return res.status(400).json({ success: false, message: 'Table number already exists' });
    }

    const sectionName = section || 'Main';
    const sectionCount = await Table.count({ where: { section: sectionName } });
    if (sectionCount >= MAX_TABLES_PER_SECTION) {
      return res.status(400).json({
        success: false,
        message: `${sectionName} section already has the maximum of ${MAX_TABLES_PER_SECTION} tables`
      });
    }

    const tableStatus = VALID_STATUSES.includes(status) ? status : 'available';

    const tableData = {
      tableNumber,
      capacity: capacity || 4,
      section: sectionName,
      status: tableStatus,
      bookedAt: null,
      outTime: null
    };

    if (tableStatus === 'reserved') {
      if (!inTime) {
        return res.status(400).json({
          success: false,
          message: 'inTime is required to create a table with Reserved status'
        });
      }
      const inDate = new Date(inTime);
      if (Number.isNaN(inDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid inTime' });
      }
      tableData.bookedAt = inDate;
      tableData.outTime = new Date(inDate.getTime() + DEFAULT_BOOKING_DURATION_HOURS * 60 * 60 * 1000);
    }

    const table = await Table.create(tableData);

    const io = req.app.get('io');
    if (io && tableStatus === 'reserved') {
      await notificationService.emitNotification(
        io,
        'table_status',
        'Table reserved',
        `Table ${table.tableNumber} was created and reserved until ${tableData.outTime.toLocaleString()}.`,
        { tableId: table.id, status: 'reserved' }
      );
    }

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

    // If the section is being changed, enforce the per-section cap
    if (req.body.section && req.body.section !== table.section) {
      const sectionCount = await Table.count({ where: { section: req.body.section } });
      if (sectionCount >= MAX_TABLES_PER_SECTION) {
        return res.status(400).json({
          success: false,
          message: `${req.body.section} section already has the maximum of ${MAX_TABLES_PER_SECTION} tables`
        });
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
// Body: { status, inTime? }
// - status = 'reserved' REQUIRES inTime (ISO datetime string). Out-time is
//   always computed automatically as inTime + DEFAULT_BOOKING_DURATION_HOURS
//   and the table flips back to 'available' on its own once that passes -
//   there is no manual "mark available" step for a reservation.
// - status = 'available' | 'maintenance' clears any booking window.
const updateTableStatus = async (req, res) => {
  try {
    await releaseExpiredTables(req);

    const { status, inTime } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    const previousStatus = table.status;
    const updateData = { status };

    if (status === 'reserved') {
      if (!inTime) {
        return res.status(400).json({ success: false, message: 'inTime is required to reserve a table' });
      }
      const inDate = new Date(inTime);
      if (Number.isNaN(inDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid inTime' });
      }
      updateData.bookedAt = inDate;
      updateData.outTime = new Date(inDate.getTime() + DEFAULT_BOOKING_DURATION_HOURS * 60 * 60 * 1000);
    } else {
      // available / maintenance don't carry a booking window
      updateData.bookedAt = null;
      updateData.outTime = null;
    }

    await table.update(updateData);
    const io = req.app.get('io');
    if (io && previousStatus !== status) {
      const title = status === 'reserved'
        ? 'Table reserved'
        : status === 'available'
          ? 'Table available'
          : `Table ${status}`;
      const message = status === 'reserved'
        ? `Table ${table.tableNumber} is reserved from ${updateData.bookedAt.toLocaleString()} to ${updateData.outTime.toLocaleString()}.`
        : `Table ${table.tableNumber} is now ${status}.`;
      await notificationService.emitNotification(
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
    await releaseExpiredTables(req);

    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
      FROM "Tables"
    `);

    // Per-section breakdown so the UI can show "Main: 6/10, VIP: 2/10" etc.
    const allTables = await Table.findAll();
    const sections = {};
    allTables.forEach((t) => {
      const key = t.section || 'Main';
      if (!sections[key]) sections[key] = { total: 0, available: 0, maxAllowed: MAX_TABLES_PER_SECTION };
      sections[key].total += 1;
      if (t.status === 'available') sections[key].available += 1;
    });

    res.status(200).json({ ...results[0], sections });
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
    await releaseExpiredTables(req);

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