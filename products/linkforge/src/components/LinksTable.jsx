import React, { useState } from 'react';
import './LinksTable.css';

const filters = ['All', 'Active', 'Expired', 'Password'];

const demoLinks = [
  {
    slug: 'lnk.to/launch',
    destination: 'https://acme.com/product-launch-2026',
    created: 'Mar 12',
    status: 'active',
    clicks: 4291,
  },
  {
    slug: 'lnk.to/demo',
    destination: 'https://acme.com/book-a-demo?utm_source=linkedin',
    created: 'Mar 11',
    status: 'active',
    clicks: 2847,
  },
  {
    slug: 'lnk.to/promo',
    destination: 'https://acme.com/spring-sale-2026',
    created: 'Mar 10',
    status: 'active',
    clicks: 1953,
  },
  {
    slug: 'lnk.to/webinar',
    destination: 'https://zoom.us/j/123456789',
    created: 'Mar 8',
    status: 'expired',
    clicks: 891,
  },
  {
    slug: 'lnk.to/report',
    destination: 'https://acme.com/q1-report-download',
    created: 'Mar 7',
    status: 'active',
    clicks: 567,
  },
];

const maxClicks = Math.max(...demoLinks.map((l) => l.clicks));

export default function LinksTable({ links = demoLinks }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered =
    activeFilter === 'All'
      ? links
      : links.filter((l) => l.status === activeFilter.toLowerCase());

  return (
    <div className="card table-card">
      <div className="links-header">
        <h3>Recent Links</h3>
        <div className="links-filters">
          {filters.map((f) => (
            <button
              key={f}
              className={`filter-chip${activeFilter === f ? ' active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <table className="links-table">
        <thead>
          <tr>
            <th>Short Link</th>
            <th>Destination</th>
            <th>Clicks</th>
            <th>Created</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((link) => (
            <tr key={link.slug}>
              <td>
                <span className="link-url">{link.slug}</span>
              </td>
              <td>
                <span className="link-dest">{link.destination}</span>
              </td>
              <td>
                <div className="clicks-bar">
                  <span
                    className="bar"
                    style={{
                      width: `${(link.clicks / maxClicks) * 120}px`,
                    }}
                  />
                  {link.clicks.toLocaleString()}
                </div>
              </td>
              <td>{link.created}</td>
              <td>
                <span className={`tag tag-${link.status}`}>
                  {link.status === 'active' ? 'Active' : 'Expired'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
