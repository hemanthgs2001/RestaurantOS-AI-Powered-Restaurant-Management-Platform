import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { formatCurrency } from '../../utils/helpers';

const PurchaseSummary = ({ data }) => {
  if (!data) {
    return <div className="card">No purchase summary available</div>;
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiShoppingCart /> Purchase Summary
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Total Orders</p>
          <h3>{data.totalOrders || 0}</h3>
        </div>
        <div>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Total Amount</p>
          <h3>{formatCurrency(data.totalAmount || 0)}</h3>
        </div>
        <div>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Pending Orders</p>
          <h3 style={{ color: '#F59E0B' }}>{data.pendingOrders || 0}</h3>
        </div>
        <div>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Completed Orders</p>
          <h3 style={{ color: '#10B981' }}>{data.completedOrders || 0}</h3>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSummary;