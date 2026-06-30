import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar">
      <div className="brand">
        <div className="brand-dot" />
        JobTracker
      </div>
      <nav>
        <span className="user-pill">👤 {user?.username}</span>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/kanban" className={({ isActive }) => isActive ? 'active' : ''}>
          Kanban
        </NavLink>
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  );
}
