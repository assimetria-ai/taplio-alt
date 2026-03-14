import React from 'react';

const styles = {
  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  value: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '-1px',
    color: '#0F172A',
  },
  change: {
    fontSize: 12,
    marginTop: 6,
  },
};

export default function StatCard({ label, value, change, changeType }) {
  const changeColor =
    changeType === 'up'
      ? '#10B981'
      : changeType === 'down'
      ? '#EF4444'
      : '#64748B';

  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
      {change && (
        <div style={{ ...styles.change, color: changeColor }}>{change}</div>
      )}
    </div>
  );
}
