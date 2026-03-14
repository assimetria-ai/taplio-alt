/**
 * LinkForge Main App Component
 * Task #10278 - Dashboard Links List UI
 * Task #10314 - Build bulk link import via CSV
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Import from './pages/Import';
import BioPages from './pages/BioPages';
import './App.css';

// Placeholder user — replace with real auth context when available
const PLACEHOLDER_USER = { name: 'Rui Pedro', role: 'Owner' };

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <DashboardLayout user={PLACEHOLDER_USER}>
            <Dashboard />
          </DashboardLayout>
        }
      />
      <Route
        path="/import"
        element={
          <DashboardLayout user={PLACEHOLDER_USER}>
            <Import />
          </DashboardLayout>
        }
      />
      <Route
        path="/bio"
        element={
          <DashboardLayout user={PLACEHOLDER_USER}>
            <BioPages />
          </DashboardLayout>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
