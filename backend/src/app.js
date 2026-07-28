// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const compression = require('compression');
// const morgan = require('morgan');
// const dotenv = require('dotenv');
// const fs = require('fs');

// dotenv.config();

// const routes = require('./routes');
// const errorHandler = require('./middleware/errorHandler');
// const { connectDB } = require('./config/database');
// const { Ingredient, Menu } = require('./models');

// const app = express();

// // Connect to database
// connectDB();

// // Middleware
// app.use(helmet());
// app.use(cors());
// app.use(compression());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// // Health check
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // ============================================
// // AI Features - Directly in Node.js
// // ============================================

// const buildStockPrediction = (ingredient) => {
//   const currentStock = parseFloat(ingredient.quantity) || 0;
//   const reorderLevel = parseFloat(ingredient.reorderLevel) || 0;
//   const predictedDemand = Math.max(Math.round(reorderLevel * 1.2) || 1, 1);
//   const daysUntilShortage = currentStock <= reorderLevel
//     ? 1
//     : Math.max(1, Math.round((currentStock - reorderLevel) / Math.max(reorderLevel / 3, 1)));
//   const recommendation = currentStock <= reorderLevel
//     ? 'Reorder immediately'
//     : currentStock <= reorderLevel * 1.5
//       ? 'Reorder soon'
//       : 'Stock level is healthy';

//   return {
//     ingredient: ingredient.name,
//     currentStock,
//     predictedDemand,
//     daysUntilShortage,
//     recommendation,
//   };
// };

// const buildMenuPricingRecommendation = (menuItem, categoryAverages) => {
//   const currentPrice = parseFloat(menuItem.price) || 0;
//   const category = menuItem.category || 'Uncategorized';
//   const avgPrice = categoryAverages[category] || currentPrice;
//   let recommendedPrice = currentPrice;
//   let reason = 'Price is aligned with category average';

//   if (currentPrice < avgPrice * 0.9) {
//     recommendedPrice = parseFloat((avgPrice * 0.95).toFixed(2));
//     reason = 'Below category average, consider raising price';
//   } else if (currentPrice > avgPrice * 1.2) {
//     recommendedPrice = currentPrice;
//     reason = 'Price is stronger than category average';
//   } else if (currentPrice === avgPrice) {
//     reason = 'Pricing is balanced for the category';
//   } else {
//     recommendedPrice = parseFloat(currentPrice.toFixed(2));
//     reason = 'Price is close to category average';
//   }

//   return {
//     menuItem: menuItem.name,
//     category,
//     currentPrice,
//     recommendedPrice,
//     preparationTime: menuItem.preparationTime || 0,
//     reason,
//   };
// };

// const calculateCategoryAverages = (menuItems) => {
//   const totals = {};
//   const counts = {};

//   menuItems.forEach((item) => {
//     const category = item.category || 'Uncategorized';
//     const price = parseFloat(item.price) || 0;
//     totals[category] = (totals[category] || 0) + price;
//     counts[category] = (counts[category] || 0) + 1;
//   });

//   const averages = {};
//   Object.keys(totals).forEach((category) => {
//     averages[category] = totals[category] / counts[category];
//   });
//   return averages;
// };

// app.get('/api/ai/predictions', async (req, res) => {
//   try {
//     const ingredients = await Ingredient.findAll({ attributes: ['name', 'quantity', 'reorderLevel'] });
//     const menuItems = await Menu.findAll({ attributes: ['name', 'category', 'price', 'preparationTime'] });

//     const stockPredictions = ingredients.map(buildStockPrediction);
//     const shortageAlerts = stockPredictions.filter((item) => item.daysUntilShortage <= 2).length;
//     const categoryAverages = calculateCategoryAverages(menuItems);
//     const menuPricing = menuItems.map((item) => buildMenuPricingRecommendation(item, categoryAverages));

//     const avgPrepTime = menuItems.length > 0
//       ? Math.round(menuItems.reduce((sum, item) => sum + (item.preparationTime || 0), 0) / menuItems.length)
//       : 15;

