import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectLoading,
  selectError,
  selectSuccess,
  registerUser,
  clearRegisterState
} from '../ducks/Register.duck';
import { selectIsAuthenticated, signUpWithGoogle } from '../ducks/Login.duck';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const { username, email, password, confirmPassword } = formData;

  useEffect(() => {
    if (isAuthenticated || success) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, success, navigate]);

  useEffect(() => {
    dispatch(clearRegisterState());
  }, [dispatch]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    const result = await dispatch(registerUser(username, email, password));

    if (result.payload?.success) {
      navigate('/dashboard');
    }
  };

  const onGoogleSignUp = async () => {
    const result = await dispatch(signUpWithGoogle());
    if (result.payload?.success) {
      console.log('Welcome to Motorist App! Your account has been created with Google.');
      navigate('/dashboard');
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">🚗 Motorist App</h1>
          <p className="auth-subtitle">Start tracking your vehicle expenses today</p>
        </div>

        <h2>Create Account</h2>

        {displayError && <div className="error-message">{displayError}</div>}

        <div className="google-login-section">
          <button
            type="button"
            className="btn btn-google"
            onClick={onGoogleSignUp}
            disabled={loading}
          >
            <svg className="google-icon" width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 9H9V12.5H13.28C12.88 13.86 11.56 15 9 15C6.5 15 4.5 13 4.5 10.5S6.5 6 9 6C10.29 6 11.43 6.54 12.26 7.42L15.06 4.62C13.55 3.19 11.45 2.25 9 2.25C4.86 2.25 1.5 5.61 1.5 9.75S4.86 17.25 9 17.25C13.14 17.25 16.5 13.89 16.5 9.75C16.5 9.5 16.49 9.25 16.51 9Z"/>
            </svg>
            {loading ? 'Creating account...' : 'Sign up with Google'}
          </button>
        </div>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              required
              minLength="3"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              minLength="6"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              required
              minLength="6"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;