const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  instructions: {
    type: DataTypes.TEXT,
  },
  prepTime: {
    type: DataTypes.INTEGER,
  },
  cookTime: {
    type: DataTypes.INTEGER,
  },
  servings: {
    type: DataTypes.INTEGER,
  },
  yieldQuantity: {
    type: DataTypes.INTEGER,
  },
}, {
  timestamps: true,
});

module.exports = Recipe;