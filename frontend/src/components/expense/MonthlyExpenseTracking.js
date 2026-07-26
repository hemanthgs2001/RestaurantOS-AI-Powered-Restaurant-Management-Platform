import React, { useState, useEffect } from 'react';
import { getMonthlyExpenses } from '../../api/expenseApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MonthlyExpenseTracking = () => {
  const [expenseData, setExpenseData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const COLORS = ['#4F46E5', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    fetchExpenseData();
  }, [year]);

  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      const response = await getMonthlyExpenses(year);
      setExpenseData(response.data);
      
      // Aggregate by category for pie chart
      const categoryMap = {};
      response.data.forEach(item => {
        if (item.categoryName) {
          categoryMap[item.categoryName] = (categoryMap[item.categoryName] || 0) + item.amount;
        }
      });
      const pieData = Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
      }));
      setCategoryData(pieData);
    } catch (error) {
      toast.error('Failed to fetch monthly expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  const getTotalExpenses = () => {
    return expenseData.reduce((sum, item) => sum + item.amount, 0);
  };

  const getAverageExpense = () => {
    const total = getTotalExpenses();
    return expenseData.length > 0 ? total / expenseData.length : 0;
  };

  if (loading) return <div className="flex-center" style={{ height: '400px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Monthly Expense Tracking</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label>Year:</label>
          <input
            type="number"
            className="input"
            value={year}
            onChange={handleYearChange}
            style={{ width: '100px' }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h4 style={{ color: '#6B7280', marginBottom: '0.5rem' }}>Total Expenses</h4>
          <h2 style={{ color: '#1F2937' }}>{formatCurrency(getTotalExpenses())}</h2>
        </div>
        <div className="card">
          <h4 style={{ color: '#6B7280', marginBottom: '0.5rem' }}>Monthly Average</h4>
          <h2 style={{ color: '#1F2937' }}>{formatCurrency(getAverageExpense())}</h2>
        </div>
        <div className="card">
          <h4 style={{ color: '#6B7280', marginBottom: '0.5rem' }}>Months Tracked</h4>
          <h2 style={{ color: '#1F2937' }}>{expenseData.length}</h2>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Monthly Expenses</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="amount" fill="#4F46E5" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Expenses by Category</h3>
          <div style={{ height: '300px' }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-center" style={{ height: '100%' }}>
                <p style={{ color: '#6B7280' }}>No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Detailed Breakdown</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Amount</th>
                <th>% of Total</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {expenseData.map((item, index) => {
                const total = getTotalExpenses();
                const percentage = total > 0 ? (item.amount / total) * 100 : 0;
                const trend = index > 0 ? ((item.amount - expenseData[index-1].amount) / expenseData[index-1].amount) * 100 : 0;
                
                return (
                  <tr key={index}>
                    <td><strong>{item.month}</strong></td>
                    <td>${item.amount.toFixed(2)}</td>
                    <td>{percentage.toFixed(1)}%</td>
                    <td>
                      {index > 0 && (
                        <span style={{ color: trend >= 0 ? '#EF4444' : '#10B981' }}>
                          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyExpenseTracking;