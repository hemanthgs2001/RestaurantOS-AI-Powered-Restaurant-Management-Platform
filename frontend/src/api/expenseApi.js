import axios from './axios';

// Expense Categories
export const getExpenseCategories = () => axios.get('/expense/expense-categories');
export const createExpenseCategory = (data) => axios.post('/expense/expense-categories', data);
export const updateExpenseCategory = (id, data) => axios.put(`/expense/expense-categories/${id}`, data);
export const deleteExpenseCategory = (id) => axios.delete(`/expense/expense-categories/${id}`);

// Expense Records
export const getExpenseRecords = () => axios.get('/expense/expense-records');
export const createExpenseRecord = (data) => axios.post('/expense/expense-records', data);
export const updateExpenseRecord = (id, data) => axios.put(`/expense/expense-records/${id}`, data);
export const deleteExpenseRecord = (id) => axios.delete(`/expense/expense-records/${id}`);

// Supplier Invoices
export const getSupplierInvoices = () => axios.get('/expense/supplier-invoices');
export const createSupplierInvoice = (data) => axios.post('/expense/supplier-invoices', data);
export const updateSupplierInvoice = (id, data) => axios.put(`/expense/supplier-invoices/${id}`, data);
export const deleteSupplierInvoice = (id) => axios.delete(`/expense/supplier-invoices/${id}`);
export const updateInvoiceStatus = (id, data) => axios.patch(`/expense/supplier-invoices/${id}/status`, data);

// Monthly Expenses
export const getMonthlyExpenses = (year) => axios.get('/expense/monthly-expenses', { params: { year } });