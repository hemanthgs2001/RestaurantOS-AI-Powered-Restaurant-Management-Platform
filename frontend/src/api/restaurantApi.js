import axios from './axios';

// Tables
export const getTables = () => axios.get('/restaurant/tables');
export const createTable = (data) => axios.post('/restaurant/tables', data);
export const updateTable = (id, data) => axios.put(`/restaurant/tables/${id}`, data);
export const deleteTable = (id) => axios.delete(`/restaurant/tables/${id}`);
export const updateTableStatus = (id, data) => axios.patch(`/restaurant/tables/${id}/status`, data);

// Orders
export const getOrders = () => axios.get('/restaurant/orders');
export const createOrder = (data) => axios.post('/restaurant/orders', data);
export const updateOrder = (id, data) => axios.put(`/restaurant/orders/${id}`, data);
export const deleteOrder = (id) => axios.delete(`/restaurant/orders/${id}`);
export const updateOrderStatus = (id, data) => axios.patch(`/restaurant/orders/${id}/status`, data);

// Menu
export const getMenuItems = () => axios.get('/restaurant/menu');
export const createMenuItem = (data) => axios.post('/restaurant/menu', data);
export const updateMenuItem = (id, data) => axios.put(`/restaurant/menu/${id}`, data);
export const deleteMenuItem = (id) => axios.delete(`/restaurant/menu/${id}`);
export const toggleMenuItemAvailability = (id, data) => axios.patch(`/restaurant/menu/${id}/availability`, data);

// Recipes
export const getRecipes = () => axios.get('/restaurant/recipes');
export const createRecipe = (data) => axios.post('/restaurant/recipes', data);
export const updateRecipe = (id, data) => axios.put(`/restaurant/recipes/${id}`, data);
export const deleteRecipe = (id) => axios.delete(`/restaurant/recipes/${id}`);

// Ingredients
export const getIngredients = () => axios.get('/restaurant/ingredients');
export const createIngredient = (data) => axios.post('/restaurant/ingredients', data);
export const updateIngredient = (id, data) => axios.put(`/restaurant/ingredients/${id}`, data);
export const deleteIngredient = (id) => axios.delete(`/restaurant/ingredients/${id}`);

// Suppliers
export const getSuppliers = () => axios.get('/restaurant/suppliers');
export const createSupplier = (data) => axios.post('/restaurant/suppliers', data);
export const updateSupplier = (id, data) => axios.put(`/restaurant/suppliers/${id}`, data);
export const deleteSupplier = (id) => axios.delete(`/restaurant/suppliers/${id}`);

// Staff
export const getStaff = () => axios.get('/restaurant/staff');
export const createStaff = (data) => axios.post('/restaurant/staff', data);
export const updateStaff = (id, data) => axios.put(`/restaurant/staff/${id}`, data);
export const deleteStaff = (id) => axios.delete(`/restaurant/staff/${id}`);