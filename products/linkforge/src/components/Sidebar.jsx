import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutGrid,
  Link2,
  BarChart3,
  QrCode,
  Globe,
  Users,
  Wrench,
} from 'lucide-react';

const navMain = [
  { label: 'Dashboard', icon: LayoutGrid, to: '/dashboard' },
  { label: 'Links', icon: Link2, to: '/links' },
  { label: 'Analytics', icon: BarChart3, to: '/analytics' },
  { label: 'QR Codes', icon: QrCode, to: '/qr' },
];

const navSettings = [
  { label: 'Domains', icon: Globe, to: '/domains' },
  { label: 'Team', icon: Users, to: '/team' },
  { label: 'API Keys', icon: Wrench, to: '/api-keys' },
];

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: 240,
    background: '#0F172A',
    color: '#fff',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    zIndex: 100,
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    padding: '0 8px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: 16,
    color: '#3A8BFD',
  },
  logoSpan: { color: '#fff' },
  sectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.3)',
    padding: '16px 12px 6px',
  },
  navLink: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
    borderRadius: 8,
    fontSize: 14,
    background: active ? 'rgba(58,139,253,0.2)' : 'transparent',
    transition: 'all 0.15s',
    cursor: 'pointer',
  }),
  bottom: {
    marginTop: 'auto',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#3A8BFD',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  userInfo: { fontSize: 13 },
  userRole: { color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block' },
};

function NavLink({ item, active }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      style={styles.navLink(active)}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      {item.label}
    </Link>
  );
}

export default function Sidebar({ user }) {
  const location = useLocation();
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <nav style={styles.sidebar}>
      <div style={styles.logo}>
        Link<span style={styles.logoSpan}>forge</span>
      </div>

      {navMain.map((item) => (
        <NavLink
          key={item.to}
          item={item}
          active={location.pathname === item.to || (item.to === '/dashboard' && location.pathname === '/')}
        />
      ))}

      <div style={styles.sectionLabel}>Settings</div>

      {navSettings.map((item) => (
        <NavLink
          key={item.to}
          item={item}
          active={location.pathname === item.to}
        />
      ))}

      <div style={styles.bottom}>
        <div style={styles.user}>
          <div style={styles.avatar}>{initials}</div>
          <div style={styles.userInfo}>
            {user?.name || 'User'}
            <small style={styles.userRole}>{user?.role || 'Owner'}</small>
          </div>
        </div>
      </div>
    </nav>
  );
}
