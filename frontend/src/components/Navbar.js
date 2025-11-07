import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsAuthenticated,
  selectUser,
  logout
} from '../ducks/Login.duck';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          🚗 MotorMate
        </Link>

        <button
          className="navbar-menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link" onClick={closeMenu}>
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link" onClick={closeMenu}>
                Dashboard
              </Link>
              <Link to="/profile" className="navbar-link" onClick={closeMenu}>
                Profile
              </Link>
              <div className="navbar-user">
                {user?.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="navbar-avatar"
                  />
                )}
                <span className="navbar-username">Welcome, {user?.username || 'User'}</span>
                <button onClick={handleLogout} className="navbar-button">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="navbar-link navbar-signin" onClick={closeMenu}>
              Sign In with Google
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;