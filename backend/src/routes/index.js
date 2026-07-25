const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const expenseRoutes = require('./expenseRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const notificationRoutes = require('./notificationRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/restaurant', restaurantRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/expense', expenseRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/notifications', notificationRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'RestaurantOS API is running',
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;