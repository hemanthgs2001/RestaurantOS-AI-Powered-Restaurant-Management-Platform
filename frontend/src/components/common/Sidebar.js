import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiLayout, FiShoppingCart, FiMenu, FiBook, 
  FiPackage, FiUsers, FiUser, FiClipboard, FiDollarSign,
  FiFile, FiFileText, FiCalendar, FiCpu, FiUpload, FiTrendingUp,
  FiGrid, FiBox, FiList, FiPieChart, FiLogOut,
  FiChevronDown, FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { ROLE_PERMISSIONS } from '../../utils/constants';

const Sidebar = ({ open }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    restaurant: true,
    inventory: true,
    expense: true,
    ai: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuSections = [
    {
      id: 'restaurant',
      label: 'Restaurant Operations',
      icon: FiLayout,
      items: [
        { key: 'tables', path: '/tables', icon: FiLayout, label: 'Table Management' },
        { key: 'orders', path: '/orders', icon: FiShoppingCart, label: 'Order Management' },
        { key: 'menu', path: '/menu', icon: FiMenu, label: 'Menu Management' },
        { key: 'recipes', path: '/recipes', icon: FiBook, label: 'Recipe Management' },
        { key: 'ingredients', path: '/ingredients', icon: FiPackage, label: 'Ingredient Management' },
        { key: 'suppliers', path: '/suppliers', icon: FiUsers, label: 'Supplier Management' },
        { key: 'staff', path: '/staff', icon: FiUser, label: 'Staff Management' },
      ]
    },
    {
      id: 'inventory',
      label: 'Inventory Management',
      icon: FiPackage,
      items: [
        { key: 'products', path: '/products', icon: FiGrid, label: 'Product Management' },
        { key: 'categories', path: '/categories', icon: FiList, label: 'Category Management' },
        { key: 'warehouses', path: '/warehouses', icon: FiBox, label: 'Warehouse / Store Management' },
        { key: 'stock', path: '/stock', icon: FiPieChart, label: 'Stock In / Stock Out' },
        { key: 'purchase_orders', path: '/purchase-orders', icon: FiClipboard, label: 'Purchase Orders' },
      ]
    },
    {
      id: 'expense',
      label: 'Expense Management',
      icon: FiDollarSign,
      items: [
        { key: 'supplier_invoices', path: '/supplier-invoices', icon: FiFileText, label: 'Supplier Invoice Management' },
        { key: 'monthly_expenses', path: '/monthly-expenses', icon: FiCalendar, label: 'Monthly Expense Tracking' },
        { key: 'expense_categories', path: '/expense-categories', icon: FiFile, label: 'Expense Categories' },
        { key: 'expenses', path: '/expenses', icon: FiDollarSign, label: 'Expenses' },
      ]
    },
    {
      id: 'ai',
      label: 'AI & Analytics',
      icon: FiCpu,
      items: [
        { key: 'ai', path: '/ai', icon: FiCpu, label: 'AI Dashboard' },
        { key: 'ai_stock', path: '/ai/stock-predictions', icon: FiTrendingUp, label: 'Stock Predictions' },
        { key: 'ai_menu', path: '/ai/menu-recommendations', icon: FiTrendingUp, label: 'Menu Recommendations' },
        { key: 'ai_invoice', path: '/ai/invoice-processing', icon: FiUpload, label: 'Invoice Processing' },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const renderNavItem = (item, isChild = false) => (
    <NavLink
      key={item.path}
      to={item.path}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: isChild ? '0.6rem 1.5rem 0.6rem 2.5rem' : '0.75rem 1.5rem',
        color: isActive ? '#183430' : '#A9BFC0',
        background: isActive ? '#58D1B3' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        borderLeft: isActive ? '3px solid #DDF7F1' : '3px solid transparent',
        whiteSpace: 'nowrap',
        fontSize: isChild ? '0.875rem' : '1rem',
        fontWeight: isActive ? 600 : 400,
        borderRadius: isActive ? '0 20px 20px 0' : '0'
      })}
    >
      <item.icon size={isChild ? 16 : 20} />
      {open && <span>{item.label}</span>}
    </NavLink>
  );

  const renderSection = (section) => {
    const isExpanded = expandedSections[section.id];
    const Icon = section.icon;

    // compute visible items for this role
    const visibleItems = section.items.filter(i => {
      if (!i.key) return true;
      const role = user?.role || '';
      const perms = ROLE_PERMISSIONS[role] || [];
      return perms.includes('*') || perms.includes(i.key);
    });

    // hide entire section if nothing is visible
    if (visibleItems.length === 0) return null;

    return (
      <div key={section.id} style={{ marginBottom: '0.25rem' }}>
        {/* Section Header */}
        <div
          onClick={() => open && toggleSection(section.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.6rem 1.5rem',
            color: '#7FE0C8',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: open ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginTop: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon size={16} color="#58D1B3" />
            {open && <span>{section.label}</span>}
          </div>
          {open && (
            <span style={{ fontSize: '0.8rem' }}>
              {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
            </span>
          )}
        </div>

        {/* Section Items */}
        {(!open || isExpanded) && (
          <div style={{ 
            overflow: 'hidden',
            transition: 'max-height 0.3s ease',
            maxHeight: (!open || isExpanded) ? '1000px' : '0'
          }}>
                {visibleItems.map(item => renderNavItem(item, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: open ? '250px' : '70px',
      height: '100vh',
      background: '#2F4348',
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
      {/* Logo Section */}
      <div style={{ 
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minHeight: '70px'
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '9px',
          background: '#58D1B3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <FiCpu size={20} color="#183430" />
        </div>
        {open && <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#FFFFFF' }}>RestaurantOS</span>}
      </div>

      {/* Dashboard Link */}
      <div style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <NavLink
          to="/dashboard"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.5rem',
            color: isActive ? '#183430' : '#A9BFC0',
            background: isActive ? '#58D1B3' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            borderLeft: isActive ? '3px solid #DDF7F1' : '3px solid transparent',
            whiteSpace: 'nowrap',
            fontWeight: isActive ? 600 : 400
          })}
        >
          <FiHome size={20} />
          {open && <span>Dashboard</span>}
        </NavLink>
      </div>

      {/* Navigation Sections */}
      <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {menuSections.map(section => renderSection(section))}
      </nav>

      {/* User Profile & Logout */}
      <div style={{ 
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        {open ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#58D1B3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                color: '#183430'
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#FFFFFF' }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: '0.75rem', color: '#7FE0C8', textTransform: 'capitalize' }}>
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
                background: 'rgba(255, 107, 93, 0.14)',
                border: 'none',
                borderRadius: '8px',
                color: '#FF9088',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 93, 0.26)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 107, 93, 0.14)'}
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
                color: '#A9BFC0',
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