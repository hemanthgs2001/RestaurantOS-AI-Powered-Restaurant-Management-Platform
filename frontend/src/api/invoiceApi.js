import axios from './axios';

export const uploadInvoices = (files) => {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  return axios.post('/invoices/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const listInvoices = () => axios.get('/invoices');
export const getInvoice = (id) => axios.get(`/invoices/${id}`);
export const exportInvoice = (id) => axios.get(`/invoices/${id}/export`, { responseType: 'blob' });
