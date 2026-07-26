import React, { useState } from 'react';
import { FiUpload, FiFile, FiDownload, FiTrash2, FiCheck } from 'react-icons/fi';
import { processInvoice, getInvoices, generateExpenseRegister } from '../../api/aiApi';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const InvoiceProcessing = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const formatAmount = (v) => {
    const n = typeof v === 'number' ? v : parseFloat(v);
    if (Number.isNaN(n) || n === null || n === undefined) return 0;
    return n;
  };

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 KB';
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(2)} MB`;
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles([...files, ...uploadedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const processInvoices = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one invoice');
      return;
    }

    setProcessing(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('invoices', file);
    });

    try {
      const response = await processInvoice(formData);
      setInvoices(response.data);
      toast.success('Invoices processed successfully');
      setFiles([]);
    } catch (error) {
      toast.error('Failed to process invoices');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await generateExpenseRegister(invoices);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expense-register.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Expense register exported successfully');
    } catch (error) {
      toast.error('Failed to export expense register');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>AI Invoice Processing</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Upload Invoices</h3>
        <div style={{
          border: '2px dashed #D1D5DB',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: '#F9FAFB'
        }}>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
            <FiUpload size={40} color="#4F46E5" />
            <p style={{ marginTop: '1rem', color: '#6B7280' }}>
              Drag and drop or click to upload invoices
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
              Supported formats: PDF, JPG, PNG
            </p>
          </label>
        </div>

        {files.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h4>Uploaded Files ({files.length})</h4>
            {files.map((file, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 1rem',
                background: '#F9FAFB',
                borderRadius: '8px',
                marginTop: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiFile />
                  <span>{file.name}</span>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    ({formatSize(file.size)})
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}

            <button
              onClick={processInvoices}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Process Invoices'}
            </button>
          </div>
        )}
      </div>

      {invoices.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Processed Invoices</h3>
            <button onClick={exportToExcel} className="btn btn-success">
              <FiDownload /> Export to Excel
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Invoice Number</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <tr key={index} onClick={() => setSelectedInvoice(invoice)} style={{ cursor: 'pointer' }}>
                    <td>{index + 1}</td>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{invoice.supplier}</td>
                    <td>{invoice.date}</td>
                    <td>{formatCurrency(formatAmount(invoice.totalAmount))}</td>
                    <td>
                      <span className="badge badge-success">
                        <FiCheck /> Processed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedInvoice && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h4>Invoice Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <p><strong>Invoice Number:</strong> {selectedInvoice.invoiceNumber}</p>
                  <p><strong>Supplier:</strong> {selectedInvoice.supplier}</p>
                  <p><strong>Date:</strong> {selectedInvoice.date}</p>
                </div>
                <div>
                  <p><strong>Subtotal:</strong> {formatCurrency(formatAmount(selectedInvoice.subtotal))}</p>
                  <p><strong>Tax:</strong> {formatCurrency(formatAmount(selectedInvoice.tax))}</p>
                  <p><strong>Total:</strong> {formatCurrency(formatAmount(selectedInvoice.totalAmount))}</p>
                </div>
              </div>
              {selectedInvoice.items && (
                <div style={{ marginTop: '1rem' }}>
                  <h5>Items</h5>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.description}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(formatAmount(item.unitPrice))}</td>
                          <td>{formatCurrency(formatAmount(item.total))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceProcessing;