const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Import controllers
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const warehouseController = require('../controllers/warehouseController');
const stockController = require('../controllers/stockController');
const purchaseOrderController = require('../controllers/purchaseOrderController');

// All routes require authentication
router.use(protect);

// ==================== PRODUCT ROUTES ====================
router.get('/products', productController.getAllProducts);
router.post('/products', authorize('owner', 'manager', 'store_manager'), productController.createProduct);
router.put('/products/:id', authorize('owner', 'manager', 'store_manager'), productController.updateProduct);
router.delete('/products/:id', authorize('owner', 'manager'), productController.deleteProduct);

// ==================== CATEGORY ROUTES ====================
router.get('/categories', categoryController.getAllCategories);
router.post('/categories', authorize('owner', 'manager'), categoryController.createCategory);
router.put('/categories/:id', authorize('owner', 'manager'), categoryController.updateCategory);
router.delete('/categories/:id', authorize('owner', 'manager'), categoryController.deleteCategory);

// ==================== WAREHOUSE ROUTES ====================
router.get('/warehouses', warehouseController.getAllWarehouses);
router.post('/warehouses', authorize('owner', 'manager'), warehouseController.createWarehouse);
router.put('/warehouses/:id', authorize('owner', 'manager'), warehouseController.updateWarehouse);
router.delete('/warehouses/:id', authorize('owner', 'manager'), warehouseController.deleteWarehouse);

// ==================== STOCK ROUTES ====================
router.get('/stock', stockController.getAllStock);
router.post('/stock/in', authorize('owner', 'manager', 'store_manager'), stockController.stockIn);
router.post('/stock/out', authorize('owner', 'manager', 'store_manager'), stockController.stockOut);
router.get('/stock/transactions', stockController.getStockTranscations);

// ==================== PURCHASE ORDER ROUTES ====================
router.get('/purchase-orders', purchaseOrderController.getAllPurchaseOrders);
router.post('/purchase-orders', authorize('owner', 'manager', 'store_manager'), purchaseOrderController.createPurchaseOrder);
router.put('/purchase-orders/:id', authorize('owner', 'manager', 'store_manager'), purchaseOrderController.updatePurchaseOrder);
router.delete('/purchase-orders/:id', authorize('owner', 'manager'), purchaseOrderController.deletePurchaseOrder);
router.patch('/purchase-orders/:id/status', purchaseOrderController.updatePurchaseOrderStatus);

module.exports = router;