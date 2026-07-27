import React from 'react';
import { FiClock } from 'react-icons/fi';

const getStatusBadge = (status) => {
  const badges = {
    accepted: 'badge-success',
    cancelled: 'badge-danger',
    completed: 'badge-info'
  };
  return badges[status] || 'badge-info';
};

const ActiveOrders = ({ data = [] }) => {
  return (
    <div className="card">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <FiClock /> Active Orders
      </h3>

      {data.length === 0 && (
        <p style={{ color: '#6B7280' }}>No active orders right now.</p>
      )}

      {data.map((order) => (
        <div
          key={order.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 0',
            borderBottom: '1px solid #f3f4f6'
          }}
        >
          <div>
            <strong>Order #{order.orderNumber}</strong>
            {order.tableNumber ? (
              <span style={{ color: '#6B7280', marginLeft: '0.5rem' }}>
                · Table {order.tableNumber}
              </span>
            ) : null}
          </div>
          <span className={`badge ${getStatusBadge(order.status)}`}>
            {order.status}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ActiveOrders;