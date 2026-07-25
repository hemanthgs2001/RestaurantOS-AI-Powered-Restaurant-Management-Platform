const path = require('path');
const fs = require('fs');
const { SupplierInvoice } = require('../models') || require('../models/SupplierInvoice');
const invoiceService = require('../services/invoiceService');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

async function uploadInvoices(req, res) {
  try {
    const files = req.files || [];
    const results = [];

    for (const f of files) {
      const dest = path.join(uploadDir, `${Date.now()}_${f.originalname}`);
      fs.renameSync(f.path, dest);

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
  } catch (err) {
    console.error('uploadInvoices error', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listInvoices(req, res) {
  try {
    const invoices = await SupplierInvoice.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: invoices, count: invoices.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getInvoice(req, res) {
  try {
    const { id } = req.params;
    const invoice = await SupplierInvoice.findByPk(id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function exportInvoiceExcel(req, res) {
  try {
    const { id } = req.params;
    const invoice = await SupplierInvoice.findByPk(id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Not found' });

    const XLSX = require('xlsx');
    const wb = XLSX.utils.book_new();

    const header = [['Invoice Number', 'Supplier', 'Date', 'Total']];
    const rows = [[invoice.invoiceNumber, invoice.extractedData.supplier || '', invoice.invoiceDate || '', invoice.totalAmount]];

    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Invoice');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.id}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  uploadInvoices,
  listInvoices,
  getInvoice,
  exportInvoiceExcel
};