//     res.json({
//       stockPredictions,
//       shortageAlerts,
//       menuPricing,
//       prepTime: `${avgPrepTime} minutes`,
//     });
//   } catch (error) {
//     console.error('AI predictions error:', error);
//     res.status(500).json({ message: 'Failed to generate AI predictions' });
//   }
// });

// app.get('/api/ai/predictions/stock', async (req, res) => {
//   try {
//     const ingredients = await Ingredient.findAll({ attributes: ['name', 'quantity', 'reorderLevel'] });
//     const stockPredictions = ingredients.map(buildStockPrediction);
//     res.json(stockPredictions);
//   } catch (error) {
//     console.error('AI stock predictions error:', error);
//     res.status(500).json({ message: 'Failed to fetch stock predictions' });
//   }
// });

// app.get('/api/ai/recommendations', async (req, res) => {
//   try {
//     const ingredients = await Ingredient.findAll({ attributes: ['name', 'quantity', 'reorderLevel'] });
//     const stockReorder = ingredients
//       .filter((ingredient) => parseFloat(ingredient.quantity) < parseFloat(ingredient.reorderLevel))
//       .map((ingredient) => ({
//         ingredient: ingredient.name,
//         quantity: Math.max(Math.round((parseFloat(ingredient.reorderLevel) * 1.5) - parseFloat(ingredient.quantity)), 1),
//       }));

//     const wasteReduction = ingredients
//       .filter((ingredient) => parseFloat(ingredient.quantity) > parseFloat(ingredient.reorderLevel) * 2)
//       .map((ingredient) => ({
//         ingredient: ingredient.name,
//         reduction: Math.min(50, Math.round(((parseFloat(ingredient.quantity) - parseFloat(ingredient.reorderLevel)) / parseFloat(ingredient.quantity)) * 100)),
//       }));

//     res.json({ stockReorder, wasteReduction });
//   } catch (error) {
//     console.error('AI recommendations error:', error);
//     res.status(500).json({ message: 'Failed to fetch AI recommendations' });
//   }
// });

// app.get('/api/ai/recommendations/menu-pricing', async (req, res) => {
//   try {
//     const menuItems = await Menu.findAll({ attributes: ['name', 'category', 'price', 'preparationTime'] });
//     const categoryAverages = calculateCategoryAverages(menuItems);
//     const recommendations = menuItems.map((item) => buildMenuPricingRecommendation(item, categoryAverages));
//     res.json(recommendations);
//   } catch (error) {
//     console.error('AI menu pricing recommendations error:', error);
//     res.status(500).json({ message: 'Failed to fetch menu pricing recommendations' });
//   }
// });

// // ============================================
// // AI Invoice Processing (real implementation)
// // ============================================

// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
// const invoiceService = require('./services/invoiceService');
// const SupplierInvoice = require('./models/SupplierInvoice');

// // Maps a SupplierInvoice DB row onto the shape the frontend already expects
// // (supplier / tax / status), decoupling the UI from the real column names
// // (supplierName / taxAmount / extractionStatus).
// function serializeInvoice(invoice) {
//   const plain = invoice.toJSON ? invoice.toJSON() : invoice;
//   return {
//     id: plain.id,
//     invoiceNumber: plain.invoiceNumber,
//     supplier: plain.supplierName,
//     billTo: plain.billTo,
//     invoiceDate: plain.invoiceDate,
//     paymentMethod: plain.paymentMethod,
//     subtotal: plain.subtotal,
//     tax: plain.taxAmount,
//     totalAmount: plain.totalAmount,
//     isHandwritten: plain.isHandwritten,
//     items: plain.items || [],
//     status: plain.extractionStatus, // 'processed' | 'failed'
//     notes: plain.notes,
//     originalFileName: plain.originalFileName,
//     filePath: plain.filePath,
//     createdAt: plain.createdAt,
//   };
// }

// app.post('/api/ai/invoices/process', upload.array('invoices'), async (req, res) => {
//   try {
//     const files = req.files || [];

//     if (files.length === 0) {
//       return res.status(400).json({ success: false, message: 'No files were uploaded' });
//     }

