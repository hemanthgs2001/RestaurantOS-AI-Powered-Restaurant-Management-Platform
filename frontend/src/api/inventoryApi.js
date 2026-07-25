import axios from './axios';

// Products
export const getProducts = () => axios.get('/inventory/products');
export const createProduct = (data) => axios.post('/inventory/products', data);
export const updateProduct = (id, data) => axios.put(`/inventory/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`/inventory/products/${id}`);

// Categories
export const getCategories = () => axios.get('/inventory/categories');
export const createCategory = (data) => axios.post('/inventory/categories', data);
export const updateCategory = (id, data) => axios.put(`/inventory/categories/${id}`, data);
export const deleteCategory = (id) => axios.delete(`/inventory/categories/${id}`);

// Warehouses
export const getWarehouses = () => axios.get('/inventory/warehouses');
export const createWarehouse = (data) => axios.post('/inventory/warehouses', data);
export const updateWarehouse = (id, data) => axios.put(`/inventory/warehouses/${id}`, data);
export const deleteWarehouse = (id) => axios.delete(`/inventory/warehouses/${id}`);

// Stock
export const getStock = () => axios.get('/inventory/stock');
export const stockIn = (data) => axios.post('/inventory/stock/in', data);
export const stockOut = (data) => axios.post('/inventory/stock/out', data);
export const getStockTransactions = () => axios.get('/inventory/stock/transactions');

// Purchase Orders
export const getPurchaseOrders = () => axios.get('/inventory/purchase-orders');
export const createPurchaseOrder = (data) => axios.post('/inventory/purchase-orders', data);
export const updatePurchaseOrder = (id, data) => axios.put(`/inventory/purchase-orders/${id}`, data);
export const deletePurchaseOrder = (id) => axios.delete(`/inventory/purchase-orders/${id}`);
export const updatePurchaseOrderStatus = (id, data) => axios.patch(`/inventory/purchase-orders/${id}/status`, data);