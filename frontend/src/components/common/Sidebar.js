import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiLayout, FiShoppingCart, FiMenu, FiBook, 
  FiPackage, FiUsers, FiUser, FiClipboard, FiDollarSign,
  FiFile, FiCalendar, FiCpu, FiUpload, FiTrendingUp,
  FiGrid, FiBox, FiList, FiPieChart, FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/tables', icon: FiLayout, label: 'Tables' },
    { path: '/orders', icon: FiShoppingCart, label: 'Orders' },
    { path: '/menu', icon: FiMenu, label: 'Menu' },
    { path: '/recipes', icon: FiBook, label: 'Recipes' },
    { path: '/ingredients', icon: FiPackage, label: 'Ingredients' },
    { path: '/suppliers', icon: FiUsers, label: 'Suppliers' },
    { path: '/staff', icon: FiUser, label: 'Staff' },
    { path: '/products', icon: FiGrid, label: 'Products' },
    { path: '/categories', icon: FiList, label: 'Categories' },
    { path: '/warehouses', icon: FiBox, label: 'Warehouses' },
    { path: '/stock', icon: FiPieChart, label: 'Stock' },
    { path: '/purchase-orders', icon: FiClipboard, label: 'Purchase Orders' },
    { path: '/expense-categories', icon: FiDollarSign, label: 'Expense Categories' },
    { path: '/expenses', icon: FiFile, label: 'Expenses' },
    { path: '/supplier-invoices', icon: FiUpload, label: 'Supplier Invoices' },
    { path: '/monthly-expenses', icon: FiCalendar, label: 'Monthly Expenses' },
    { path: '/ai', icon: FiCpu, label: 'AI Dashboard' },
    { path: '/ai/stock-predictions', icon: FiTrendingUp, label: 'Stock Predictions' },
    { path: '/ai/menu-recommendations', icon: FiTrendingUp, label: 'Menu Recommendations' },
    { path: '/ai/invoice-processing', icon: FiUpload, label: 'Invoice Processing' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{
      width: open ? '250px' : '70px',
      height: '100vh',
      background: '#1F2937',
      color: 'white',
      position: 'fixed',
      left: 0,
      top: 0,
      transition: 'width 0.3s ease',
      overflowX: 'hidden',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minHeight: '70px'
      }}>
        <FiCpu size={28} color="#4F46E5" />
        {open && <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>RestaurantOS</span>}
      </div>

      <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              color: isActive ? 'white' : '#9CA3AF',
              background: isActive ? '#374151' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              borderLeft: isActive ? '3px solid #4F46E5' : '3px solid transparent',
              whiteSpace: 'nowrap'
            })}
          >
            <item.icon size={20} />
            {open && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={{ 
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        {open ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'capitalize' }}>
                  {user?.role || 'Role'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                marginTop: '0.75rem',
                padding: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: 'none',
                borderRadius: '6px',
                color: '#EF4444',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            >
              <FiLogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '0.5rem'
              }}
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;