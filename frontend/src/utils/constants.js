/**
 * Application Constants
 * Contains all static data, configuration values, and enumerations
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    SALES: '/dashboard/sales',
    MONTHLY_EXPENSES: '/dashboard/monthly-expenses',
  },
  RESTAURANT: {
    TABLES: '/restaurant/tables',
    ORDERS: '/restaurant/orders',
    MENU: '/restaurant/menu',
    RECIPES: '/restaurant/recipes',
    INGREDIENTS: '/restaurant/ingredients',
    SUPPLIERS: '/restaurant/suppliers',
    STAFF: '/restaurant/staff',
  },
  INVENTORY: {
    PRODUCTS: '/inventory/products',
    CATEGORIES: '/inventory/categories',
    WAREHOUSES: '/inventory/warehouses',
    STOCK: '/inventory/stock',
    PURCHASE_ORDERS: '/inventory/purchase-orders',
  },
  EXPENSE: {
    CATEGORIES: '/expense/expense-categories',
    RECORDS: '/expense/expense-records',
    SUPPLIER_INVOICES: '/expense/supplier-invoices',
    MONTHLY_EXPENSES: '/expense/monthly-expenses',
  },
  AI: {
    INVOICES: '/invoices',
    PREDICTIONS: '/predictions',
    RECOMMENDATIONS: '/recommendations',
  },
};

// User Roles
export const ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  CHEF: 'chef',
  WAITER: 'waiter',
  CASHIER: 'cashier',
  STORE_MANAGER: 'store_manager',
};

// Role Labels
export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Owner',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.CHEF]: 'Chef',
  [ROLES.WAITER]: 'Waiter',
  [ROLES.CASHIER]: 'Cashier',
  [ROLES.STORE_MANAGER]: 'Store Manager',
};

// Role Permissions
export const ROLE_PERMISSIONS = {
  // Owner and Manager: full access to everything in the sidebar
  [ROLES.OWNER]: ['*'],
  [ROLES.MANAGER]: ['*'],

  // Chef: ingredients, menu, recipes, warehouses (for ingredient sourcing), products
  [ROLES.CHEF]: ['ingredients', 'menu', 'recipes', 'warehouses', 'products'],

  // Waiter: tables, orders, suppliers (to view supplier contact if needed)
  [ROLES.WAITER]: ['tables', 'orders', 'suppliers'],

  // Cashier: inventory + expenses + orders/tables and related records
  [ROLES.CASHIER]: [
    'warehouses', 'stock',
    'expense_categories', 'expenses', 'supplier_invoices', 'monthly_expenses',
    'tables', 'orders', 'menu', 'recipes', 'ingredients', 'suppliers'
  ],

  // Keep store manager permissions (if used elsewhere)
  [ROLES.STORE_MANAGER]: ['products', 'categories', 'warehouses', 'stock', 'suppliers'],
};

// Table Status
export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance',
};

export const TABLE_STATUS_LABELS = {
  [TABLE_STATUS.AVAILABLE]: 'Available',
  [TABLE_STATUS.OCCUPIED]: 'Occupied',
  [TABLE_STATUS.RESERVED]: 'Reserved',
  [TABLE_STATUS.MAINTENANCE]: 'Maintenance',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.PREPARING]: 'Preparing',
  [ORDER_STATUS.READY]: 'Ready',
  [ORDER_STATUS.SERVED]: 'Served',
  [ORDER_STATUS.COMPLETED]: 'Completed',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIALLY_PAID: 'partially_paid',
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.PAID]: 'Paid',
  [PAYMENT_STATUS.PARTIALLY_PAID]: 'Partially Paid',
};

// Order Types
export const ORDER_TYPES = {
  DINE_IN: 'dine_in',
  TAKEAWAY: 'takeaway',
  DELIVERY: 'delivery',
};

export const ORDER_TYPE_LABELS = {
  [ORDER_TYPES.DINE_IN]: 'Dine In',
  [ORDER_TYPES.TAKEWAY]: 'Takeaway',
  [ORDER_TYPES.DELIVERY]: 'Delivery',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  MOBILE: 'mobile',
  BANK_TRANSFER: 'bank_transfer',
  OTHER: 'other',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Cash',
  [PAYMENT_METHODS.CARD]: 'Card',
  [PAYMENT_METHODS.MOBILE]: 'Mobile',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
  [PAYMENT_METHODS.OTHER]: 'Other',
};

// Purchase Order Status
export const PURCHASE_ORDER_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
};

export const PURCHASE_ORDER_STATUS_LABELS = {
  [PURCHASE_ORDER_STATUS.DRAFT]: 'Draft',
  [PURCHASE_ORDER_STATUS.SENT]: 'Sent',
  [PURCHASE_ORDER_STATUS.RECEIVED]: 'Received',
  [PURCHASE_ORDER_STATUS.CANCELLED]: 'Cancelled',
};

// Invoice Status
export const INVOICE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

export const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUS.PENDING]: 'Pending',
  [INVOICE_STATUS.PAID]: 'Paid',
  [INVOICE_STATUS.OVERDUE]: 'Overdue',
  [INVOICE_STATUS.CANCELLED]: 'Cancelled',
};

// Stock Transaction Types
export const STOCK_TRANSACTION_TYPES = {
  IN: 'in',
  OUT: 'out',
  ADJUSTMENT: 'adjustment',
};

export const STOCK_TRANSACTION_TYPE_LABELS = {
  [STOCK_TRANSACTION_TYPES.IN]: 'Stock In',
  [STOCK_TRANSACTION_TYPES.OUT]: 'Stock Out',
  [STOCK_TRANSACTION_TYPES.ADJUSTMENT]: 'Adjustment',
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#4F46E5',
  SUCCESS: '#10B981',
  DANGER: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  PURPLE: '#8B5CF6',
  PINK: '#EC4899',
  INDIGO: '#6366F1',
};

export const CHART_COLOR_PALETTE = [
  CHART_COLORS.PRIMARY,
  CHART_COLORS.SUCCESS,
  CHART_COLORS.DANGER,
  CHART_COLORS.WARNING,
  CHART_COLORS.INFO,
  CHART_COLORS.PURPLE,
  CHART_COLORS.PINK,
  CHART_COLORS.INDIGO,
];

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_TIME: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
  MONTH: 'MMM YYYY',
  YEAR: 'YYYY',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    PDF: ['application/pdf'],
    EXCEL: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
  },
};

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Logged in successfully!',
    LOGOUT: 'Logged out successfully!',
    REGISTER: 'Registration successful! Please login.',
    CREATE: 'Created successfully!',
    UPDATE: 'Updated successfully!',
    DELETE: 'Deleted successfully!',
    UPLOAD: 'Uploaded successfully!',
    EXPORT: 'Exported successfully!',
  },
  ERROR: {
    LOGIN: 'Login failed. Please try again.',
    REGISTER: 'Registration failed. Please try again.',
    FETCH: 'Failed to fetch data. Please try again.',
    CREATE: 'Failed to create. Please try again.',
    UPDATE: 'Failed to update. Please try again.',
    DELETE: 'Failed to delete. Please try again.',
    UPLOAD: 'Failed to upload. Please try again.',
    EXPORT: 'Failed to export. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
  },
  INFO: {
    LOADING: 'Loading...',
    NO_DATA: 'No data available.',
    PROCESSING: 'Processing...',
  },
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\+?[\d\s-]{10,15}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

// Navigation Items
export const NAVIGATION_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'FiHome',
    roles: ['*'],
  },
  {
    path: '/tables',
    label: 'Tables',
    icon: 'FiLayout',
    roles: ['owner', 'manager', 'waiter', 'cashier'],
  },
  {
    path: '/orders',
    label: 'Orders',
    icon: 'FiShoppingCart',
    roles: ['owner', 'manager', 'chef', 'waiter', 'cashier'],
  },
  {
    path: '/menu',
    label: 'Menu',
    icon: 'FiMenu',
    roles: ['owner', 'manager', 'waiter', 'cashier'],
  },
  {
    path: '/recipes',
    label: 'Recipes',
    icon: 'FiBook',
    roles: ['owner', 'manager', 'chef'],
  },
  {
    path: '/ingredients',
    label: 'Ingredients',
    icon: 'FiPackage',
    roles: ['owner', 'manager', 'chef', 'store_manager'],
  },
  {
    path: '/suppliers',
    label: 'Suppliers',
    icon: 'FiUsers',
    roles: ['owner', 'manager', 'store_manager'],
  },
  {
    path: '/staff',
    label: 'Staff',
    icon: 'FiUser',
    roles: ['owner', 'manager'],
  },
  {
    path: '/products',
    label: 'Products',
    icon: 'FiGrid',
    roles: ['owner', 'manager', 'store_manager'],
  },
  {
    path: '/categories',
    label: 'Categories',
    icon: 'FiList',
    roles: ['owner', 'manager', 'store_manager'],
  },
  {
    path: '/warehouses',
    label: 'Warehouses',
    icon: 'FiBox',
    roles: ['owner', 'manager', 'store_manager'],
  },
  {
    path: '/stock',
    label: 'Stock',
    icon: 'FiPieChart',
    roles: ['owner', 'manager', 'store_manager'],
  },
  {
    path: '/purchase-orders',
    label: 'Purchase Orders',
    icon: 'FiClipboard',
    roles: ['owner', 'manager', 'store_manager'],
  },
  {
    path: '/expense-categories',
    label: 'Expense Categories',
    icon: 'FiDollarSign',
    roles: ['owner', 'manager'],
  },
  {
    path: '/expenses',
    label: 'Expenses',
    icon: 'FiFile',
    roles: ['owner', 'manager', 'cashier'],
  },
  {
    path: '/supplier-invoices',
    label: 'Supplier Invoices',
    icon: 'FiUpload',
    roles: ['owner', 'manager', 'store_manager'],
  },
  {
    path: '/monthly-expenses',
    label: 'Monthly Expenses',
    icon: 'FiCalendar',
    roles: ['owner', 'manager'],
  },
  {
    path: '/ai',
    label: 'AI Dashboard',
    icon: 'FiCpu',
    roles: ['owner', 'manager'],
  },
  {
    path: '/ai/invoice-processing',
    label: 'Invoice Processing',
    icon: 'FiUpload',
    roles: ['owner', 'manager', 'store_manager'],
  },
];

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
};

// Theme Options
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Language Options
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  ZH: 'zh',
};

// Default Settings
export const DEFAULT_SETTINGS = {
  THEME: THEME.LIGHT,
  LANGUAGE: LANGUAGES.EN,
  CURRENCY: 'USD',
  TIMEZONE: 'UTC',
  DATE_FORMAT: 'MM/DD/YYYY',
  TIME_FORMAT: '12h',
};

// Currency Settings
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters long.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  INVALID_URL: 'Please enter a valid URL.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'File type is not supported.',
  NETWORK_ERROR: 'Network error. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission.',
  NOT_FOUND: 'Resource not found.',
  CONFLICT: 'Resource already exists.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Saved successfully!',
  UPDATED: 'Updated successfully!',
  DELETED: 'Deleted successfully!',
  CREATED: 'Created successfully!',
  COPIED: 'Copied to clipboard!',
  UPLOADED: 'Uploaded successfully!',
  SENT: 'Sent successfully!',
  RECEIVED: 'Received successfully!',
  ACTIVATED: 'Activated successfully!',
  DEACTIVATED: 'Deactivated successfully!',
};

// Application Configuration
export const APP_CONFIG = {
  NAME: 'RestaurantOS',
  VERSION: '1.0.0',
  ENV: process.env.NODE_ENV || 'development',
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  AI_API_URL: process.env.REACT_APP_AI_API_URL || 'http://localhost:8000/api',
  COMPANY: 'Nile Hospitality',
  SUPPORT_EMAIL: 'support@restaurantos.com',
};