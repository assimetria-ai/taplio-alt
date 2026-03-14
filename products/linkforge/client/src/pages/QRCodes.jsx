import React, { useState } from 'react';
import { QrCode, Download, Palette, Image, Copy, Check, Link2 } from 'lucide-react';

const MOCK_QR_LINKS = [
  { id: '1', slug: 'launch', url: 'https://acme.com/product-launch-2026', qrClicks: 891, directClicks: 3400 },
  { id: '2', slug: 'demo', url: 'https://acme.com/book-a-demo', qrClicks: 423, directClicks: 2424 },
  { id: '3', slug: 'promo', url: 'https://acme.com/spring-sale', qrClicks: 312, directClicks: 1641 },
  { id: '4', slug: 'event', url: 'https://acme.com/summit-2026', qrClicks: 156, directClicks: 735 },
];

function QRPreview({ color = '#0F172A', size = 120 }) {
  // Simple QR-like pattern
  const grid = [
    [1,1,1,0,1,0,1,1,1],
    [1,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,0,1,1,1],
    [0,0,0,0,1,0,0,0,0],
    [1,0,1,1,0,1,1,0,1],
    [0,0,0,0,1,0,0,0,0],
    [1,1,1,0,0,0,1,1,1],
    [1,0,1,0,1,0,1,0,1],
    [1,1,1,0,1,0,1,1,1],
  ];
  const cellSize = size / grid.length;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" rx="8" />
      {grid.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize + 2}
              y={y * cellSize + 2}
              width={cellSize - 1}
              height={cellSize - 1}
              rx={2}
              fill={color}
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function QRCodes() {
  const [selectedLink, setSelectedLink] = useState(null);
  const [fgColor, setFgColor] = useState('#0F172A');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [format, setFormat] = useState('png');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">QR Codes</h1>
          <p className="text-sm text-slate-500 mt-0.5">Generate and customize QR codes for your links</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Generator */}
        <div className="xl:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">QR Generator</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Link</label>
            <select
              value={selectedLink || ''}
              onChange={e => setSelectedLink(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Choose a link...</option>
              {MOCK_QR_LINKS.map(l => (
                <option key={l.id} value={l.id}>lnk.to/{l.slug}</option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="flex justify-center my-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <QRPreview color={fgColor} size={160} />
          </div>

          {/* Customization */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700 w-20">Foreground</label>
              <input
                type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
              />
              <span className="font-mono text-xs text-slate-500">{fgColor}</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700 w-20">Background</label>
              <input
                type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
              />
              <span className="font-mono text-xs text-slate-500">{bgColor}</span>
            </div>
          </div>

          {/* Download */}
          <div className="flex gap-2">
            <select
              value={format} onChange={e => setFormat(e.target.value)}
              className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="png">PNG</option>
              <option value="svg">SVG</option>
            </select>
            <button className="flex-1 h-9 rounded-lg bg-[#3A8BFD] text-white text-sm font-semibold
                               hover:bg-blue-600 flex items-center justify-center gap-2 transition">
              <Download size={14} /> Download QR
            </button>
          </div>
        </div>

        {/* QR Links list */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Links with QR Codes</h3>
            <p className="text-sm text-slate-500 mt-0.5">Track QR code scans vs direct clicks</p>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_QR_LINKS.map(link => {
              const total = link.qrClicks + link.directClicks;
              const qrPct = Math.round((link.qrClicks / total) * 100);
              return (
                <div key={link.id} className="px-6 py-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                      <QRPreview color="#3A8BFD" size={48} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-medium text-[#3A8BFD]">lnk.to/{link.slug}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{link.url}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">{link.qrClicks.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">QR scans</div>
                    </div>
                    <div className="w-32">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-slate-400">QR {qrPct}%</span>
                        <span className="text-[10px] font-semibold text-slate-400 ml-auto">Direct {100 - qrPct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-[#3A8BFD] rounded-l-full" style={{ width: `${qrPct}%` }} />
                        <div className="h-full bg-purple-400 rounded-r-full" style={{ width: `${100 - qrPct}%` }} />
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
