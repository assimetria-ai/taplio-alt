import React from 'react';
import './StatCard.css';

export default function StatCard({ label, value, change, direction, icon }) {
  const changeClass =
    direction === 'up'
      ? 'stat-change up'
      : direction === 'down'
      ? 'stat-change down'
      : 'stat-change';

  return (
    <div className="stat-card">
      <div className="stat-label">
        {icon && <span className="stat-icon">{icon}</span>}
        {label}
      </div>
      <div className="stat-value">{value}</div>
      <div className={changeClass}>{change}</div>
    </div>
  );
}
