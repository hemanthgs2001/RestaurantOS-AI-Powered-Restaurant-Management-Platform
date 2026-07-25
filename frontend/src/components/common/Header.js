import React, { useEffect, useState, useRef } from 'react';
import { FiMenu, FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import socket from '../../utils/socket';
import { getNotifications, markAllNotificationsRead } from '../../api/notificationApi';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.data || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleBellClick = async () => {
    setMenuOpen((prev) => !prev);
    if (unreadCount > 0) {
      await markAllNotificationsRead();
      setUnreadCount(0);
      socket.emit('notification:readAll');
    }
  };

  useEffect(() => {
    fetchNotifications();

    socket.on('notification:new', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prevCount) => prevCount + 1);
    });

    socket.on('notification:count', (count) => {
      setUnreadCount(count);
    });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      socket.off('notification:new');
      socket.off('notification:count');
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header style={{
      height: '70px',
      background: 'white',
      borderBottom: '1px solid #E5E7EB',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: '#4B5563'
          }}
        >
          <FiMenu />
        </button>
        <h2 style={{ fontSize: '1.25rem', color: '#1F2937', fontWeight: '500' }}>
          Welcome back, {user?.name || 'User'}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }} ref={dropdownRef}>
        <button 
          onClick={handleBellClick}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '1.2rem',
            color: '#4B5563',
            position: 'relative'
          }}
        >
          <FiBell />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              minWidth: '18px',
              height: '18px',
              padding: '0 5px',
              background: '#EF4444',
              color: 'white',
              borderRadius: '999px',
              fontSize: '0.7rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: '55px',
            right: '0',
            width: '340px',
            maxHeight: '420px',
            overflowY: 'auto',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
            zIndex: 200
          }}>
            <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#111827' }}>Notifications</h4>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#6B7280' }}>{unreadCount} unread</p>
              </div>
              <button
                onClick={async () => {
                  await markAllNotificationsRead();
                  setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
                  setUnreadCount(0);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Mark all read
              </button>
            </div>
            {notifications.length === 0 ? (
              <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>No notifications yet.</div>
            ) : (
              notifications.slice(0, 8).map((notification) => (
                <div key={notification.id} style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: notification.read ? '#F9FAFB' : '#EFF6FF',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#111827' }}>{notification.title}</div>
                  <div style={{ fontSize: '0.83rem', color: '#4B5563', margin: '0.35rem 0 0' }}>{notification.message}</div>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.35rem' }}>{new Date(notification.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%',
            background: '#4F46E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1F2937' }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'capitalize' }}>
              {user?.role || 'Role'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B7280',
              fontSize: '1.1rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              transition: 'background 0.2s',
              marginLeft: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;