import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectLoading } from '../ducks/Login.duck';
import { selectFeatures, selectStats, fetchStats } from '../ducks/Home.duck';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectLoading);
  const features = useSelector(selectFeatures);
  const stats = useSelector(selectStats);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1>🚗 Motorist App</h1>
          <h2>Your Complete Vehicle Management Solution</h2>
          <p>Track expenses, monitor service history, and manage important dates - all in one easy-to-use platform designed for motorists.</p>

          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">
                Go to Your Garage
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary">
                <span style={{ marginRight: '8px' }}>🔐</span>
                Sign In with Google
              </Link>
            )}
          </div>
        </div>

        <div className="hero-visual">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="app-header">
                <div className="vehicle-info">
                  <h3>My Blue Truck</h3>
                  <p>2022 Ford F-150</p>
                </div>
              </div>
              <div className="quick-stats">
                <div className="stat-card fuel">
                  <span className="stat-icon">⛽</span>
                  <div>
                    <span className="stat-label">Fuel This Month</span>
                    <span className="stat-value">$245</span>
                  </div>
                </div>
                <div className="stat-card service">
                  <span className="stat-icon">🔧</span>
                  <div>
                    <span className="stat-label">Last Service</span>
                    <span className="stat-value">2,345 mi</span>
                  </div>
                </div>
              </div>
              <div className="recent-expenses">
                <h4>Recent Expenses</h4>
                <div className="expense-item">
                  <span>⛽ Fuel</span>
                  <span>$45.20</span>
                </div>
                <div className="expense-item">
                  <span>🔧 Oil Change</span>
                  <span>$35.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Everything You Need to Manage Your Vehicle</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚗</div>
              <h3>Vehicle Garage</h3>
              <p>Add multiple vehicles to your garage and track each one separately. Store make, model, year, and give them nicknames you'll remember.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⛽</div>
              <h3>Expense Tracking</h3>
              <p>Log fuel purchases, service costs, and other expenses. Track odometer readings and see your complete spending history.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Service History</h3>
              <p>Keep detailed records of all maintenance work done. Never forget when you last changed your oil or rotated your tires.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Important Dates</h3>
              <p>Store insurance details, policy numbers, and expiry dates. Track when your next service is due by date or odometer reading.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Trip Logging</h3>
              <p>Manually log trips with start/end locations, distance, and costs. Perfect for business travel or personal record keeping.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile First</h3>
              <p>Works great on your phone! Access your vehicle information anywhere, anytime. No app download required.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <h2>Ready to Take Control of Your Vehicle Expenses?</h2>
          <p>Join thousands of motorists who are already tracking their vehicles smarter with secure Google authentication.</p>
          <Link to={isAuthenticated ? "/dashboard" : "/login"} className="btn btn-primary btn-large">
            {isAuthenticated ? "Open Your Garage" : "Start Tracking with Google"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;