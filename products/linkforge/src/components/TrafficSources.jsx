import React from 'react';

const DEFAULT_SOURCES = [
  { label: 'Direct', percent: 45, color: '#3A8BFD' },
  { label: 'Social', percent: 25, color: '#10B981' },
  { label: 'Email', percent: 15, color: '#F59E0B' },
  { label: 'Other', percent: 15, color: '#E2E8F0' },
];

const styles = {
  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: '#0F172A',
    margin: 0,
  },
  period: {
    fontSize: 12,
    color: '#64748B',
    background: '#F8FAFC',
    padding: '4px 10px',
    borderRadius: 6,
  },
  donutWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  donutInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  donutLabel: {
    fontWeight: 700,
    fontSize: 18,
    color: '#0F172A',
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: '#64748B',
  },
  dot: (color) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }),
};

function buildConicGradient(sources) {
  let angle = 0;
  const stops = sources.map(({ color, percent }) => {
    const start = angle;
    angle += (percent / 100) * 360;
    return `${color} ${start}deg ${angle}deg`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

export default function TrafficSources({ sources = DEFAULT_SOURCES, totalLabel = '84.2K', period = 'This month' }) {
  const gradient = buildConicGradient(sources);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Traffic Sources</h3>
        <span style={styles.period}>{period}</span>
      </div>
      <div style={styles.donutWrap}>
        <div style={styles.donutInner}>
          {/* Donut ring via CSS */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 15,
                color: '#0F172A',
              }}
            >
              {totalLabel}
            </div>
          </div>
          <div style={styles.legend}>
            {sources.map((s) => (
              <div key={s.label} style={styles.legendItem}>
                <span style={styles.dot(s.color)} />
                {s.label} ({s.percent}%)
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
