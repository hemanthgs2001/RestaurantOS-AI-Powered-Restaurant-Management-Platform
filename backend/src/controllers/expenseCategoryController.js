const ExpenseCategory = require('../models/ExpenseCategory');
const { sequelize } = require('../config/database');

// @desc    Get all expense categories
// @route   GET /api/expense/expense-categories
// @access  Private
const getAllCategories = async (req, res) => {
  try {
    const categories = await ExpenseCategory.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Get expense categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expense categories' });
  }
};

// @desc    Get expense category by ID
// @route   GET /api/expense/expense-categories/:id
// @access  Private
const getCategoryById = async (req, res) => {
  try {
    const category = await ExpenseCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Get expense category error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expense category' });
  }
};

// @desc    Create expense category
// @route   POST /api/expense/expense-categories
// @access  Private (Owner, Manager)
const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    
    // Check if category already exists
    const existingCategory = await ExpenseCategory.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    
    const category = await ExpenseCategory.create({
      name,
      description: description || '',
      color: color || '#4F46E5'
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Create expense category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create expense category' });
  }
};

// @desc    Update expense category
// @route   PUT /api/expense/expense-categories/:id
// @access  Private (Owner, Manager)
const updateCategory = async (req, res) => {
  try {
    const category = await ExpenseCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // If name is being changed, check for duplicates
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await ExpenseCategory.findOne({ 
        where: { name: req.body.name } 
      });
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Category name already exists' });
      }
    }
    
    await category.update(req.body);
    res.status(200).json(category);
  } catch (error) {
    console.error('Update expense category error:', error);
    res.status(500).json({ success: false, message: 'Failed to update expense category' });
  }
};

// @desc    Delete expense category
// @route   DELETE /api/expense/expense-categories/:id
// @access  Private (Owner, Manager)
const deleteCategory = async (req, res) => {
  try {
    const category = await ExpenseCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    await category.destroy();
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete expense category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete expense category' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};