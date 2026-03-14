import React from 'react';
import './TopCountries.css';

const countries = [
  { name: 'United States', flag: '🇺🇸', clicks: 8421 },
  { name: 'United Kingdom', flag: '🇬🇧', clicks: 3187 },
  { name: 'Germany', flag: '🇩🇪', clicks: 2544 },
  { name: 'Brazil', flag: '🇧🇷', clicks: 1892 },
  { name: 'India', flag: '🇮🇳', clicks: 1456 },
];

const maxClicks = Math.max(...countries.map((c) => c.clicks));

export default function TopCountries() {
  return (
    <div className="card side-card">
      <div className="card-header">
        <h3>Top Countries</h3>
      </div>
      <div className="geo-list">
        {countries.map((c) => (
          <div key={c.name} className="geo-row">
            <span className="geo-flag">{c.flag}</span>
            <span className="geo-country">{c.name}</span>
            <div className="geo-bar-bg">
              <div
                className="geo-bar-fill"
                style={{ width: `${(c.clicks / maxClicks) * 100}%` }}
              />
            </div>
            <span className="geo-count">{c.clicks.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
