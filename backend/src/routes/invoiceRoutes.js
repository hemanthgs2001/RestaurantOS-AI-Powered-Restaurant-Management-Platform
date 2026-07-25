const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const invoiceController = require('../controllers/invoiceController');

// Upload one or more invoice files
router.post('/upload', upload.array('files'), invoiceController.uploadInvoices);
router.get('/', invoiceController.listInvoices);
router.get('/:id', invoiceController.getInvoice);
router.get('/:id/export', invoiceController.exportInvoiceExcel);

module.exports = router;
