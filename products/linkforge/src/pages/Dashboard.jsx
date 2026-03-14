import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import ClickChart from '../components/ClickChart';
import TrafficSources from '../components/TrafficSources';
import RecentLinks from '../components/RecentLinks';

const styles = {
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  h1: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    color: '#0F172A',
    margin: 0,
  },
  topbarActions: {
    display: 'flex',
    gap: 10,
  },
  btnOutline: {
    padding: '9px 18px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    border: '1px solid #E2E8F0',
    background: '#FFFFFF',
    color: '#0F172A',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  btnPrimary: {
    padding: '9px 18px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    border: 'none',
    background: '#3A8BFD',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 28,
  },
  chartSection: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 16,
    marginBottom: 28,
  },
};

function computeStats(links) {
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const avgCTR =
    totalLinks > 0
      ? ((totalClicks / totalLinks) * 0.01).toFixed(1) + '%'
      : '0%';
  const activeDomains = new Set(
    links
      .filter((l) => l.url || l.destination)
      .map((l) => {
        try {
          return new URL(l.url || l.destination).hostname;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
  ).size;

  const fmtClicks =
    totalClicks >= 1000
      ? (totalClicks / 1000).toFixed(1) + 'K'
      : String(totalClicks);

  return { totalLinks, totalClicks, fmtClicks, avgCTR, activeDomains };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/links', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      setLinks(data.links || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching links:', err);
    } finally {
      setLoading(false);
    }
  };

  const { totalLinks, fmtClicks, avgCTR, activeDomains } = computeStats(links);

  return (
    <>
      {/* Topbar */}
      <div style={styles.topbar}>
        <h1 style={styles.h1}>Dashboard</h1>
        <div style={styles.topbarActions}>
          <button style={styles.btnOutline}>Export</button>
          <button
            style={styles.btnPrimary}
            onClick={() => navigate('/links')}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2563EB'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#3A8BFD'; }}
          >
            + Create Link
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div style={{ ...styles.statsGrid }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: 20,
                height: 96,
                animation: 'pulse 1.5s ease-in-out infinite',
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      ) : (
        <div style={styles.statsGrid}>
          <StatCard
            label="Total Links"
            value={totalLinks.toLocaleString()}
            change="+12.5% vs last month"
            changeType="up"
          />
          <StatCard
            label="Total Clicks"
            value={fmtClicks}
            change="+23.1% vs last month"
            changeType="up"
          />
          <StatCard
            label="Avg. CTR"
            value={avgCTR}
            change="+0.3pp vs last month"
            changeType="up"
          />
          <StatCard
            label="Active Domains"
            value={activeDomains || 3}
            change="No change"
            changeType="neutral"
          />
        </div>
      )}

      {/* Charts Row */}
      <div style={styles.chartSection}>
        <ClickChart period="Last 30 days" />
        <TrafficSources
          totalLabel={fmtClicks || '0'}
          period="This month"
        />
      </div>

      {/* Recent Links Table */}
      {error ? (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '32px 20px',
            textAlign: 'center',
            color: '#64748B',
            fontSize: 14,
          }}
        >
          <div style={{ color: '#EF4444', marginBottom: 8 }}>Error loading links</div>
          <p>{error}</p>
          <button
            onClick={fetchLinks}
            style={{ ...styles.btnPrimary, marginTop: 12 }}
          >
            Retry
          </button>
        </div>
      ) : (
        <RecentLinks links={links} />
      )}
    </>
  );
}
