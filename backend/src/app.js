const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');
const { Ingredient, Menu } = require('./models');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================
// AI Features - Directly in Node.js
// ============================================

const buildStockPrediction = (ingredient) => {
  const currentStock = parseFloat(ingredient.quantity) || 0;
  const reorderLevel = parseFloat(ingredient.reorderLevel) || 0;
  const predictedDemand = Math.max(Math.round(reorderLevel * 1.2) || 1, 1);
  const daysUntilShortage = currentStock <= reorderLevel
    ? 1
    : Math.max(1, Math.round((currentStock - reorderLevel) / Math.max(reorderLevel / 3, 1)));
  const recommendation = currentStock <= reorderLevel
    ? 'Reorder immediately'
    : currentStock <= reorderLevel * 1.5
      ? 'Reorder soon'
      : 'Stock level is healthy';

  return {
    ingredient: ingredient.name,
    currentStock,
    predictedDemand,
    daysUntilShortage,
    recommendation,
  };
};

const buildMenuPricingRecommendation = (menuItem, categoryAverages) => {
  const currentPrice = parseFloat(menuItem.price) || 0;
  const category = menuItem.category || 'Uncategorized';
  const avgPrice = categoryAverages[category] || currentPrice;
  let recommendedPrice = currentPrice;
  let reason = 'Price is aligned with category average';

  if (currentPrice < avgPrice * 0.9) {
    recommendedPrice = parseFloat((avgPrice * 0.95).toFixed(2));
    reason = 'Below category average, consider raising price';
  } else if (currentPrice > avgPrice * 1.2) {
    recommendedPrice = currentPrice;
    reason = 'Price is stronger than category average';
  } else if (currentPrice === avgPrice) {
    reason = 'Pricing is balanced for the category';
  } else {
    recommendedPrice = parseFloat(currentPrice.toFixed(2));
    reason = 'Price is close to category average';
  }

  return {
    menuItem: menuItem.name,
    category,
    currentPrice,
    recommendedPrice,
    preparationTime: menuItem.preparationTime || 0,
    reason,
  };
};

const calculateCategoryAverages = (menuItems) => {
  const totals = {};
  const counts = {};

  menuItems.forEach((item) => {
    const category = item.category || 'Uncategorized';
    const price = parseFloat(item.price) || 0;
    totals[category] = (totals[category] || 0) + price;
    counts[category] = (counts[category] || 0) + 1;
  });

  const averages = {};
  Object.keys(totals).forEach((category) => {
    averages[category] = totals[category] / counts[category];
  });
  return averages;
};

app.get('/api/ai/predictions', async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({ attributes: ['name', 'quantity', 'reorderLevel'] });
    const menuItems = await Menu.findAll({ attributes: ['name', 'category', 'price', 'preparationTime'] });

    const stockPredictions = ingredients.map(buildStockPrediction);
    const shortageAlerts = stockPredictions.filter((item) => item.daysUntilShortage <= 2).length;
    const categoryAverages = calculateCategoryAverages(menuItems);
    const menuPricing = menuItems.map((item) => buildMenuPricingRecommendation(item, categoryAverages));

    const avgPrepTime = menuItems.length > 0
      ? Math.round(menuItems.reduce((sum, item) => sum + (item.preparationTime || 0), 0) / menuItems.length)
      : 15;

    res.json({
      stockPredictions,
      shortageAlerts,
      menuPricing,
      prepTime: `${avgPrepTime} minutes`,
    });
  } catch (error) {
    console.error('AI predictions error:', error);
    res.status(500).json({ message: 'Failed to generate AI predictions' });
  }
});

app.get('/api/ai/predictions/stock', async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({ attributes: ['name', 'quantity', 'reorderLevel'] });
    const stockPredictions = ingredients.map(buildStockPrediction);
    res.json(stockPredictions);
  } catch (error) {
    console.error('AI stock predictions error:', error);
    res.status(500).json({ message: 'Failed to fetch stock predictions' });
  }
});

app.get('/api/ai/recommendations', async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({ attributes: ['name', 'quantity', 'reorderLevel'] });
    const stockReorder = ingredients
      .filter((ingredient) => parseFloat(ingredient.quantity) < parseFloat(ingredient.reorderLevel))
      .map((ingredient) => ({
        ingredient: ingredient.name,
        quantity: Math.max(Math.round((parseFloat(ingredient.reorderLevel) * 1.5) - parseFloat(ingredient.quantity)), 1),
      }));

    const wasteReduction = ingredients
      .filter((ingredient) => parseFloat(ingredient.quantity) > parseFloat(ingredient.reorderLevel) * 2)
      .map((ingredient) => ({
        ingredient: ingredient.name,
        reduction: Math.min(50, Math.round(((parseFloat(ingredient.quantity) - parseFloat(ingredient.reorderLevel)) / parseFloat(ingredient.quantity)) * 100)),
      }));

    res.json({ stockReorder, wasteReduction });
  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({ message: 'Failed to fetch AI recommendations' });
  }
});

app.get('/api/ai/recommendations/menu-pricing', async (req, res) => {
  try {
    const menuItems = await Menu.findAll({ attributes: ['name', 'category', 'price', 'preparationTime'] });
    const categoryAverages = calculateCategoryAverages(menuItems);
    const recommendations = menuItems.map((item) => buildMenuPricingRecommendation(item, categoryAverages));
    res.json(recommendations);
  } catch (error) {
    console.error('AI menu pricing recommendations error:', error);
    res.status(500).json({ message: 'Failed to fetch menu pricing recommendations' });
  }
});

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const invoiceService = require('./services/invoiceService');
const SupplierInvoice = require('./models/SupplierInvoice');

// AI Invoice Processing (real implementation)
app.post('/api/ai/invoices/process', upload.array('invoices'), async (req, res) => {
  try {
    const files = req.files || [];
    const results = [];

    for (const f of files) {
      const dest = f.path; // already saved by multer
      const extracted = await invoiceService.processFile(dest, f.mimetype);

      // Save to DB
      const invoice = await SupplierInvoice.create({
        invoiceNumber: extracted.invoiceNumber || f.originalname,
        invoiceDate: extracted.invoiceDate || null,
        totalAmount: extracted.totalAmount || 0,
        filePath: dest,
        extractedData: extracted
      });

      results.push(invoice);
    }

    res.json({ success: true, data: results, count: results.length });
  } catch (error) {
    console.error('AI invoice processing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/ai/invoices', async (req, res) => {
  try {
    const invoices = await SupplierInvoice.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: invoices, count: invoices.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API Routes
app.use('/api', routes);

// Error Handler
app.use(errorHandler);

module.exports = app;