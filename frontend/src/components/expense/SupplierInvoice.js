import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { getSupplierInvoices, createSupplierInvoice, updateSupplierInvoice, deleteSupplierInvoice, updateInvoiceStatus } from '../../api/expenseApi';
import { getSuppliers } from '../../api/restaurantApi';
import toast from 'react-hot-toast';

const SupplierInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    totalAmount: 0,
    taxAmount: 0,
    discountAmount: 0,
    status: 'pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, suppliersRes] = await Promise.all([
        getSupplierInvoices(),
        getSuppliers()
      ]);
      setInvoices(invoicesRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvoice) {
        await updateSupplierInvoice(editingInvoice.id, formData);
        toast.success('Invoice updated successfully');
      } else {
        await createSupplierInvoice(formData);
        toast.success('Invoice created successfully');
      }
      setShowModal(false);
      setEditingInvoice(null);
      setFormData({ supplierId: '', invoiceNumber: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', totalAmount: 0, taxAmount: 0, discountAmount: 0, status: 'pending' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteSupplierInvoice(id);
        toast.success('Invoice deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateInvoiceStatus(id, { status });
      toast.success('Invoice status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      paid: 'badge-success',
      overdue: 'badge-danger',
      cancelled: 'badge-secondary'
    };
    return badges[status] || 'badge-info';
  };

  if (loading) return <div className="flex-center" style={{ height: '400px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Supplier Invoices</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Invoice
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td><strong>{invoice.invoiceNumber}</strong></td>
                <td>{invoice.supplierName}</td>
                <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                <td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</td>
                <td>${invoice.totalAmount?.toFixed(2)}</td>
                <td>
                  <select
                    className={`badge ${getStatusBadge(invoice.status)}`}
                    value={invoice.status}
                    onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setEditingInvoice(invoice);
                      setFormData(invoice);
                      setShowModal(true);
                    }}
                    style={{ marginRight: '0.5rem' }}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(invoice.id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2>Invoice Details</h2>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Invoice Number:</strong> {selectedInvoice.invoiceNumber}</p>
              <p><strong>Supplier:</strong> {selectedInvoice.supplierName}</p>
              <p><strong>Date:</strong> {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Total Amount:</strong> ${selectedInvoice.totalAmount?.toFixed(2)}</p>
              <p><strong>Tax Amount:</strong> ${selectedInvoice.taxAmount?.toFixed(2)}</p>
              <p><strong>Discount:</strong> ${selectedInvoice.discountAmount?.toFixed(2)}</p>
              <p><strong>Status:</strong> {selectedInvoice.status}</p>
              {selectedInvoice.extractedData && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Extracted Data:</strong>
                  <pre style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                    {JSON.stringify(selectedInvoice.extractedData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedInvoice(null)}
              style={{ marginTop: '1.5rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>{editingInvoice ? 'Edit Invoice' : 'Add Invoice'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Supplier</label>
                <select
                  className="input"
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Invoice Number</label>
                <input
                  type="text"
                  className="input"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Invoice Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Due Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Total ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label>Tax ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.taxAmount}
                    onChange={(e) => setFormData({ ...formData, taxAmount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label>Discount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingInvoice ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingInvoice(null);
                    setFormData({ supplierId: '', invoiceNumber: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', totalAmount: 0, taxAmount: 0, discountAmount: 0, status: 'pending' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierInvoice;