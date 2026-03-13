/**
 * Bio Pages Management with QR Code Generator
 * Task #10544 - QR code generator for Linkforge bio pages
 *
 * Features:
 * - List / create / manage bio pages
 * - QR code generator with customisable colors
 * - Download as PNG or SVG
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

const API = '/api/bio-pages';

// ---------------------------------------------------------------------------
// QR Code Generator Modal
// ---------------------------------------------------------------------------

function QRCodeGenerator({ page, onClose }) {
  const [color, setColor] = useState('#000000');
  const [bgcolor, setBgcolor] = useState('#ffffff');
  const [size, setSize] = useState(300);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const fetchPreview = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ size, color, bgcolor });
      const res = await fetch(`${API}/${page.username}/qrcode/preview?${params}`);
      const data = await res.json();
      if (data.success) setPreview(data);
    } catch (err) {
      console.error('Preview fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [page.username, size, color, bgcolor]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const handleDownload = async (format) => {
    const params = new URLSearchParams({ format, size, color, bgcolor, download: '1' });
    const url = `${API}/${page.username}/qrcode?${params}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `bio-${page.username}-qr.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            QR Code · <span className="text-blue-600">/{page.username}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {/* Preview */}
        <div className="flex justify-center p-4 border rounded-lg" style={{ backgroundColor: bgcolor }}>
          {loading ? (
            <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400">Generating…</div>
          ) : preview ? (
            <img ref={canvasRef} src={preview.qrCode} alt="QR Code" className="max-w-[200px]" />
          ) : null}
        </div>

        {/* Color controls */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">QR Color</span>
            <div className="flex items-center gap-2 mt-1">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
              <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 border rounded px-2 py-1 text-sm font-mono" />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Background</span>
            <div className="flex items-center gap-2 mt-1">
              <input type="color" value={bgcolor} onChange={(e) => setBgcolor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
              <input type="text" value={bgcolor} onChange={(e) => setBgcolor(e.target.value)} className="flex-1 border rounded px-2 py-1 text-sm font-mono" />
            </div>
          </label>
        </div>

        {/* Size slider */}
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Size: {size}px</span>
          <input type="range" min="100" max="1000" step="50" value={size} onChange={(e) => setSize(Number(e.target.value))}
            className="w-full mt-1" />
        </label>

        {/* Quick color presets */}
        <div>
          <span className="text-sm font-medium text-gray-700">Presets</span>
          <div className="flex gap-2 mt-1">
            {[
              { label: 'Classic', c: '#000000', bg: '#ffffff' },
              { label: 'Navy', c: '#1e3a5f', bg: '#f0f4f8' },
              { label: 'Brand', c: '#3A8BFD', bg: '#ffffff' },
              { label: 'Dark', c: '#ffffff', bg: '#1a1a2e' },
              { label: 'Forest', c: '#1b4332', bg: '#d8f3dc' },
            ].map((p) => (
              <button key={p.label} onClick={() => { setColor(p.c); setBgcolor(p.bg); }}
                className="px-3 py-1 text-xs font-medium border rounded-full hover:bg-gray-100 transition">
                <span className="inline-block w-3 h-3 rounded-full mr-1 align-middle border" style={{ backgroundColor: p.c }} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Download buttons */}
        <div className="flex gap-3 pt-2">
          <button onClick={() => handleDownload('png')}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            Download PNG
          </button>
          <button onClick={() => handleDownload('svg')}
            className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
            Download SVG
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Bio Page Form
// ---------------------------------------------------------------------------

function CreateBioPageForm({ onCreated }) {
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), title: title.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      setUsername('');
      setTitle('');
      onCreated(data.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">New Bio Page</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <input type="text" placeholder="username (URL slug)" value={username} onChange={(e) => setUsername(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm" required />
        <input type="text" placeholder="Display title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm" required />
      </div>
      <button type="submit" disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
        {saving ? 'Creating…' : 'Create Bio Page'}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function BioPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrPage, setQrPage] = useState(null);

  const fetchPages = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (data.success) setPages(data.pages);
    } catch (err) {
      console.error('Fetch bio pages error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bio page?')) return;
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bio Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Link-in-bio pages with QR code generator</p>
        </div>
        <a href="/dashboard" className="text-sm text-blue-600 hover:underline">Back to Dashboard</a>
      </div>

      <CreateBioPageForm onCreated={(p) => setPages((prev) => [p, ...prev])} />

      {loading ? (
        <p className="text-gray-400 mt-8 text-center">Loading…</p>
      ) : pages.length === 0 ? (
        <p className="text-gray-400 mt-8 text-center">No bio pages yet. Create one above.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {pages.map((page) => (
            <div key={page.id} className="bg-white rounded-xl border p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{page.title}</h3>
                <p className="text-sm text-gray-500">/bio/{page.username} · {page.bioLinks?.length || 0} links · {page.views} views</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setQrPage(page)}
                  className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                  QR Code
                </button>
                <button onClick={() => handleDelete(page.id)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {qrPage && <QRCodeGenerator page={qrPage} onClose={() => setQrPage(null)} />}
    </div>
  );
}
