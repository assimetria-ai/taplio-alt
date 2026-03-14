import React from 'react';
import { BarChart3, Globe, Monitor, Clock } from 'lucide-react';

export default function Analytics() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">Track your link performance</p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-12 h-12 bg-[#3A8BFD]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={24} className="text-[#3A8BFD]" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Click Analytics</h3>
          <p className="text-sm text-slate-500">Time-series click data with charts</p>
          <span className="inline-block mt-3 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Coming Soon</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-12 h-12 bg-[#3A8BFD]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Globe size={24} className="text-[#3A8BFD]" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Geographic Data</h3>
          <p className="text-sm text-slate-500">Country and city breakdown of clicks</p>
          <span className="inline-block mt-3 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Coming Soon</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-12 h-12 bg-[#3A8BFD]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Monitor size={24} className="text-[#3A8BFD]" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Device & Browser</h3>
          <p className="text-sm text-slate-500">OS, browser, and device type detection</p>
          <span className="inline-block mt-3 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Coming Soon</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-12 h-12 bg-[#3A8BFD]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Clock size={24} className="text-[#3A8BFD]" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Referrer Tracking</h3>
          <p className="text-sm text-slate-500">See where your clicks come from</p>
          <span className="inline-block mt-3 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
