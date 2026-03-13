/**
 * LinkForge Main App Component
 * Task #10278 - Dashboard Links List UI
 * Task #10314 - Build bulk link import via CSV
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Import from './pages/Import';
import BioPages from './pages/BioPages';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/import" element={<Import />} />
        <Route path="/bio" element={<BioPages />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
