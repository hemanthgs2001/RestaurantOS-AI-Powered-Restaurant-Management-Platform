const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Import controllers
const tableController = require('../controllers/tableController');
const orderController = require('../controllers/orderController');
const menuController = require('../controllers/menuController');
const recipeController = require('../controllers/recipeController');
const ingredientController = require('../controllers/ingredientController');
const supplierController = require('../controllers/supplierController');
const staffController = require('../controllers/staffController');

// All routes require authentication
router.use(protect);

// ==================== TABLE ROUTES ====================
router.get('/tables', tableController.getAllTables);
router.post('/tables', authorize('owner', 'manager'), tableController.createTable);
router.put('/tables/:id', authorize('owner', 'manager'), tableController.updateTable);
router.delete('/tables/:id', authorize('owner', 'manager'), tableController.deleteTable);
router.patch('/tables/:id/status', tableController.updateTableStatus);

// ==================== ORDER ROUTES ====================
router.get('/orders', orderController.getAllOrders);
router.post('/orders', orderController.createOrder);
router.put('/orders/:id', authorize('owner', 'manager', 'chef'), orderController.updateOrder);
router.delete('/orders/:id', authorize('owner', 'manager'), orderController.deleteOrder);
router.patch('/orders/:id/status', orderController.updateOrderStatus);

// ==================== MENU ROUTES ====================
router.get('/menu', menuController.getAllMenuItems);
router.post('/menu', authorize('owner', 'manager'), menuController.createMenuItem);
router.put('/menu/:id', authorize('owner', 'manager'), menuController.updateMenuItem);
router.delete('/menu/:id', authorize('owner', 'manager'), menuController.deleteMenuItem);
router.patch('/menu/:id/availability', menuController.toggleAvailability);

// ==================== RECIPE ROUTES ====================
router.get('/recipes', recipeController.getAllRecipes);
router.post('/recipes', authorize('owner', 'manager', 'chef'), recipeController.createRecipe);
router.put('/recipes/:id', authorize('owner', 'manager', 'chef'), recipeController.updateRecipe);
router.delete('/recipes/:id', authorize('owner', 'manager'), recipeController.deleteRecipe);

// ==================== INGREDIENT ROUTES ====================
router.get('/ingredients', ingredientController.getAllIngredients);
router.post('/ingredients', authorize('owner', 'manager', 'store_manager'), ingredientController.createIngredient);
router.put('/ingredients/:id', authorize('owner', 'manager', 'store_manager'), ingredientController.updateIngredient);
router.delete('/ingredients/:id', authorize('owner', 'manager'), ingredientController.deleteIngredient);

// ==================== SUPPLIER ROUTES ====================
router.get('/suppliers', supplierController.getAllSuppliers);
router.post('/suppliers', authorize('owner', 'manager', 'store_manager'), supplierController.createSupplier);
router.put('/suppliers/:id', authorize('owner', 'manager', 'store_manager'), supplierController.updateSupplier);
router.delete('/suppliers/:id', authorize('owner', 'manager'), supplierController.deleteSupplier);

// ==================== STAFF ROUTES ====================
router.get('/staff', staffController.getAllStaff);
router.post('/staff', authorize('owner', 'manager'), staffController.createStaff);
router.put('/staff/:id', authorize('owner', 'manager'), staffController.updateStaff);
router.delete('/staff/:id', authorize('owner', 'manager'), staffController.deleteStaff);

module.exports = router;