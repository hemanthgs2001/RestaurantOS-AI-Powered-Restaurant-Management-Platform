const Warehouse = require('../models/Warehouse');
const { sequelize } = require('../config/database');

// @desc    Get all warehouses
// @route   GET /api/inventory/warehouses
// @access  Private
const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(warehouses);
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch warehouses' });
  }
};

// @desc    Get warehouse by ID
// @route   GET /api/inventory/warehouses/:id
// @access  Private
const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    res.status(200).json(warehouse);
  } catch (error) {
    console.error('Get warehouse error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch warehouse' });
  }
};

// @desc    Create warehouse
// @route   POST /api/inventory/warehouses
// @access  Private (Owner, Manager)
const createWarehouse = async (req, res) => {
  try {
    const { name, location, manager, capacity, isActive } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Warehouse name is required' });
    }
    
    const warehouse = await Warehouse.create({
      name,
      location: location || '',
      manager: manager || '',
      capacity: capacity || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    res.status(201).json(warehouse);
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({ success: false, message: 'Failed to create warehouse' });
  }
};

// @desc    Update warehouse
// @route   PUT /api/inventory/warehouses/:id
// @access  Private (Owner, Manager)
const updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    await warehouse.update(req.body);
    res.status(200).json(warehouse);
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({ success: false, message: 'Failed to update warehouse' });
  }
};

// @desc    Delete warehouse
// @route   DELETE /api/inventory/warehouses/:id
// @access  Private (Owner, Manager)
const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    await warehouse.destroy();
    res.status(200).json({ success: true, message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete warehouse' });
  }
};

// @desc    Toggle warehouse status
// @route   PATCH /api/inventory/warehouses/:id/status
// @access  Private
const toggleWarehouseStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (isActive === undefined) {
      return res.status(400).json({ success: false, message: 'isActive is required' });
    }
    
    const warehouse = await Warehouse.findByPk(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    
    await warehouse.update({ isActive });
    res.status(200).json(warehouse);
  } catch (error) {
    console.error('Toggle warehouse status error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle warehouse status' });
  }
};

module.exports = {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  toggleWarehouseStatus
};