import React, { useState, useEffect } from 'react';
import { Link2, MousePointerClick, TrendingUp, Activity } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import LinksTable from '../components/LinksTable';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/links');
      if (!res.ok) throw new Error('Failed to fetch links');
      const data = await res.json();
      setLinks(data.links || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const avgClicks = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;
  const recentLinks = links.slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your link performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={Link2}
          label="Total Links"
          value={totalLinks.toLocaleString()}
          change={totalLinks > 0 ? 'Active' : null}
          changeType="positive"
        />
        <StatsCard
          icon={MousePointerClick}
          label="Total Clicks"
          value={totalClicks.toLocaleString()}
          change={totalClicks > 0 ? '+' + totalClicks : null}
          changeType="positive"
        />
        <StatsCard
          icon={TrendingUp}
          label="Avg. Clicks/Link"
          value={avgClicks.toLocaleString()}
        />
        <StatsCard
          icon={Activity}
          label="Active Links"
          value={totalLinks.toLocaleString()}
          change="100%"
          changeType="positive"
        />
      </div>

      {/* Recent Links */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Recent Links</h2>
        <p className="text-sm text-slate-500">Your latest short links</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm">
          {error}
        </div>
      ) : (
        <LinksTable links={recentLinks} loading={loading} />
      )}
    </div>
  );
}
