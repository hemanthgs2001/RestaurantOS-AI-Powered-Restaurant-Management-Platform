import React, { useState, useEffect } from 'react';
import { getStock, stockIn, stockOut, getStockTranscations } from '../../api/inventoryApi';
import toast from 'react-hot-toast';

const StockInOut = () => {
  const [stock, setStock] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('in');
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    unitPrice: 0,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stockRes, transRes] = await Promise.all([
        getStock(),
        getStockTranscations()
      ]);
      setStock(stockRes.data);
      setTransactions(transRes.data);
    } catch (error) {
      toast.error('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (transactionType === 'in') {
        await stockIn(formData);
        toast.success('Stock in recorded successfully');
      } else {
        await stockOut(formData);
        toast.success('Stock out recorded successfully');
      }
      setShowModal(false);
      setFormData({ productId: '', quantity: 0, unitPrice: 0, notes: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '400px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Stock Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-success" onClick={() => {
            setTransactionType('in');
            setShowModal(true);
          }}>
            Stock In
          </button>
          <button className="btn btn-danger" onClick={() => {
            setTransactionType('out');
            setShowModal(true);
          }}>
            Stock Out
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Current Stock</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.unit}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unitPrice?.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${item.quantity <= item.reorderLevel ? 'badge-danger' : 'badge-success'}`}>
                      {item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Recent Transactions</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((trans) => (
                <tr key={trans.id}>
                  <td>
                    <span className={`badge ${trans.type === 'in' ? 'badge-success' : 'badge-danger'}`}>
                      {trans.type.toUpperCase()}
                    </span>
                  </td>
                  <td>{trans.productName}</td>
                  <td>{trans.quantity}</td>
                  <td>${trans.unitPrice?.toFixed(2)}</td>
                  <td>${(trans.quantity * trans.unitPrice)?.toFixed(2)}</td>
                  <td>{new Date(trans.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
            width: '90%'
          }}>
            <h2>{transactionType === 'in' ? 'Stock In' : 'Stock Out'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Product</label>
                <select
                  className="input"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  required
                >
                  <option value="">Select Product</option>
                  {stock.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Current: {product.quantity} {product.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Unit Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Notes</label>
                <textarea
                  className="input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className={`btn ${transactionType === 'in' ? 'btn-success' : 'btn-danger'}`} style={{ flex: 1 }}>
                  Confirm {transactionType === 'in' ? 'Stock In' : 'Stock Out'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ productId: '', quantity: 0, unitPrice: 0, notes: '' });
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

export default StockInOut;