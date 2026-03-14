import React from 'react';
import StatCard from '../components/StatCard';
import ClickChart from '../components/ClickChart';
import TopCountries from '../components/TopCountries';
import Devices from '../components/Devices';
import LinksTable from '../components/LinksTable';

const stats = [
  {
    label: 'Total Clicks',
    value: '24,891',
    change: '+12.5%',
    direction: 'up',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <path d="M15 3h6v6" />
        <path d="M10 14L21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </svg>
    ),
  },
  {
    label: 'Active Links',
    value: '1,247',
    change: '+8.3%',
    direction: 'up',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    label: 'Custom Domains',
    value: '5',
    change: '+1',
    direction: 'up',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    label: 'Team Members',
    value: '12',
    change: '+2',
    direction: 'up',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function Dashboard() {
  return (
    <div className="main-content">
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p className="topbar-subtitle">Links engineered to convert</p>
        </div>
        <div className="topbar-actions">
          <div className="topbar-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search links..." />
          </div>
          <button className="btn btn-outline">Export</button>
          <button className="btn btn-primary">+ Create Link</button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            change={s.change}
            direction={s.direction}
            icon={s.icon}
          />
        ))}
      </div>

      <div className="charts-section">
        <ClickChart />
        <div className="side-cards">
          <TopCountries />
          <Devices />
        </div>
      </div>

      <LinksTable />
    </div>
  );
}
