import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../ducks/Login.duck';

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleAuthCallback = () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userStr = urlParams.get('user');

        if (token && userStr) {
          const user = JSON.parse(decodeURIComponent(userStr));

          // Store token in localStorage
          localStorage.setItem('token', token);

          // Dispatch user to Redux store
          dispatch(setUser({
            isAuthenticated: true,
            user: user,
            token: token
          }));

          // Redirect to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          // Handle authentication failure
          const error = urlParams.get('error');
          if (error) {
            console.error('Authentication error:', error);
            navigate('/login?error=' + error, { replace: true });
          } else {
            navigate('/login?error=authentication_failed', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        navigate('/login?error=callback_error', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, dispatch]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Authenticating...</h2>
        <p>Please wait while we complete your sign in.</p>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }}></div>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;