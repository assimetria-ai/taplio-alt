import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Link2, BarChart3, QrCode, Globe, Users,
  Tag, Key, Settings, Search, Bell, Plus, Menu, X, ChevronDown
} from 'lucide-react';

const navItems = [
  { section: 'Main', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/links', icon: Link2, label: 'Links' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/qr-codes', icon: QrCode, label: 'QR Codes' },
    { to: '/domains', icon: Globe, label: 'Domains' },
  ]},
  { section: 'Workspace', items: [
    { to: '/team', icon: Users, label: 'Team' },
    { to: '/utm', icon: Tag, label: 'UTM Builder' },
    { to: '/api-keys', icon: Key, label: 'API Keys' },
  ]},
  { section: 'Settings', items: [
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white
        flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="w-8 h-8 bg-[#3A8BFD] rounded-lg flex items-center justify-center">
            <Link2 size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Linkforge</span>
          <button className="ml-auto lg:hidden text-slate-400" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {navItems.map((group) => (
            <div key={group.section} className="mt-4">
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {group.section}
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors duration-100
                    ${isActive
                      ? 'bg-blue-500/15 text-[#3A8BFD]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
                    }
                  `}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Workspace indicator */}
        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-sm font-semibold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-200 truncate">Acme Corp</div>
              <div className="text-xs text-slate-500">Pro Plan</div>
            </div>
            <ChevronDown size={16} className="text-slate-500" />
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenuClick }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 gap-4 shrink-0">
      <button className="lg:hidden text-slate-500" onClick={onMenuClick}>
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search links, tags, domains..."
          className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg
                     text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2
                     focus:ring-blue-500/20 focus:border-blue-400 transition"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="h-9 px-3 rounded-lg border border-slate-200 text-slate-500
                           hover:bg-slate-50 transition flex items-center">
          <Bell size={16} />
        </button>
        <NavLink
          to="/links"
          className="h-9 px-4 rounded-lg bg-[#3A8BFD] hover:bg-blue-600 text-white
                     text-sm font-semibold flex items-center gap-1.5 transition"
        >
          <Plus size={16} />
          New Link
        </NavLink>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3A8BFD] to-purple-500
                        flex items-center justify-center text-xs font-semibold text-white">
          RP
        </div>
      </div>
    </header>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
