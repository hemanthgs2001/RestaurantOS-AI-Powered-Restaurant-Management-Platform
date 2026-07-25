import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { getOrders, createOrder, updateOrder, deleteOrder, updateOrderStatus } from '../../api/restaurantApi';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    orderNumber: '',
    status: 'pending',
    totalAmount: 0,
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    orderType: 'dine_in',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, formData);
        toast.success('Order updated successfully');
      } else {
        await createOrder(formData);
        toast.success('Order created successfully');
      }
      setShowModal(false);
      setEditingOrder(null);
      setFormData({ orderNumber: '', status: 'pending', totalAmount: 0, paymentStatus: 'pending', paymentMethod: 'cash', orderType: 'dine_in', notes: '' });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id);
        toast.success('Order deleted successfully');
        fetchOrders();
      } catch (error) {
        toast.error('Failed to delete order');
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      preparing: 'badge-info',
      ready: 'badge-success',
      served: 'badge-success',
      completed: 'badge-success',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  const getPaymentBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      paid: 'badge-success',
      partially_paid: 'badge-info'
    };
    return badges[status] || 'badge-info';
  };

  const formatAmount = (amt) => {
    const n = typeof amt === 'number' ? amt : parseFloat(amt);
    if (Number.isNaN(n) || n === null || n === undefined) return '0.00';
    return n.toFixed(2);
  };

  if (loading) return <div className="flex-center" style={{ height: '400px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Order Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Create Order
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <select className="input" style={{ width: 'auto' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
        </select>
        <select className="input" style={{ width: 'auto' }}>
          <option value="">All Types</option>
          <option value="dine_in">Dine In</option>
          <option value="takeaway">Takeaway</option>
          <option value="delivery">Delivery</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Total Amount</th>
              <th>Type</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.orderNumber}</strong></td>
                <td>${formatAmount(order.totalAmount)}</td>
                <td>{order.orderType?.replace('_', ' ')}</td>
                <td>
                  <select
                    className={`badge ${getStatusBadge(order.status)}`}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="served">Served</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <span className={`badge ${getPaymentBadge(order.paymentStatus)}`}>
                    {order.paymentStatus?.replace('_', ' ')}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setSelectedOrder(order);
                    }}
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>Order Details</h2>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Order Number:</strong> {selectedOrder.orderNumber}</p>
              <p><strong>Total Amount:</strong> ${formatAmount(selectedOrder.totalAmount)}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</p>
              <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
              <p><strong>Order Type:</strong> {selectedOrder.orderType}</p>
              {selectedOrder.notes && <p><strong>Notes:</strong> {selectedOrder.notes}</p>}
              <p><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
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
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>{editingOrder ? 'Edit Order' : 'Create Order'}</h2>
            <form onSubmit={handleSubmit}>
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
                <label>Total Amount</label>
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
                <label>Order Type</label>
                <select
                  className="input"
                  value={formData.orderType}
                  onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                >
                  <option value="dine_in">Dine In</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Payment Method</label>
                <select
                  className="input"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile">Mobile</option>
                  <option value="other">Other</option>
                </select>
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
                    setFormData({ orderNumber: '', status: 'pending', totalAmount: 0, paymentStatus: 'pending', paymentMethod: 'cash', orderType: 'dine_in', notes: '' });
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

export default OrderManagement;