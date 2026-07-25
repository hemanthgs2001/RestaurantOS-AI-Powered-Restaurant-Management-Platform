const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getSalesOverview, 
  getMonthlyExpenses 
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/sales', getSalesOverview);
router.get('/monthly-expenses', getMonthlyExpenses);

module.exports = router;