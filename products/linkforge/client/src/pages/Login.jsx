import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Loader2, Mail, Lock } from 'lucide-react';
import { api } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = isRegister
        ? await api.register({ email, password, name })
        : await api.login({ email, password });
      if (data.token) localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#3A8BFD] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Link2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Linkforge</h1>
          <p className="text-sm text-slate-500 mt-1">Links engineered to convert</p>
        </div>

        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" required={isRegister}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" required
                  className="w-full h-10 pl-10 pr-3 border border-slate-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password" required
                  className="w-full h-10 pl-10 pr-3 border border-slate-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full h-10 rounded-lg bg-[#3A8BFD] text-white text-sm font-semibold
                         hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-sm text-[#3A8BFD] hover:underline"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
