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

// AI Predictions
app.get('/api/ai/predictions', (req, res) => {
  res.json({
    stockPredictions: [
      {
        ingredient: "Tomatoes",
        currentStock: 50,
        predictedDemand: 45,
        daysUntilShortage: 5,
        recommendation: "Reorder within 3 days"
      },
      {
        ingredient: "Cheese",
        currentStock: 20,
        predictedDemand: 30,
        daysUntilShortage: 2,
        recommendation: "Urgent: Reorder immediately"
      },
      {
        ingredient: "Onions",
        currentStock: 30,
        predictedDemand: 25,
        daysUntilShortage: 7,
        recommendation: "Reorder within 5 days"
      }
    ],
    shortageAlerts: 1,
    menuPricing: [
      {
        menuItem: "Margherita Pizza",
        currentPrice: 12.99,
        recommendedPrice: 14.99,
        reason: "Ingredient cost increased by 15%"
      },
      {
        menuItem: "Caesar Salad",
        currentPrice: 8.99,
        recommendedPrice: 9.99,
        reason: "High demand"
      }
    ],
    prepTime: "15 minutes"
  });
});

app.get('/api/ai/predictions/stock', (req, res) => {
  res.json([
    {
      ingredient: "Tomatoes",
      currentStock: 50,
      predictedDemand: 45,
      daysUntilShortage: 5,
      recommendation: "Reorder within 3 days"
    },
    {
      ingredient: "Cheese",
      currentStock: 20,
      predictedDemand: 30,
      daysUntilShortage: 2,
      recommendation: "Urgent: Reorder immediately"
    },
    {
      ingredient: "Onions",
      currentStock: 30,
      predictedDemand: 25,
      daysUntilShortage: 7,
      recommendation: "Reorder within 5 days"
    }
  ]);
});

app.get('/api/ai/recommendations', (req, res) => {
  res.json({
    stockReorder: [
      { ingredient: "Tomatoes", quantity: 20 },
      { ingredient: "Cheese", quantity: 30 },
      { ingredient: "Onions", quantity: 15 }
    ],
    wasteReduction: [
      { ingredient: "Lettuce", reduction: 15 },
      { ingredient: "Bread", reduction: 10 }
    ]
  });
});

app.get('/api/ai/recommendations/menu-pricing', (req, res) => {
  res.json([
    {
      menuItem: "Margherita Pizza",
      category: "Pizza",
      currentPrice: 12.99,
      recommendedPrice: 14.99,
      reason: "Ingredient cost increased by 15%"
    },
    {
      menuItem: "Caesar Salad",
      category: "Salads",
      currentPrice: 8.99,
      recommendedPrice: 9.99,
      reason: "High demand"
    },
    {
      menuItem: "Pasta Carbonara",
      category: "Pasta",
      currentPrice: 15.99,
      recommendedPrice: 16.99,
      reason: "Ingredient cost increased"
    }
  ]);
});

// AI Invoice Processing
app.post('/api/ai/invoices/process', async (req, res) => {
  try {
    // Mock invoice processing
    const files = req.files || [];
    const results = [
      {
        id: "inv_1",
        invoiceNumber: "INV-001",
        supplier: "Supplier A",
        date: "2024-01-15",
        totalAmount: 150.00,
        status: "processed",
        items: [
          { description: "Item 1", quantity: 2, unitPrice: 25.00, total: 50.00 },
          { description: "Item 2", quantity: 1, unitPrice: 50.00, total: 50.00 }
        ]
      }
    ];
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/ai/invoices', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: "inv_1",
        invoiceNumber: "INV-001",
        supplier: "Supplier A",
        date: "2024-01-15",
        totalAmount: 150.00,
        status: "processed"
      }
    ],
    count: 1
  });
});

// API Routes
app.use('/api', routes);

// Error Handler
app.use(errorHandler);

module.exports = app;