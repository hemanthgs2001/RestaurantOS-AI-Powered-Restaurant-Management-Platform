import React from 'react';
import { FiClock } from 'react-icons/fi';

const ActiveOrders = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="card">No active orders</div>;
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiClock /> Active Orders
      </h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {data.map((order, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.5rem 0',
            borderBottom: '1px solid #E5E7EB'
          }}>
            <span>Order #{order.id}</span>
            <span className="badge badge-info">{order.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveOrders;