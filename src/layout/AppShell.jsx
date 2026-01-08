import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import Header from '../ui/Header.jsx';
import Button from '../ui/Button.jsx';
import { useAuth } from '../state/AuthContext';

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app">
      <Header
        left={
          <div className="headerLeft">
            <div className="brand">Team Time Tracker</div>
            <nav className="nav">
              <NavLink className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')} to="/timer">
                Timer
              </NavLink>
              <NavLink className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')} to="/dashboard">
                Dashboard
              </NavLink>
            </nav>
          </div>
        }
        right={
          <div className="headerRight">
            <div className="userPill">{user?.name}</div>
            <Button
              variant="secondary"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </div>
        }
      />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
