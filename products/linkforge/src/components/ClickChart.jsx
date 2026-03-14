import React, { useState } from 'react';
import './ClickChart.css';

const periods = ['7d', '30d', '90d', '1y'];

const barHeights = [
  45, 62, 38, 71, 55, 89, 42, 67, 78, 53, 91, 69,
  47, 83, 56, 74, 61, 95, 72, 58, 85, 44, 76, 63,
  50, 88, 65, 82,
];

export default function ClickChart() {
  const [activePeriod, setActivePeriod] = useState('7d');

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Click Analytics</h3>
        <div className="chart-tabs">
          {periods.map((p) => (
            <button
              key={p}
              className={`chart-tab${activePeriod === p ? ' active' : ''}`}
              onClick={() => setActivePeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-area">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="chart-bar"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
