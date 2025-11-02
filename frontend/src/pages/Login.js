import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectLoading,
  selectError,
  selectIsAuthenticated,
  loginWithGoogle,
  clearError
} from '../ducks/Login.duck';
import './Auth.css';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onGoogleLogin = async () => {
    const result = await dispatch(loginWithGoogle());
    if (result.payload?.success) {
      console.log('Welcome to Motorist App! Thanks for signing in with Google.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">🚗 Motorist App</h1>
          <p className="auth-subtitle">Track your vehicle expenses with ease</p>
        </div>

        <h2>Sign In to Motorist App</h2>
        <p className="auth-subtitle">Track your vehicle expenses with ease</p>

        {error && <div className="error-message">{error}</div>}

        <div className="google-login-section">
          <button
            type="button"
            className="btn btn-google"
            onClick={onGoogleLogin}
            disabled={loading}
          >
            <svg className="google-icon" width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 9H9V12.5H13.28C12.88 13.86 11.56 15 9 15C6.5 15 4.5 13 4.5 10.5S6.5 6 9 6C10.29 6 11.43 6.54 12.26 7.42L15.06 4.62C13.55 3.19 11.45 2.25 9 2.25C4.86 2.25 1.5 5.61 1.5 9.75S4.86 17.25 9 17.25C13.14 17.25 16.5 13.89 16.5 9.75C16.5 9.5 16.49 9.25 16.51 9Z"/>
            </svg>
            {loading ? 'Connecting...' : 'Sign in with Google'}
          </button>
        </div>

        <p className="auth-notice">
          <small>Motorist App uses Google authentication for secure and easy access to your account.</small>
        </p>
      </div>
    </div>
  );
};

export default Login;