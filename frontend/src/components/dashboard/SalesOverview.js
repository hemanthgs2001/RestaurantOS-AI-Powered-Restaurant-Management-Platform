import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/helpers';

const SalesOverview = ({ data }) => {
  if (!data) {
    return <div className="card">No sales data available</div>;
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>Sales Overview</h3>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : value, name]} />
            <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} />
            <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesOverview;