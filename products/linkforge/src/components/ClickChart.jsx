import React from 'react';

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
  chartWrap: {
    height: 200,
    background: 'linear-gradient(180deg, #EBF3FF 0%, transparent 100%)',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  areaCurve: {
    position: 'absolute',
    inset: 0,
  },
};

export default function ClickChart({ period = 'Last 30 days' }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Click Performance</h3>
        <span style={styles.period}>{period}</span>
      </div>
      <div style={styles.chartWrap}>
        <svg
          style={styles.areaCurve}
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Area fill */}
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3A8BFD" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3A8BFD" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 160 C60 140 90 120 120 100 C150 80 170 90 200 70 C230 50 260 60 300 40 C340 20 370 50 400 30 C430 10 460 25 500 18 C540 11 570 20 600 15 L600 200 L0 200 Z"
            fill="url(#chartGrad)"
          />
          {/* Stroke line */}
          <path
            d="M0 160 C60 140 90 120 120 100 C150 80 170 90 200 70 C230 50 260 60 300 40 C340 20 370 50 400 30 C430 10 460 25 500 18 C540 11 570 20 600 15"
            fill="none"
            stroke="#3A8BFD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
