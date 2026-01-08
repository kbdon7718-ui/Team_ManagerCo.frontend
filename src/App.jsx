import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { RequireAuth } from './routes/RequireAuth.jsx';
import { AppShell } from './layout/AppShell.jsx';

import LoginPage from './pages/LoginPage.jsx';
import TimerPage from './pages/TimerPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/timer" replace />} />
        <Route path="timer" element={<TimerPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
