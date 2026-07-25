/**
 * Application Routes Configuration
 * Defines all routes for the application with their properties
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

// Import components (lazy loading optional)
import Dashboard from './components/dashboard/Dashboard';
import TableManagement from './components/restaurant/TableManagement';
import OrderManagement from './components/restaurant/OrderManagement';
import MenuManagement from './components/restaurant/MenuManagement';
import RecipeManagement from './components/restaurant/RecipeManagement';
import IngredientManagement from './components/restaurant/IngredientManagement';
import SupplierManagement from './components/restaurant/SupplierManagement';
import StaffManagement from './components/restaurant/StaffManagement';
import ProductManagement from './components/inventory/ProductManagement';
import CategoryManagement from './components/inventory/CategoryManagement';
import WarehouseManagement from './components/inventory/WarehouseManagement';
import StockInOut from './components/inventory/StockInOut';
import PurchaseOrders from './components/inventory/PurchaseOrders';
import ExpenseCategories from './components/expense/ExpenseCategories';
import ExpenseRecords from './components/expense/ExpenseRecords';
import SupplierInvoice from './components/expense/SupplierInvoice';
import MonthlyExpenseTracking from './components/expense/MonthlyExpenseTracking';
import AIDashboard from './components/ai/AIDashboard';
import InvoiceProcessing from './components/ai/InvoiceProcessing';

// Route Definitions
export const routes = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    exact: true,
    roles: ['*'],
  },
  {
    path: '/dashboard',
    element: Dashboard,
    label: 'Dashboard',
    icon: 'FiHome',
    roles: ['*'],
    exact: true,
  },
  {
    path: '/tables',
    element: TableManagement,
    label: 'Tables',
    icon: 'FiLayout',
    roles: ['owner', 'manager', 'waiter', 'cashier'],
    exact: true,
  },
  {
    path: '/orders',
    element: OrderManagement,
    label: 'Orders',
    icon: 'FiShoppingCart',
    roles: ['owner', 'manager', 'chef', 'waiter', 'cashier'],
    exact: true,
  },
  {
    path: '/menu',
    element: MenuManagement,
    label: 'Menu',
    icon: 'FiMenu',
    roles: ['owner', 'manager', 'waiter', 'cashier'],
    exact: true,
  },
  {
    path: '/recipes',
    element: RecipeManagement,
    label: 'Recipes',
    icon: 'FiBook',
    roles: ['owner', 'manager', 'chef'],
    exact: true,
  },
  {
    path: '/ingredients',
    element: IngredientManagement,
    label: 'Ingredients',
    icon: 'FiPackage',
    roles: ['owner', 'manager', 'chef', 'store_manager'],
    exact: true,
  },
  {
    path: '/suppliers',
    element: SupplierManagement,
    label: 'Suppliers',
    icon: 'FiUsers',
    roles: ['owner', 'manager', 'store_manager'],
    exact: true,
  },
  {
    path: '/staff',
    element: StaffManagement,
    label: 'Staff',
    icon: 'FiUser',
    roles: ['owner', 'manager'],
    exact: true,
  },
  {
    path: '/products',
    element: ProductManagement,
    label: 'Products',
    icon: 'FiGrid',
    roles: ['owner', 'manager', 'store_manager'],
    exact: true,
  },
  {
    path: '/categories',
    element: CategoryManagement,
    label: 'Categories',
    icon: 'FiList',
    roles: ['owner', 'manager', 'store_manager'],
    exact: true,
  },
  {
    path: '/warehouses',
    element: WarehouseManagement,
    label: 'Warehouses',
    icon: 'FiBox',
    roles: ['owner', 'manager', 'store_manager'],
    exact: true,
  },
  {
    path: '/stock',
    element: StockInOut,
    label: 'Stock',
    icon: 'FiPieChart',
    roles: ['owner', 'manager', 'store_manager'],
    exact: true,
  },
  {
    path: '/purchase-orders',
    element: PurchaseOrders,
    label: 'Purchase Orders',
    icon: 'FiClipboard',
    roles: ['owner', 'manager', 'store_manager'],
    exact: true,
  },
  {
    path: '/expense-categories',
    element: ExpenseCategories,
    label: 'Expense Categories',
    icon: 'FiDollarSign',
    roles: ['owner', 'manager'],
    exact: true,
  },
  {
    path: '/expenses',
    element: ExpenseRecords,
    label: 'Expenses',
    icon: 'FiFile',
    roles: ['owner', 'manager', 'cashier'],
    exact: true,
  },
  {
    path: '/supplier-invoices',
    element: SupplierInvoice,
    label: 'Supplier Invoices',
    icon: 'FiUpload',
    roles: ['owner', 'manager', 'store_manager'],
    exact: true,
  },
  {
    path: '/monthly-expenses',
    element: MonthlyExpenseTracking,
    label: 'Monthly Expenses',
    icon: 'FiCalendar',
    roles: ['owner', 'manager'],
    exact: true,
  },
  {
    path: '/ai',
    element: AIDashboard,
    label: 'AI Dashboard',
    icon: 'FiCpu',
    roles: ['owner', 'manager'],
    exact: true,
  },
  {
    path: '/ai/invoice-processing',
    element: InvoiceProcessing,
    label: 'Invoice Processing',
    icon: 'FiUpload',
    roles: ['owner', 'manager', 'store_manager'],
    exact: true,
  },
];

/**
 * Get routes for specific role
 * @param {string} role - User role
 * @returns {Array} Filtered routes
 */
export const getRoutesForRole = (role) => {
  if (!role) return [];
  return routes.filter(route => {
    return route.roles.includes('*') || route.roles.includes(role);
  });
};

/**
 * Check if user has access to route
 * @param {string} role - User role
 * @param {string} path - Route path
 * @returns {boolean} True if access granted
 */
export const hasRouteAccess = (role, path) => {
  const route = routes.find(r => r.path === path);
  if (!route) return false;
  return route.roles.includes('*') || route.roles.includes(role);
};

/**
 * Get route by path
 * @param {string} path - Route path
 * @returns {Object} Route object
 */
export const getRouteByPath = (path) => {
  return routes.find(r => r.path === path);
};

/**
 * Get default route for user
 * @param {string} role - User role
 * @returns {string} Default route path
 */
export const getDefaultRoute = (role) => {
  const accessibleRoutes = getRoutesForRole(role);
  if (accessibleRoutes.length > 0) {
    return accessibleRoutes[0].path;
  }
  return '/dashboard';
};

/**
 * Get route label by path
 * @param {string} path - Route path
 * @returns {string} Route label
 */
export const getRouteLabel = (path) => {
  const route = getRouteByPath(path);
  return route?.label || path;
};

/**
 * Public routes (no authentication required)
 */
export const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

/**
 * Check if route is public
 * @param {string} path - Route path
 * @returns {boolean} True if public
 */
export const isPublicRoute = (path) => {
  return publicRoutes.some(route => path.startsWith(route));
};

export default routes;