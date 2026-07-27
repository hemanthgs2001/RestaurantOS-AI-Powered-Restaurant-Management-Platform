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
      background: '#F2FCFA',
      borderBottom: '1px solid #DDF7F1',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(47, 67, 72, 0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onToggleSidebar}
          style={{
            background: '#DDF7F1',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.3rem',
            color: '#2F4348',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FiMenu />
        </button>
        <h2 style={{ fontSize: '1.25rem', color: '#2F4348', fontWeight: '600' }}>
          Welcome back, {user?.name || 'User'}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }} ref={dropdownRef}>
        <button 
          onClick={handleBellClick}
          style={{ 
            background: '#DDF7F1', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '1.15rem',
            color: '#2F4348',
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FiBell />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '18px',
              height: '18px',
              padding: '0 5px',
              background: '#FF6B5D',
              color: 'white',
              borderRadius: '999px',
              fontSize: '0.7rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #F2FCFA'
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
            background: '#FFFFFF',
            border: '1px solid #DDF7F1',
            borderRadius: '14px',
            padding: '1rem',
            boxShadow: '0 12px 32px rgba(47, 67, 72, 0.14)',
            zIndex: 200
          }}>
            <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#2F4348' }}>Notifications</h4>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#6B7F80' }}>{unreadCount} unread</p>
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
                  color: '#2CA88A',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                Mark all read
              </button>
            </div>
            {notifications.length === 0 ? (
              <div style={{ color: '#6B7F80', fontSize: '0.9rem' }}>No notifications yet.</div>
            ) : (
              notifications.slice(0, 8).map((notification) => (
                <div key={notification.id} style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: notification.read ? '#F2FCFA' : '#DDF7F1',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#2F4348' }}>{notification.title}</div>
                  <div style={{ fontSize: '0.83rem', color: '#5C7476', margin: '0.35rem 0 0' }}>{notification.message}</div>
                  <div style={{ fontSize: '0.7rem', color: '#8FA3A4', marginTop: '0.35rem' }}>{new Date(notification.createdAt).toLocaleString()}</div>
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
            background: '#58D1B3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#183430',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2F4348' }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#2CA88A', textTransform: 'capitalize', fontWeight: 500 }}>
              {user?.role || 'Role'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B7F80',
              fontSize: '1.1rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              transition: 'background 0.2s, color 0.2s',
              marginLeft: '0.5rem'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#DDF7F1'; e.currentTarget.style.color = '#2F4348'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7F80'; }}
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;