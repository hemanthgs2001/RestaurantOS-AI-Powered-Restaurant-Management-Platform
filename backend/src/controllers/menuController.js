const Menu = require('../models/Menu');
const { sequelize } = require('../config/database');

// @desc    Get all menu items
// @route   GET /api/restaurant/menu
// @access  Private
const getAllMenuItems = async (req, res) => {
  try {
    const { category, isAvailable } = req.query;
    const where = {};
    
    if (category) where.category = category;
    if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';
    
    const items = await Menu.findAll({
      where,
      order: [['name', 'ASC']]
    });
    res.status(200).json(items);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch menu items' });
  }
};

// @desc    Get menu item by ID
// @route   GET /api/restaurant/menu/:id
// @access  Private
const getMenuItemById = async (req, res) => {
  try {
    const item = await Menu.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch menu item' });
  }
};

// @desc    Create menu item
// @route   POST /api/restaurant/menu
// @access  Private (Owner, Manager)
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable, preparationTime, calories } = req.body;
    
    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }
    
    const item = await Menu.create({
      name,
      description: description || '',
      price,
      category: category || 'General',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      preparationTime: preparationTime || 15,
      calories: calories || 0
    });
    
    res.status(201).json(item);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ success: false, message: 'Failed to create menu item' });
  }
};

// @desc    Update menu item
// @route   PUT /api/restaurant/menu/:id
// @access  Private (Owner, Manager)
const updateMenuItem = async (req, res) => {
  try {
    const item = await Menu.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    await item.update(req.body);
    res.status(200).json(item);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ success: false, message: 'Failed to update menu item' });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/restaurant/menu/:id
// @access  Private (Owner, Manager)
const deleteMenuItem = async (req, res) => {
  try {
    const item = await Menu.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    await item.destroy();
    res.status(200).json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete menu item' });
  }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/restaurant/menu/:id/availability
// @access  Private
const toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    if (isAvailable === undefined) {
      return res.status(400).json({ success: false, message: 'isAvailable is required' });
    }
    
    const item = await Menu.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    
    await item.update({ isAvailable });
    res.status(200).json(item);
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle availability' });
  }
};

// @desc    Get menu categories
// @route   GET /api/restaurant/menu/categories
// @access  Private
const getMenuCategories = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT DISTINCT category FROM "Menus" WHERE category IS NOT NULL ORDER BY category
    `);
    const categories = results.map(r => r.category);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Get menu categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch menu categories' });
  }
};

// @desc    Get menu statistics
// @route   GET /api/restaurant/menu/stats
// @access  Private
const getMenuStats = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN isAvailable = true THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN isAvailable = false THEN 1 ELSE 0 END) as unavailable,
        AVG(price) as avgPrice,
        MIN(price) as minPrice,
        MAX(price) as maxPrice
      FROM "Menus"
    `);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get menu stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch menu statistics' });
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getMenuCategories,
  getMenuStats
};