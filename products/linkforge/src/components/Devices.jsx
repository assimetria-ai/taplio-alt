import React from 'react';
import './Devices.css';

const devices = [
  { label: 'Mobile', pct: 62, color: 'var(--brand)' },
  { label: 'Desktop', pct: 31, color: '#8B5CF6' },
  { label: 'Tablet', pct: 7, color: 'var(--warning)' },
];

export default function Devices() {
  return (
    <div className="card side-card">
      <div className="card-header">
        <h3>Devices</h3>
      </div>
      <div className="device-list">
        {devices.map((d) => (
          <div key={d.label} className="device-row">
            <span className="device-label">{d.label}</span>
            <div className="device-bar-bg">
              <div
                className="device-bar-fill"
                style={{ width: `${d.pct}%`, background: d.color }}
              />
            </div>
            <span className="device-pct">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
