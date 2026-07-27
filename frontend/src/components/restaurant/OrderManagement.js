import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { getOrders, createOrder, updateOrder, deleteOrder, updateOrderStatus, getTables, getMenuItems } from '../../api/restaurantApi';
import socket from '../../utils/socket';
import toast from 'react-hot-toast';

// Keep in sync with the sections used in Table Management.
const SECTIONS = ['Main', 'Patio', 'VIP', 'Outdoor', 'Private'];

// Orders can only be Accepted or Cancelled.
const STATUS_OPTIONS = ['accepted', 'cancelled'];

const DEFAULT_FORM_STATE = {
  tableSection: '',
  tableNumber: '',
  status: 'accepted',
  totalAmount: 0,
  items: [],
  paymentStatus: 'pending',
  paymentMethod: 'cash',
  orderType: 'dine_in',
  notes: ''
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  // Menu item selection state used to build the order and auto-calculate the total.
  // cart shape: { [menuItemId]: quantity }
  const [cart, setCart] = useState({});
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('All');

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchMenuItems();
  }, []);

  // Live updates: whenever the server emits a notification for an order
  // being placed/status-changed, or a table's availability changing,
  // silently re-fetch the relevant list so this page reflects it
  // immediately - no manual refresh needed. This reuses the same
  // notification socket events that already drive the bell icon in Header.
  useEffect(() => {
    const handleNotification = (notification) => {
      if (notification.type === 'order_received' || notification.type === 'order_status') {
        fetchOrders();
      }
      if (notification.type === 'table_status') {
        fetchTables();
      }
    };

    socket.on('notification:new', handleNotification);
    return () => {
      socket.off('notification:new', handleNotification);
    };
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

  const fetchTables = async () => {
    try {
      const response = await getTables();
      setTables(response.data);
    } catch (error) {
      toast.error('Failed to fetch tables');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await getMenuItems();
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch menu items');
    }
  };

  // Tables available inside the currently selected section, used to
  // populate the Table Number dropdown once a section is chosen.
  const tablesInSelectedSection = tables
    .filter((t) => t.section === formData.tableSection)
    .sort((a, b) => a.tableNumber - b.tableNumber);

  // Only show items that are currently available for ordering.
  const availableMenuItems = menuItems.filter((item) => item.isAvailable);

  // Categories derived from the available items so the filter always
  // reflects what can actually be added to the order.
  const menuCategories = ['All', ...new Set(availableMenuItems.map((item) => item.category || 'General'))];

  const itemsToDisplay = menuCategoryFilter === 'All'
    ? availableMenuItems
    : availableMenuItems.filter((item) => (item.category || 'General') === menuCategoryFilter);

  // Total calculated purely from the selected menu items and their quantities.
  const cartTotal = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = menuItems.find((m) => m.id === itemId);
    return item ? sum + (item.price * qty) : sum;
  }, 0);

  // When items are selected, the cart total drives the order total.
  // If nothing is selected yet (e.g. editing an older order with no
  // reconstructed cart), fall back to whatever amount is already on the order.
  const hasCartItems = Object.keys(cart).length > 0;
  const displayTotal = hasCartItems ? cartTotal : formData.totalAmount;

  const handleQuantityChange = (itemId, qty) => {
    const parsedQty = parseInt(qty, 10);
    setCart((prev) => {
      const updated = { ...prev };
      if (!parsedQty || parsedQty <= 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = parsedQty;
      }
      return updated;
    });
  };

  // Builds the snapshot list of ordered items (name/price captured at order
  // time) from the current cart, so it can be saved alongside the order.
  const buildOrderItemsFromCart = () => {
    return Object.entries(cart).map(([itemId, qty]) => {
      const item = menuItems.find((m) => m.id === itemId);
      return {
        menuItemId: itemId,
        name: item?.name || 'Unknown item',
        price: item?.price || 0,
        quantity: qty,
        subtotal: (item?.price || 0) * qty
      };
    });
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingOrder(null);
    setFormData(DEFAULT_FORM_STATE);
    setCart({});
    setMenuCategoryFilter('All');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // tableSection only drives the dropdown UI - strip it before sending
    const { tableSection, ...rest } = formData;
    const payload = {
      ...rest,
      totalAmount: displayTotal,
      items: hasCartItems ? buildOrderItemsFromCart() : (formData.items || [])
    };

    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, payload);
        toast.success('Order updated successfully');
      } else {
        await createOrder(payload);
        toast.success('Order created successfully');
      }
      resetForm();
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

  const openEditModal = (order) => {
    const matchedTable = tables.find((t) => t.tableNumber === order.tableNumber);
    setEditingOrder(order);
    setFormData({ ...order, tableSection: matchedTable ? matchedTable.section : '' });

    // Reconstruct the cart from the order's saved items so quantities
    // can be seen and adjusted during edit.
    const initialCart = {};
    (order.items || []).forEach((it) => {
      if (it.menuItemId) initialCart[it.menuItemId] = it.quantity;
    });
    setCart(initialCart);
    setMenuCategoryFilter('All');
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      accepted: 'badge-success',
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
    // Format using Indian numbering (e.g. 1,00,000.00)
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
          <option value="accepted">Accepted</option>
          <option value="cancelled">Cancelled</option>
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
              <th>Table #</th>
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
                <td><strong>#{order.orderNumber}</strong></td>
                <td>{order.tableNumber || '-'}</td>
                <td>₹{formatAmount(order.totalAmount)}</td>
                <td>{order.orderType?.replace('_', ' ')}</td>
                <td>
                  <select
                    className={`badge ${getStatusBadge(order.status)}`}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
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
                    onClick={() => openEditModal(order)}
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
              <p><strong>Order Number:</strong> #{selectedOrder.orderNumber}</p>
              <p><strong>Table Number:</strong> {selectedOrder.tableNumber || 'N/A'}</p>

              {/* Ordered menu items with their prices */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div style={{ margin: '1rem 0' }}>
                  <p style={{ marginBottom: '0.5rem' }}><strong>Items Ordered:</strong></p>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Price</th>
                          <th>Qty</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((it, idx) => (
                          <tr key={it.menuItemId || idx}>
                            <td>{it.name}</td>
                            <td>₹{formatAmount(it.price)}</td>
                            <td>{it.quantity}</td>
                            <td>₹{formatAmount(it.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <p><strong>Total Amount:</strong> ₹{formatAmount(selectedOrder.totalAmount)}</p>
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
            maxWidth: '650px',
            width: '90%',
            maxHeight: '85vh',
            overflow: 'auto'
          }}>
            <h2>{editingOrder ? 'Edit Order' : 'Create Order'}</h2>
            <form onSubmit={handleSubmit}>
              {/* Order number is auto-generated (resets to 1 every 24 hours) -
                  shown read-only when editing, hidden entirely on create. */}
              {editingOrder && (
                <div style={{ marginBottom: '1rem' }}>
                  <label>Order Number</label>
                  <input
                    type="text"
                    className="input"
                    value={`#${formData.orderNumber}`}
                    disabled
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label>Table Section</label>
                <select
                  className="input"
                  value={formData.tableSection}
                  onChange={(e) => setFormData({ ...formData, tableSection: e.target.value, tableNumber: '' })}
                >
                  <option value="">Select Section</option>
                  {SECTIONS.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Table Number</label>
                <select
                  className="input"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value ? parseInt(e.target.value) : '' })}
                  disabled={!formData.tableSection}
                >
                  <option value="">
                    {formData.tableSection ? 'Select Table' : 'Select a section first'}
                  </option>
                  {tablesInSelectedSection.map((t) => (
                    <option key={t.id} value={t.tableNumber}>
                      Table {t.tableNumber} ({t.capacity} seats · {t.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Menu item selection - drives the auto-calculated total below
                  and is saved with the order so it can be shown in Order Details */}
              <div style={{ marginBottom: '1rem' }}>
                <label>Menu Items</label>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
                  {menuCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`btn btn-sm ${menuCategoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setMenuCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  maxHeight: '260px',
                  overflowY: 'auto'
                }}>
                  {itemsToDisplay.length === 0 && (
                    <div style={{ padding: '1rem', color: '#6b7280' }}>
                      No available items in this category.
                    </div>
                  )}
                  {itemsToDisplay.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #f3f4f6'
                      }}
                    >
                      <div>
                        <div><strong>{item.name}</strong></div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {item.category || 'Main Menu'} · ₹{parseFloat(item.price).toFixed(2)}
                        </div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="input"
                        style={{ width: '80px' }}
                        value={cart[item.id] || 0}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Total Amount (₹)</label>
                <input
                  type="text"
                  className="input"
                  value={displayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  disabled
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
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
                  onClick={resetForm}
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