//     const results = [];
//     const failures = [];

//     // Process sequentially so one bad file can't crash the whole batch, and
//     // pace requests so a multi-file batch doesn't trip the free-tier
//     // requests-per-minute limit (invoiceService.js also auto-retries any
//     // 429 that slips through anyway).
//     const DELAY_BETWEEN_FILES_MS = 4000;

//     for (let i = 0; i < files.length; i += 1) {
//       const file = files[i];
//       const dest = file.path; // already saved on disk by multer

//       if (i > 0) {
//         await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_FILES_MS));
//       }

//       try {
//         const extracted = await invoiceService.processFile(dest, file.mimetype, file.originalname);

//         const invoice = await SupplierInvoice.create({
//           invoiceNumber: extracted.invoiceNumber,
//           supplierName: extracted.supplier,
//           billTo: extracted.billTo,
//           invoiceDate: extracted.invoiceDate,
//           paymentMethod: extracted.paymentMethod,
//           subtotal: extracted.subtotal,
//           taxAmount: extracted.tax,
//           totalAmount: extracted.totalAmount,
//           isHandwritten: extracted.isHandwritten,
//           items: extracted.items,
//           extractionStatus: 'processed',
//           originalFileName: file.originalname,
//           filePath: dest,
//           extractedData: extracted.extractedData,
//         });

//         results.push(serializeInvoice(invoice));
//       } catch (extractionError) {
//         console.error(`Invoice extraction failed for ${file.originalname}:`, extractionError);

//         // Persist a failed record too, so it's visible in the table with a
//         // reason instead of silently vanishing.
//         const failedInvoice = await SupplierInvoice.create({
//           invoiceNumber: file.originalname,
//           originalFileName: file.originalname,
//           filePath: dest,
//           extractionStatus: 'failed',
//           notes: extractionError.message || 'Extraction failed',
//         });

//         results.push(serializeInvoice(failedInvoice));
//         failures.push({ file: file.originalname, message: extractionError.message || 'Extraction failed' });
//       }
//     }

//     res.json({
//       success: true,
//       data: results,
//       count: results.length,
//       failures,
//     });
//   } catch (error) {
//     console.error('AI invoice processing error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// app.get('/api/ai/invoices', async (req, res) => {
//   try {
//     const invoices = await SupplierInvoice.findAll({ order: [['createdAt', 'DESC']] });
//     res.json({ success: true, data: invoices.map(serializeInvoice), count: invoices.length });
//   } catch (err) {
//     console.error('Fetch invoices error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.delete('/api/ai/invoices/:id', async (req, res) => {
//   try {
//     const invoice = await SupplierInvoice.findByPk(req.params.id);
//     if (!invoice) {
//       return res.status(404).json({ success: false, message: 'Invoice not found' });
//     }

//     // Best-effort cleanup of the uploaded file on disk; DB delete still
//     // proceeds even if the file is already gone.
//     if (invoice.filePath) {
//       fs.unlink(invoice.filePath, (err) => {
//         if (err) console.warn(`Could not remove file ${invoice.filePath}:`, err.message);
//       });
//     }

//     await invoice.destroy();
//     res.json({ success: true, id: req.params.id });
//   } catch (err) {
//     console.error('Delete invoice error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Matches the frontend's generateExpenseRegister() call to /ai/invoices/export
// app.post('/api/ai/invoices/export', async (req, res) => {
//   try {
//     const ExcelJS = require('exceljs');
//     const invoices = Array.isArray(req.body?.invoices) ? req.body.invoices : [];

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet('Expense Register');

//     sheet.columns = [
//       { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
//       { header: 'Supplier', key: 'supplier', width: 25 },
//       { header: 'Bill To', key: 'billTo', width: 25 },
//       { header: 'Date', key: 'invoiceDate', width: 15 },
//       { header: 'Payment Method', key: 'paymentMethod', width: 18 },
//       { header: 'Subtotal', key: 'subtotal', width: 14 },
//       { header: 'Tax', key: 'tax', width: 12 },
//       { header: 'Total Amount', key: 'totalAmount', width: 14 },
//       { header: 'Handwritten', key: 'isHandwritten', width: 12 },
//       { header: 'Status', key: 'status', width: 12 },
//     ];
//     sheet.getRow(1).font = { bold: true };

