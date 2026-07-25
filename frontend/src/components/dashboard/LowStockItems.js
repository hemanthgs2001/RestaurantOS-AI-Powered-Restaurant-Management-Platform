import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const LowStockItems = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="card">No low stock items</div>;
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444' }}>
        <FiAlertTriangle /> Low Stock Items
      </h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {data.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.5rem 0',
            borderBottom: '1px solid #E5E7EB'
          }}>
            <span>{item.name}</span>
            <span style={{ color: '#EF4444' }}>{item.quantity} units</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockItems;