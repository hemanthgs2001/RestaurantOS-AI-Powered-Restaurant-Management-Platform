const Ingredient = require('../models/Ingredient');
const { sequelize } = require('../config/database');

// @desc    Get all ingredients
// @route   GET /api/restaurant/ingredients
// @access  Private
const getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(ingredients);
  } catch (error) {
    console.error('Get ingredients error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ingredients' });
  }
};

// @desc    Get ingredient by ID
// @route   GET /api/restaurant/ingredients/:id
// @access  Private
const getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    res.status(200).json(ingredient);
  } catch (error) {
    console.error('Get ingredient error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ingredient' });
  }
};

// @desc    Create ingredient
// @route   POST /api/restaurant/ingredients
// @access  Private (Owner, Manager, Store Manager)
const createIngredient = async (req, res) => {
  try {
    const { name, unit, quantity, reorderLevel, unitPrice } = req.body;
    
    if (!name || !unit) {
      return res.status(400).json({ success: false, message: 'Name and unit are required' });
    }
    
    const ingredient = await Ingredient.create({
      name,
      unit,
      quantity: quantity || 0,
      reorderLevel: reorderLevel || 10,
      unitPrice: unitPrice || 0
    });
    
    res.status(201).json(ingredient);
  } catch (error) {
    console.error('Create ingredient error:', error);
    res.status(500).json({ success: false, message: 'Failed to create ingredient' });
  }
};

// @desc    Update ingredient
// @route   PUT /api/restaurant/ingredients/:id
// @access  Private (Owner, Manager, Store Manager)
const updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    await ingredient.update(req.body);
    res.status(200).json(ingredient);
  } catch (error) {
    console.error('Update ingredient error:', error);
    res.status(500).json({ success: false, message: 'Failed to update ingredient' });
  }
};

// @desc    Delete ingredient
// @route   DELETE /api/restaurant/ingredients/:id
// @access  Private (Owner, Manager)
const deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    await ingredient.destroy();
    res.status(200).json({ success: true, message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Delete ingredient error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete ingredient' });
  }
};

// @desc    Get low stock ingredients
// @route   GET /api/restaurant/ingredients/low-stock
// @access  Private
const getLowStockIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({
      where: sequelize.literal('quantity <= reorderLevel'),
      order: [['quantity', 'ASC']]
    });
    res.status(200).json(ingredients);
  } catch (error) {
    console.error('Get low stock ingredients error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch low stock ingredients' });
  }
};

// @desc    Update ingredient quantity
// @route   PATCH /api/restaurant/ingredients/:id/quantity
// @access  Private
const updateIngredientQuantity = async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    if (quantity === undefined || !operation) {
      return res.status(400).json({ success: false, message: 'Quantity and operation are required' });
    }
    
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    
    let newQuantity;
    if (operation === 'add') {
      newQuantity = parseFloat(ingredient.quantity) + parseFloat(quantity);
    } else if (operation === 'subtract') {
      newQuantity = parseFloat(ingredient.quantity) - parseFloat(quantity);
      if (newQuantity < 0) {
        return res.status(400).json({ success: false, message: 'Insufficient quantity' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid operation. Use "add" or "subtract"' });
    }
    
    await ingredient.update({ quantity: newQuantity });
    res.status(200).json(ingredient);
  } catch (error) {
    console.error('Update ingredient quantity error:', error);
    res.status(500).json({ success: false, message: 'Failed to update ingredient quantity' });
  }
};

module.exports = {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getLowStockIngredients,
  updateIngredientQuantity
};