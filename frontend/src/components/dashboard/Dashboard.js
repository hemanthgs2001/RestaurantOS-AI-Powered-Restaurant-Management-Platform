import React, { useState, useEffect } from 'react';
import { getDashboardStats, getSalesOverview, getMonthlyExpenses } from '../../api/dashboardApi';
import SalesOverview from './SalesOverview';
import ActiveOrders from './ActiveOrders';
import TableOccupancy from './TableOccupancy';
import LowStockItems from './LowStockItems';
import MonthlyExpenses from './MonthlyExpenses';
import PurchaseSummary from './PurchaseSummary';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, salesRes, expenseRes] = await Promise.all([
        getDashboardStats(),
        getSalesOverview('month'),
        getMonthlyExpenses(new Date().getFullYear())
      ]);
      setStats(statsRes.data?.data || statsRes.data || null);
      setSalesData(salesRes.data?.data || salesRes.data || []);
      setExpenseData(expenseRes.data?.data || expenseRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '400px' }}>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h4 style={{ color: '#6B7280', marginBottom: '0.5rem' }}>Total Revenue</h4>
          <h2 style={{ color: '#1F2937' }}>${stats?.totalRevenue?.toLocaleString() || 0}</h2>
        </div>
        <div className="card">
          <h4 style={{ color: '#6B7280', marginBottom: '0.5rem' }}>Active Orders</h4>
          <h2 style={{ color: '#1F2937' }}>{stats?.activeOrders || 0}</h2>
        </div>
        <div className="card">
          <h4 style={{ color: '#6B7280', marginBottom: '0.5rem' }}>Table Occupancy</h4>
          <h2 style={{ color: '#1F2937' }}>{stats?.tableOccupancy || 0}%</h2>
        </div>
        <div className="card">
          <h4 style={{ color: '#6B7280', marginBottom: '0.5rem' }}>Low Stock Items</h4>
          <h2 style={{ color: '#EF4444' }}>{stats?.lowStockItems || 0}</h2>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <SalesOverview data={salesData} />
        <ActiveOrders data={stats?.activeOrdersList || []} />
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <TableOccupancy data={stats?.tableOccupancyData || []} />
        <LowStockItems data={stats?.lowStockItemsList || []} />
      </div>

      <div className="grid-2">
        <MonthlyExpenses data={expenseData} />
        <PurchaseSummary data={stats?.purchaseSummary || {}} />
      </div>
    </div>
  );
};

export default Dashboard;