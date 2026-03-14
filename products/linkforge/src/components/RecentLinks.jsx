import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    marginBottom: 28,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 20px 16px',
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: '#0F172A',
    margin: 0,
  },
  viewAll: {
    fontSize: 12,
    color: '#64748B',
    background: '#F8FAFC',
    padding: '4px 10px',
    borderRadius: 6,
    textDecoration: 'none',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 500,
    color: '#64748B',
    padding: '10px 14px',
    borderBottom: '1px solid #E2E8F0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  td: {
    padding: 14,
    fontSize: 14,
    borderBottom: '1px solid #E2E8F0',
    color: '#0F172A',
  },
  linkUrl: {
    color: '#3A8BFD',
    fontWeight: 500,
  },
  linkDest: {
    color: '#64748B',
    fontSize: 13,
    maxWidth: 260,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
  },
  tagActive: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
    background: '#D1FAE5',
    color: '#065F46',
  },
  tagExpired: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
    background: '#FEE2E2',
    color: '#991B1B',
  },
  clicksCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  clicksBar: (width) => ({
    height: 6,
    borderRadius: 3,
    background: '#3A8BFD',
    width,
    flexShrink: 0,
  }),
};

function isExpired(link) {
  if (!link.expiresAt) return false;
  return new Date(link.expiresAt) < new Date();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function clickBarWidth(clicks, max) {
  if (!max || max === 0) return 0;
  return Math.round((clicks / max) * 120);
}

export default function RecentLinks({ links = [] }) {
  const recent = links.slice(0, 5);
  const maxClicks = Math.max(...recent.map((l) => l.clicks || 0), 1);

  if (recent.length === 0) {
    return (
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={styles.title}>Recent Links</h3>
          <Link to="/links" style={styles.viewAll}>View all</Link>
        </div>
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
          No links yet. Create your first short link!
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Recent Links</h3>
        <Link to="/links" style={styles.viewAll}>View all</Link>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Short Link</th>
            <th style={styles.th}>Destination</th>
            <th style={styles.th}>Created</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Clicks</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((link) => {
            const expired = isExpired(link);
            const barWidth = clickBarWidth(link.clicks || 0, maxClicks);
            return (
              <tr
                key={link.id}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#EBF3FF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={styles.td}>
                  <span style={styles.linkUrl}>{link.shortUrl || `lnk.to/${link.slug}`}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.linkDest} title={link.url || link.destination}>
                    {link.url || link.destination}
                  </span>
                </td>
                <td style={styles.td}>{formatDate(link.createdAt)}</td>
                <td style={styles.td}>
                  <span style={expired ? styles.tagExpired : styles.tagActive}>
                    {expired ? 'Expired' : 'Active'}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.clicksCell}>
                    <div style={styles.clicksBar(barWidth)} />
                    <span>{(link.clicks || 0).toLocaleString()}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
