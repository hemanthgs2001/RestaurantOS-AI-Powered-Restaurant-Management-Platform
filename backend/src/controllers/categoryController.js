const Category = require('../models/Categoury');
const { sequelize } = require('../config/database');

// @desc    Get all categories
// @route   GET /api/inventory/categories
// @access  Private
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

// @desc    Get category by ID
// @route   GET /api/inventory/categories/:id
// @access  Private
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
};

// @desc    Create category
// @route   POST /api/inventory/categories
// @access  Private (Owner, Manager)
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    
    const category = await Category.create({
      name,
      description: description || ''
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

// @desc    Update category
// @route   PUT /api/inventory/categories/:id
// @access  Private (Owner, Manager)
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // If name is being changed, check for duplicates
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({ 
        where: { name: req.body.name } 
      });
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Category name already exists' });
      }
    }
    
    await category.update(req.body);
    res.status(200).json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

// @desc    Delete category
// @route   DELETE /api/inventory/categories/:id
// @access  Private (Owner, Manager)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    await category.destroy();
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};

// @desc    Get category count
// @route   GET /api/inventory/categories/count
// @access  Private
const getCategoryCount = async (req, res) => {
  try {
    const count = await Category.count();
    res.status(200).json({ count });
  } catch (error) {
    console.error('Get category count error:', error);
    res.status(500).json({ success: false, message: 'Failed to get category count' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryCount
};