//     invoices.forEach((inv) => {
//       sheet.addRow({
//         invoiceNumber: inv.invoiceNumber || '—',
//         supplier: inv.supplier || '—',
//         billTo: inv.billTo || '—',
//         invoiceDate: inv.invoiceDate || '—',
//         paymentMethod: inv.paymentMethod || '—',
//         subtotal: Number(inv.subtotal) || 0,
//         tax: Number(inv.tax) || 0,
//         totalAmount: Number(inv.totalAmount) || 0,
//         isHandwritten: inv.isHandwritten ? 'Yes' : 'No',
//         status: inv.status || 'processed',
//       });
//     });

//     const totalRow = sheet.addRow({
//       invoiceNumber: '',
//       supplier: '',
//       billTo: '',
//       invoiceDate: '',
//       paymentMethod: 'TOTAL',
//       subtotal: { formula: `SUM(F2:F${invoices.length + 1})` },
//       tax: { formula: `SUM(G2:G${invoices.length + 1})` },
//       totalAmount: { formula: `SUM(H2:H${invoices.length + 1})` },
//     });
//     totalRow.font = { bold: true };

//     res.setHeader(
//       'Content-Type',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     );
//     res.setHeader('Content-Disposition', 'attachment; filename=expense-register.xlsx');

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error('Expense register export error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // API Routes
// app.use('/api', routes);

// // Error Handler
// app.use(errorHandler);

// module.exports = app;



const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');
const { Ingredient, Menu } = require('./models');

const app = express();

// Connect to database
connectDB();

// ============================================
// CORS - restricted to your actual frontend URL(s)
// ============================================
// Previously app.use(cors()) allowed ANY origin, which isn't secure for
// production. This now only allows requests from your Vercel frontend
// (and localhost while you're developing).
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_DEV,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean); // removes any undefined/empty entries

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl, mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS blocked request from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Middleware
app.use(helmet());
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

// ============================================
// AI Invoice Processing (real implementation)
// ============================================

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const invoiceService = require('./services/invoiceService');
const SupplierInvoice = require('./models/SupplierInvoice');

// Maps a SupplierInvoice DB row onto the shape the frontend already expects
// (supplier / tax / status), decoupling the UI from the real column names
// (supplierName / taxAmount / extractionStatus).
function serializeInvoice(invoice) {
  const plain = invoice.toJSON ? invoice.toJSON() : invoice;
  return {
    id: plain.id,
    invoiceNumber: plain.invoiceNumber,
    supplier: plain.supplierName,
    billTo: plain.billTo,
    invoiceDate: plain.invoiceDate,
    paymentMethod: plain.paymentMethod,
    subtotal: plain.subtotal,
    tax: plain.taxAmount,
    totalAmount: plain.totalAmount,
    isHandwritten: plain.isHandwritten,
    items: plain.items || [],
    status: plain.extractionStatus, // 'processed' | 'failed'
    notes: plain.notes,
    originalFileName: plain.originalFileName,
    filePath: plain.filePath,
    createdAt: plain.createdAt,
  };
}

