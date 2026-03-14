import React, { useState, useMemo } from 'react';
import { Tag, Copy, Check, Plus, Trash2, Save, RotateCcw } from 'lucide-react';

const PRESETS = [
  { name: 'Google Ads', source: 'google', medium: 'cpc', campaign: '' },
  { name: 'Meta Ads', source: 'facebook', medium: 'paid_social', campaign: '' },
  { name: 'LinkedIn Ads', source: 'linkedin', medium: 'paid_social', campaign: '' },
  { name: 'Email Newsletter', source: 'newsletter', medium: 'email', campaign: '' },
  { name: 'Twitter Post', source: 'twitter', medium: 'social', campaign: '' },
];

const SAVED_TEMPLATES = [
  { id: '1', name: 'Q1 Campaign', source: 'google', medium: 'cpc', campaign: 'q1-2026', term: 'saas tools', content: 'banner-a' },
  { id: '2', name: 'Newsletter March', source: 'newsletter', medium: 'email', campaign: 'mar-2026', term: '', content: 'header-cta' },
  { id: '3', name: 'Product Hunt Launch', source: 'producthunt', medium: 'referral', campaign: 'ph-launch', term: '', content: '' },
];

export default function UTMBuilder() {
  const [baseUrl, setBaseUrl] = useState('https://acme.com/product');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  const generatedUrl = useMemo(() => {
    if (!baseUrl) return '';
    const params = new URLSearchParams();
    if (source) params.set('utm_source', source);
    if (medium) params.set('utm_medium', medium);
    if (campaign) params.set('utm_campaign', campaign);
    if (term) params.set('utm_term', term);
    if (content) params.set('utm_content', content);
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  }, [baseUrl, source, medium, campaign, term, content]);

  const applyPreset = (preset) => {
    setSource(preset.source);
    setMedium(preset.medium);
    if (preset.campaign) setCampaign(preset.campaign);
    if (preset.term) setTerm(preset.term);
    if (preset.content) setContent(preset.content);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setSource(''); setMedium(''); setCampaign(''); setTerm(''); setContent('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">UTM Builder</h1>
          <p className="text-sm text-slate-500 mt-0.5">Build and save UTM parameter templates for campaigns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Builder */}
        <div className="xl:col-span-2 space-y-4">
          {/* Base URL */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-slate-700 mb-2">Base URL</label>
            <input
              type="url" value={baseUrl} onChange={e => setBaseUrl(e.target.value)}
              placeholder="https://yoursite.com/page"
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          {/* UTM Parameters */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">UTM Parameters</h3>
              <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <RotateCcw size={12} /> Reset
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Source *', value: source, set: setSource, placeholder: 'e.g., google, newsletter, twitter', required: true },
                { label: 'Medium *', value: medium, set: setMedium, placeholder: 'e.g., cpc, email, social', required: true },
                { label: 'Campaign *', value: campaign, set: setCampaign, placeholder: 'e.g., spring-sale, product-launch' },
                { label: 'Term', value: term, set: setTerm, placeholder: 'e.g., running shoes (paid keywords)' },
                { label: 'Content', value: content, set: setContent, placeholder: 'e.g., banner-a, sidebar-link' },
              ].map(field => (
                <div key={field.label} className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700 w-24 shrink-0">{field.label}</label>
                  <input
                    type="text" value={field.value} onChange={e => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    className="flex-1 h-9 px-3 border border-slate-200 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Generated URL */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900">Generated URL</h3>
              <div className="flex gap-2">
                <button
                  className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium
                             text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Save size={12} /> Save Template
                </button>
                <button
                  className="h-8 px-3 rounded-lg bg-[#3A8BFD] text-white text-xs font-semibold
                             hover:bg-blue-600 flex items-center gap-1.5"
                >
                  <Plus size={12} /> Create Short Link
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3
                              font-mono text-xs text-slate-700 break-all select-all">
                {generatedUrl}
              </div>
              <button
                onClick={copyUrl}
                className="shrink-0 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50
                           text-slate-500 hover:text-slate-700 transition"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-3">Quick Presets</h3>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium
                             text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-[#3A8BFD]
                             transition"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Saved Templates */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-fit">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Saved Templates</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {SAVED_TEMPLATES.map(tmpl => (
              <div
                key={tmpl.id}
                className="px-5 py-4 hover:bg-slate-50/50 cursor-pointer transition group"
                onClick={() => applyPreset(tmpl)}
              >
                <div className="text-sm font-medium text-slate-900 mb-1">{tmpl.name}</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-blue-50 text-[#3A8BFD] px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    {tmpl.source}
                  </span>
                  <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    {tmpl.medium}
                  </span>
                  {tmpl.campaign && (
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                      {tmpl.campaign}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
