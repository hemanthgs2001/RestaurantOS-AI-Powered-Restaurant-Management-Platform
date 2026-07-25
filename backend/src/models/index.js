const User = require('./User');
const Table = require('./Table');
const Order = require('./Order');
const Menu = require('./Menu');
const Recipe = require('./Recipe');
const Ingredient = require('./Ingredient');
const Supplier = require('./Supplier');
const Staff = require('./Staff');
const Product = require('./Product');
const Category = require('./Categoury');
const Warehouse = require('./Warehouse');
const StockTransaction = require('./StockTranscation');
const PurchaseOrder = require('./PurchaseOrder');
const ExpenseCategory = require('./ExpenseCategory');
const ExpenseRecord = require('./ExpenseRecord');
const SupplierInvoice = require('./SupplierInvoice');

// Define associations here if needed

module.exports = {
  User,
  Table,
  Order,
  Menu,
  Recipe,
  Ingredient,
  Supplier,
  Staff,
  Product,
  Category,
  Warehouse,
  StockTransaction,
  PurchaseOrder,
  ExpenseCategory,
  ExpenseRecord,
  SupplierInvoice,
};