app.post('/api/ai/invoices/process', upload.array('invoices'), async (req, res) => {
  try {
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files were uploaded' });
    }

    const results = [];
    const failures = [];

    // Process sequentially so one bad file can't crash the whole batch, and
    // pace requests so a multi-file batch doesn't trip the free-tier
    // requests-per-minute limit (invoiceService.js also auto-retries any
    // 429 that slips through anyway).
    const DELAY_BETWEEN_FILES_MS = 4000;

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const dest = file.path; // already saved on disk by multer

      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_FILES_MS));
      }

      try {
        const extracted = await invoiceService.processFile(dest, file.mimetype, file.originalname);

        const invoice = await SupplierInvoice.create({
          invoiceNumber: extracted.invoiceNumber,
          supplierName: extracted.supplier,
          billTo: extracted.billTo,
          invoiceDate: extracted.invoiceDate,
          paymentMethod: extracted.paymentMethod,
          subtotal: extracted.subtotal,
          taxAmount: extracted.tax,
          totalAmount: extracted.totalAmount,
          isHandwritten: extracted.isHandwritten,
          items: extracted.items,
          extractionStatus: 'processed',
          originalFileName: file.originalname,
          filePath: dest,
          extractedData: extracted.extractedData,
        });

        results.push(serializeInvoice(invoice));
      } catch (extractionError) {
        console.error(`Invoice extraction failed for ${file.originalname}:`, extractionError);

        // Persist a failed record too, so it's visible in the table with a
        // reason instead of silently vanishing.
        const failedInvoice = await SupplierInvoice.create({
          invoiceNumber: file.originalname,
          originalFileName: file.originalname,
          filePath: dest,
          extractionStatus: 'failed',
          notes: extractionError.message || 'Extraction failed',
        });

        results.push(serializeInvoice(failedInvoice));
        failures.push({ file: file.originalname, message: extractionError.message || 'Extraction failed' });
      }
    }

    res.json({
      success: true,
      data: results,
      count: results.length,
      failures,
    });
  } catch (error) {
    console.error('AI invoice processing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/ai/invoices', async (req, res) => {
  try {
    const invoices = await SupplierInvoice.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: invoices.map(serializeInvoice), count: invoices.length });
  } catch (err) {
    console.error('Fetch invoices error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/ai/invoices/:id', async (req, res) => {
  try {
    const invoice = await SupplierInvoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Best-effort cleanup of the uploaded file on disk; DB delete still
    // proceeds even if the file is already gone.
    if (invoice.filePath) {
      fs.unlink(invoice.filePath, (err) => {
        if (err) console.warn(`Could not remove file ${invoice.filePath}:`, err.message);
      });
    }

    await invoice.destroy();
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error('Delete invoice error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Matches the frontend's generateExpenseRegister() call to /ai/invoices/export
app.post('/api/ai/invoices/export', async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const invoices = Array.isArray(req.body?.invoices) ? req.body.invoices : [];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Expense Register');

    sheet.columns = [
      { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
      { header: 'Supplier', key: 'supplier', width: 25 },
      { header: 'Bill To', key: 'billTo', width: 25 },
      { header: 'Date', key: 'invoiceDate', width: 15 },
      { header: 'Payment Method', key: 'paymentMethod', width: 18 },
      { header: 'Subtotal', key: 'subtotal', width: 14 },
      { header: 'Tax', key: 'tax', width: 12 },
      { header: 'Total Amount', key: 'totalAmount', width: 14 },
      { header: 'Handwritten', key: 'isHandwritten', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
    ];
    sheet.getRow(1).font = { bold: true };

    invoices.forEach((inv) => {
      sheet.addRow({
        invoiceNumber: inv.invoiceNumber || '—',
        supplier: inv.supplier || '—',
        billTo: inv.billTo || '—',
        invoiceDate: inv.invoiceDate || '—',
        paymentMethod: inv.paymentMethod || '—',
        subtotal: Number(inv.subtotal) || 0,
        tax: Number(inv.tax) || 0,
        totalAmount: Number(inv.totalAmount) || 0,
        isHandwritten: inv.isHandwritten ? 'Yes' : 'No',
        status: inv.status || 'processed',
      });
    });

    const totalRow = sheet.addRow({
      invoiceNumber: '',
      supplier: '',
      billTo: '',
      invoiceDate: '',
      paymentMethod: 'TOTAL',
      subtotal: { formula: `SUM(F2:F${invoices.length + 1})` },
      tax: { formula: `SUM(G2:G${invoices.length + 1})` },
      totalAmount: { formula: `SUM(H2:H${invoices.length + 1})` },
    });
    totalRow.font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=expense-register.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Expense register export error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes
app.use('/api', routes);

// Error Handler
app.use(errorHandler);

module.exports = app;