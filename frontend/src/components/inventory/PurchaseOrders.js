import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, updatePurchaseOrderStatus } from '../../api/inventoryApi';
import { getSuppliers } from '../../api/restaurantApi';
import toast from 'react-hot-toast';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    orderNumber: '',
    totalAmount: 0,
    expectedDelivery: '',
    notes: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, suppliersRes] = await Promise.all([
        getPurchaseOrders(),
        getSuppliers()
      ]);
      setOrders(ordersRes.data);
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
      if (editingOrder) {
        await updatePurchaseOrder(editingOrder.id, formData);
        toast.success('Purchase order updated successfully');
      } else {
        await createPurchaseOrder(formData);
        toast.success('Purchase order created successfully');
      }
      setShowModal(false);
      setEditingOrder(null);
      setFormData({ supplierId: '', orderNumber: '', totalAmount: 0, expectedDelivery: '', notes: '', status: 'draft' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await deletePurchaseOrder(id);
        toast.success('Purchase order deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete purchase order');
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updatePurchaseOrderStatus(id, { status });
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-secondary',
      sent: 'badge-info',
      received: 'badge-success',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  // Sequelize returns DECIMAL columns (like totalAmount) as strings, not
  // numbers, so calling .toFixed() directly on order.totalAmount can throw
  // and crash the page. This safely coerces to a number first.
  const formatAmount = (amt) => {
    const n = typeof amt === 'number' ? amt : parseFloat(amt);
    if (Number.isNaN(n) || n === null || n === undefined) return '0.00';
    return n.toFixed(2);
  };

  if (loading) return <div className="flex-center" style={{ height: '400px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Purchase Orders</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Create Purchase Order
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Supplier</th>
              <th>Total Amount</th>
              <th>Expected Delivery</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.orderNumber}</strong></td>
                <td>{order.supplierName || 'N/A'}</td>
                <td>${formatAmount(order.totalAmount)}</td>
                <td>{order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <select
                    className={`badge ${getStatusBadge(order.status)}`}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setSelectedOrder(order)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    <FiEye />
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setEditingOrder(order);
                      setFormData(order);
                      setShowModal(true);
                    }}
                    style={{ marginRight: '0.5rem' }}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(order.id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
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
            <h2>Purchase Order Details</h2>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Order Number:</strong> {selectedOrder.orderNumber}</p>
              <p><strong>Supplier:</strong> {selectedOrder.supplierName}</p>
              <p><strong>Total Amount:</strong> ${formatAmount(selectedOrder.totalAmount)}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Expected Delivery:</strong> {selectedOrder.expectedDelivery ? new Date(selectedOrder.expectedDelivery).toLocaleDateString() : 'N/A'}</p>
              {selectedOrder.notes && <p><strong>Notes:</strong> {selectedOrder.notes}</p>}
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedOrder(null)}
              style={{ marginTop: '1.5rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
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
            <h2>{editingOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}</h2>
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
                <label>Order Number</label>
                <input
                  type="text"
                  className="input"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Total Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Expected Delivery</label>
                <input
                  type="date"
                  className="input"
                  value={formData.expectedDelivery}
                  onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
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
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingOrder ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingOrder(null);
                    setFormData({ supplierId: '', orderNumber: '', totalAmount: 0, expectedDelivery: '', notes: '', status: 'draft' });
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

export default PurchaseOrders;