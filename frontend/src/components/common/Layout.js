import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F2FCFA' }}>
      <Sidebar open={sidebarOpen} />
      <div style={{ 
        flex: 1, 
        marginLeft: sidebarOpen ? '250px' : '70px',
        transition: 'margin-left 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main style={{ 
          padding: '2rem',
          flex: 1,
          background: '#F2FCFA',
          minHeight: 'calc(100vh - 70px)'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;