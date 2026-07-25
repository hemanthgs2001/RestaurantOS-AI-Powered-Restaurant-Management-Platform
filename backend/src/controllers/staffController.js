const Staff = require('../models/Staff');
const { sequelize } = require('../config/database');

// @desc    Get all staff
// @route   GET /api/restaurant/staff
// @access  Private
const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff' });
  }
};

// @desc    Get staff by ID
// @route   GET /api/restaurant/staff/:id
// @access  Private
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.status(200).json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff' });
  }
};

// @desc    Create staff
// @route   POST /api/restaurant/staff
// @access  Private (Owner, Manager)
const createStaff = async (req, res) => {
  try {
    const { name, position, email, phone, hireDate, salary, shift, isActive } = req.body;
    
    if (!name || !position) {
      return res.status(400).json({ success: false, message: 'Name and position are required' });
    }
    
    const staff = await Staff.create({
      name,
      position,
      email: email || '',
      phone: phone || '',
      hireDate: hireDate || new Date(),
      salary: salary || 0,
      shift: shift || 'Flexible',
      isActive: isActive !== undefined ? isActive : true
    });
    
    res.status(201).json(staff);
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to create staff' });
  }
};

// @desc    Update staff
// @route   PUT /api/restaurant/staff/:id
// @access  Private (Owner, Manager)
const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    await staff.update(req.body);
    res.status(200).json(staff);
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to update staff' });
  }
};

// @desc    Delete staff
// @route   DELETE /api/restaurant/staff/:id
// @access  Private (Owner, Manager)
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    await staff.destroy();
    res.status(200).json({ success: true, message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete staff' });
  }
};

// @desc    Get staff by position
// @route   GET /api/restaurant/staff/position/:position
// @access  Private
const getStaffByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    const staff = await Staff.findAll({
      where: { position, isActive: true },
      order: [['name', 'ASC']]
    });
    res.status(200).json(staff);
  } catch (error) {
    console.error('Get staff by position error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff' });
  }
};

// @desc    Get staff statistics
// @route   GET /api/restaurant/staff/stats
// @access  Private
const getStaffStats = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN isActive = true THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN isActive = false THEN 1 ELSE 0 END) as inactive,
        AVG(salary) as avgSalary,
        COUNT(DISTINCT position) as positionCount
      FROM "Staffs"
    `);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get staff stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff statistics' });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffByPosition,
  getStaffStats
};