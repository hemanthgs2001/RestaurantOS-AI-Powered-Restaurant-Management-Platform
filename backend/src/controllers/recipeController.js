const Recipe = require('../models/Recipe');
const { sequelize } = require('../config/database');

// @desc    Get all recipes
// @route   GET /api/restaurant/recipes
// @access  Private
const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recipes' });
  }
};

// @desc    Get recipe by ID
// @route   GET /api/restaurant/recipes/:id
// @access  Private
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    res.status(200).json(recipe);
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recipe' });
  }
};

// @desc    Create recipe
// @route   POST /api/restaurant/recipes
// @access  Private (Owner, Manager, Chef)
const createRecipe = async (req, res) => {
  try {
    const { name, description, instructions, prepTime, cookTime, servings, yieldQuantity } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Recipe name is required' });
    }
    
    const recipe = await Recipe.create({
      name,
      description: description || '',
      instructions: instructions || '',
      prepTime: prepTime || 0,
      cookTime: cookTime || 0,
      servings: servings || 1,
      yieldQuantity: yieldQuantity || 1
    });
    
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ success: false, message: 'Failed to create recipe' });
  }
};

// @desc    Update recipe
// @route   PUT /api/restaurant/recipes/:id
// @access  Private (Owner, Manager, Chef)
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    await recipe.update(req.body);
    res.status(200).json(recipe);
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ success: false, message: 'Failed to update recipe' });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/restaurant/recipes/:id
// @access  Private (Owner, Manager)
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    await recipe.destroy();
    res.status(200).json({ success: true, message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete recipe' });
  }
};

// @desc    Get recipes by search
// @route   GET /api/restaurant/recipes/search
// @access  Private
const searchRecipes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    
    const [results] = await sequelize.query(`
      SELECT * FROM "Recipes" 
      WHERE name ILIKE :query OR description ILIKE :query
      ORDER BY name ASC
    `, {
      replacements: { query: `%${q}%` }
    });
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Search recipes error:', error);
    res.status(500).json({ success: false, message: 'Failed to search recipes' });
  }
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  searchRecipes
};