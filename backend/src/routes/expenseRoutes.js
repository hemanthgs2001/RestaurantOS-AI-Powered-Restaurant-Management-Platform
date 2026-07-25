const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Import controllers
const expenseCategoryController = require('../controllers/expenseCategoryController');
const expenseRecordController = require('../controllers/expenseRecordController');
const supplierInvoiceController = require('../controllers/supplierInvoiceController');

// All routes require authentication
router.use(protect);

// ==================== EXPENSE CATEGORY ROUTES ====================
router.get('/expense-categories', expenseCategoryController.getAllCategories);
router.post('/expense-categories', authorize('owner', 'manager'), expenseCategoryController.createCategory);
router.put('/expense-categories/:id', authorize('owner', 'manager'), expenseCategoryController.updateCategory);
router.delete('/expense-categories/:id', authorize('owner', 'manager'), expenseCategoryController.deleteCategory);

// ==================== EXPENSE RECORD ROUTES ====================
router.get('/expense-records', expenseRecordController.getAllExpenses);
router.post('/expense-records', authorize('owner', 'manager', 'cashier'), expenseRecordController.createExpense);
router.put('/expense-records/:id', authorize('owner', 'manager'), expenseRecordController.updateExpense);
router.delete('/expense-records/:id', authorize('owner', 'manager'), expenseRecordController.deleteExpense);

// ==================== SUPPLIER INVOICE ROUTES ====================
router.get('/supplier-invoices', supplierInvoiceController.getAllInvoices);
router.post('/supplier-invoices', authorize('owner', 'manager', 'store_manager'), supplierInvoiceController.createInvoice);
router.put('/supplier-invoices/:id', authorize('owner', 'manager'), supplierInvoiceController.updateInvoice);
router.delete('/supplier-invoices/:id', authorize('owner', 'manager'), supplierInvoiceController.deleteInvoice);
router.patch('/supplier-invoices/:id/status', supplierInvoiceController.updateInvoiceStatus);

// ==================== MONTHLY EXPENSES ====================
router.get('/monthly-expenses', expenseRecordController.getMonthlyExpenses);

module.exports = router;