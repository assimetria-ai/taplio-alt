import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const styles = {
  root: {
    minHeight: '100vh',
    background: '#F8FAFC',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  main: {
    marginLeft: 240,
    padding: '28px 32px',
    minHeight: '100vh',
  },
};

export default function DashboardLayout({ user, children }) {
  return (
    <div style={styles.root}>
      <Sidebar user={user} />
      <div style={styles.main}>
        {children ?? <Outlet />}
      </div>
    </div>
  );
}
