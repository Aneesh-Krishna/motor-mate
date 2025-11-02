import React from 'react';
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

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🚗 Motorist App
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/profile" className="navbar-link">
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
                <span className="navbar-username">Welcome, {user?.username}</span>
                <button onClick={handleLogout} className="navbar-button">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="navbar-link navbar-signin">
              Sign In with Google
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;