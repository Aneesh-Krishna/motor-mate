import React, { useState, useEffect } from 'react';
import CommunityPage from './pages/Community';
import AnalyticsPage from './pages/Analytics';
import './MotorMateAppMobile.css';

function getTotalFormattedCost(trips) {
  const total = trips.reduce((sum, trip) => {
    // Remove "₹" and commas, convert to number
    const cost = parseFloat(trip.formattedCost.replace(/[₹,]/g, ""));
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  // Return it formatted back as ₹ with 2 decimals
  return `₹${total.toFixed(2)}`;
}

function getTotalDistance(trips) {
  const total = trips.reduce((sum, trip) => {
    const cost = parseFloat(trip?.distance);
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  return `${total.toFixed(0)}`;
}

function getAverageDistance(trips) {
  const total = trips.reduce((sum, trip) => {
    const cost = parseFloat(trip?.distance);
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  const average = total / trips.length;

  return `${average.toFixed(0)}`;
}

// Mobile-Optimized MotorMate App Component
const MotorMateAppMobile = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Check for authentication status on component mount
  useEffect(() => {
    // Check if this is a Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    const error = urlParams.get('error');

    if (token && user) {
      // Store auth data and redirect to dashboard
      localStorage.setItem('token', token);
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (e) {
        localStorage.setItem('user', user);
      }
      setIsLoggedIn(true);
      localStorage.setItem('currentPage', 'dashboard');
      setCurrentPage('dashboard');
      setIsLoading(false);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      // Handle authentication error
      console.error('Authentication error:', error);
      setIsLoading(false);
    } else {
      checkAuthStatus();
    }
  }, []);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage, isLoggedIn]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const savedPage = localStorage.getItem('currentPage') || 'dashboard';
      setCurrentPage(savedPage);
    }
    setIsLoading(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
    setIsLoggedIn(false);
    setCurrentPage('home');
    setShowMobileMenu(false);
  };

  const navigateToPage = (page) => {
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
    setShowMobileMenu(false);
  };

  // Handle mobile back button
  useEffect(() => {
    const handleBackButton = (e) => {
      if (currentPage !== 'dashboard') {
        e.preventDefault();
        navigateToPage('dashboard');
      }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="mobile-loading-screen">
        <div className="mobile-loading-content">
          <div className="mobile-loading-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <h2>MotorMate</h2>
          <p>Loading your vehicle manager...</p>
          <div className="mobile-loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPageMobile onLogin={handleLogin} />;
  }

  return (
    <div className="mobile-app-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-header-content">
          <div className="mobile-header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showMobileMenu ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div className="mobile-header-title">
              <span className="mobile-app-name">MotorMate</span>
              <span className="mobile-page-name">{getPageTitle(currentPage)}</span>
            </div>
          </div>
          <div className="mobile-header-right">
            <div className="mobile-user-avatar">
              <span>U</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-menu-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-menu-user">
                <div className="mobile-menu-avatar">
                  <span>U</span>
                </div>
                <div>
                  <div className="mobile-menu-username">Welcome, User</div>
                  <div className="mobile-menu-email">user@example.com</div>
                </div>
              </div>
              <button
                className="mobile-menu-close"
                onClick={() => setShowMobileMenu(false)}
                aria-label="Close menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="mobile-menu-nav">
              <button
                className={`mobile-menu-item ${currentPage === 'home' ? 'active' : ''}`}
                onClick={() => navigateToPage('home')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <path d="M9 22V12h6v10"/>
                </svg>
                <span>Home</span>
              </button>
              <button
                className={`mobile-menu-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => navigateToPage('dashboard')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="9" x2="15" y2="9"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <span>Dashboard</span>
              </button>
              <button
                className={`mobile-menu-item ${currentPage === 'trips' ? 'active' : ''}`}
                onClick={() => navigateToPage('trips')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span>Trips</span>
              </button>
              <button
                className={`mobile-menu-item ${currentPage === 'analytics' ? 'active' : ''}`}
                onClick={() => navigateToPage('analytics')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <span>Analytics</span>
              </button>
              <button
                className={`mobile-menu-item ${currentPage === 'community' ? 'active' : ''}`}
                onClick={() => navigateToPage('community')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Community</span>
              </button>
              <button
                className={`mobile-menu-item ${currentPage === 'profile' ? 'active' : ''}`}
                onClick={() => navigateToPage('profile')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Profile</span>
              </button>
            </nav>
            <div className="mobile-menu-footer">
              <button className="mobile-menu-logout" onClick={handleLogout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mobile-main-content">
        {currentPage === 'home' && <HomePageMobile onNavigate={navigateToPage} />}
        {currentPage === 'dashboard' && <DashboardPageMobile />}
        {currentPage === 'trips' && <TripsPageMobile />}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'community' && <CommunityPage />}
        {currentPage === 'profile' && <ProfilePageMobile />}
      </main>

      {/* Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => navigateToPage('home')}
          aria-label="Home"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <path d="M9 22V12h6v10"/>
          </svg>
          <span>Home</span>
        </button>
        <button
          className={`mobile-nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigateToPage('dashboard')}
          aria-label="Dashboard"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          <span>Garage</span>
        </button>
        <button
          className={`mobile-nav-item ${currentPage === 'trips' ? 'active' : ''}`}
          onClick={() => navigateToPage('trips')}
          aria-label="Trips"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span>Trips</span>
        </button>
        <button
          className={`mobile-nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
          onClick={() => navigateToPage('analytics')}
          aria-label="Analytics"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>Stats</span>
        </button>
        <button
          className={`mobile-nav-item ${currentPage === 'community' ? 'active' : ''}`}
          onClick={() => navigateToPage('community')}
          aria-label="Community"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Community</span>
        </button>
      </nav>
    </div>
  );
};

// Helper function to get page titles
const getPageTitle = (page) => {
  const titles = {
    home: 'Home',
    dashboard: 'My Garage',
    trips: 'Trips',
    analytics: 'Analytics',
    community: 'Community',
    profile: 'Profile'
  };
  return titles[page] || 'MotorMate';
};

// Mobile Login Page Component
const LoginPageMobile = ({ onLogin }) => {
  return (
    <div className="mobile-login-container">
      <div className="mobile-login-content">
        <div className="mobile-login-header">
          <div className="mobile-login-logo">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#ef4444">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <h1 className="mobile-login-title">MotorMate</h1>
          <p className="mobile-login-subtitle">Your Complete Vehicle Management Solution</p>
        </div>

        <div className="mobile-login-form">
          <h2 className="mobile-login-heading">Welcome Back</h2>
          <p className="mobile-login-description">Sign in to track your vehicle expenses and manage your garage</p>

          <button
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
            className="mobile-google-signin-btn"
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="mobile-login-features">
            <div className="mobile-feature-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Track Expenses</span>
            </div>
            <div className="mobile-feature-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              <span>Analytics</span>
            </div>
            <div className="mobile-feature-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <span>Service History</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Home Page Component
const HomePageMobile = ({ onNavigate }) => {
  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      title: "Vehicle Garage",
      description: "Store and manage all your vehicles",
      color: "#3b82f6"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      title: "Expense Tracking",
      description: "Track fuel, maintenance, and more",
      color: "#10b981"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
      title: "Trip Analytics",
      description: "Analyze driving patterns and routes",
      color: "#f59e0b"
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <path d="M3 9h18"/>
          <path d="M9 21V9"/>
        </svg>
      ),
      title: "Service History",
      description: "Maintain comprehensive service records",
      color: "#ef4444"
    }
  ];

  return (
    <div className="mobile-home-container">
      {/* Hero Section */}
      <section className="mobile-hero-section">
        <div className="mobile-hero-content">
          <h1 className="mobile-hero-title">Your Complete Vehicle Management Solution</h1>
          <p className="mobile-hero-description">Track expenses, monitor service history, and analyze your vehicle performance all in one place.</p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="mobile-hero-cta"
          >
            Go to Your Garage
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-7-7l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mobile-features-section">
        <h2 className="mobile-features-title">Everything You Need</h2>
        <div className="mobile-features-grid">
          {features.map((feature, index) => (
            <div key={index} className="mobile-feature-card" style={{ '--feature-color': feature.color }}>
              <div className="mobile-feature-icon">{feature.icon}</div>
              <h3 className="mobile-feature-title">{feature.title}</h3>
              <p className="mobile-feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mobile-cta-section">
        <div className="mobile-cta-content">
          <h2 className="mobile-cta-title">Ready to Take Control?</h2>
          <p className="mobile-cta-description">Join thousands of motorists who have simplified their vehicle management with MotorMate.</p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="mobile-cta-button"
          >
            Open Your Garage
          </button>
        </div>
      </section>
    </div>
  );
};

// Mobile Dashboard Component with Full Functionality
const DashboardPageMobile = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [showViewVehicleModal, setShowViewVehicleModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showExpensesList, setShowExpensesList] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [expenseFormType, setExpenseFormType] = useState('Fuel');
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expenseStats, setExpenseStats] = useState(null);
  const [expensesLoading, setExpensesLoading] = useState(false);

  // API call function
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5000/api${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Load vehicles on mount
  useEffect(() => {
    localStorage.setItem('currentPage', 'dashboard');
    fetchVehicles();
  }, []);

  // Load expenses and stats when vehicle is selected
  useEffect(() => {
    if (selectedVehicle) {
      fetchExpenses(selectedVehicle._id);
      fetchExpenseStats(selectedVehicle._id);
    } else {
      setExpenses([]);
      setExpenseStats(null);
    }
  }, [selectedVehicle]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/vehicles');
      setVehicles(response.data);
      if (!selectedVehicle && response.data.length > 0) {
        setSelectedVehicle(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setErrorMessage('Error fetching vehicles: ' + error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (vehicleId = null) => {
    try {
      setExpensesLoading(true);
      const endpoint = vehicleId ? `/expenses?vehicleId=${vehicleId}` : '/expenses';
      const response = await apiCall(endpoint);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setErrorMessage('Error fetching expenses: ' + error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setExpensesLoading(false);
    }
  };

  const fetchExpenseStats = async (vehicleId) => {
    try {
      const response = await apiCall(`/expenses/stats/${vehicleId}`);
      setExpenseStats(response.data);
    } catch (error) {
      console.error('Error fetching expense stats:', error);
      setExpenseStats(null);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowAddVehicleModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowEditVehicleModal(true);
  };

  const handleViewVehicle = (vehicle) => {
    setViewingVehicle(vehicle);
    setShowViewVehicleModal(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        setLoading(true);
        await apiCall(`/vehicles/${vehicleId}`, { method: 'DELETE' });
        const updatedVehicles = vehicles.filter(v => v._id !== vehicleId);
        setVehicles(updatedVehicles);
        if (selectedVehicle?._id === vehicleId) {
          setSelectedVehicle(updatedVehicles.length > 0 ? updatedVehicles[0] : null);
        }
        setSuccessMessage('Vehicle deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setErrorMessage('Error deleting vehicle: ' + error.message);
        setTimeout(() => setErrorMessage(''), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVehicleSubmit = async (vehicleData) => {
    try {
      setLoading(true);
      if (editingVehicle) {
        const response = await apiCall(`/vehicles/${editingVehicle._id}`, {
          method: 'PUT',
          body: JSON.stringify(vehicleData)
        });
        const updatedVehicles = vehicles.map(v => v._id === editingVehicle._id ? response.data : v);
        setVehicles(updatedVehicles);
        setSelectedVehicle(response.data);
        setSuccessMessage('Vehicle updated successfully!');
      } else {
        const response = await apiCall('/vehicles', {
          method: 'POST',
          body: JSON.stringify(vehicleData)
        });
        setVehicles([response.data, ...vehicles]);
        setSelectedVehicle(response.data);
        setSuccessMessage('Vehicle added successfully!');
      }
      setShowAddVehicleModal(false);
      setShowEditVehicleModal(false);
      setEditingVehicle(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to save vehicle: ' + error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (!selectedVehicle) {
      setErrorMessage('Please select a vehicle first');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setExpenseFormType(action);
    setEditingExpense(null);
    setShowExpenseModal(true);
  };

  const handleExpenseSubmit = async (expenseData) => {
    try {
      setExpensesLoading(true);
      if (editingExpense) {
        const toSendData = { ...expenseData, fuelAmount: expenseData?.fuelAmount || expenseData?.fuelAdded || 0 };
        const response = await apiCall(`/expenses/${editingExpense._id}`, {
          method: 'PUT',
          body: JSON.stringify(toSendData)
        });
        const updatedExpenses = expenses.map(e => e._id === editingExpense._id ? response.data : e);
        setExpenses(updatedExpenses);
        setSuccessMessage('Expense updated successfully!');
      } else {
        const toSendData = { ...expenseData, fuelAmount: expenseData?.fuelAmount || expenseData?.fuelAdded || 0 };
        const response = await apiCall('/expenses', {
          method: 'POST',
          body: JSON.stringify(toSendData)
        });
        setExpenses([response.data, ...expenses]);
        setSuccessMessage('Expense added successfully!');
      }
      setShowExpenseModal(false);
      setEditingExpense(null);
      if (selectedVehicle) {
        fetchExpenseStats(selectedVehicle._id);
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to save expense: ' + error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setExpensesLoading(false);
    }
  };

  const displayMessage = () => {
    if (successMessage) {
      return (
        <div className="mobile-toast mobile-toast-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <span>{successMessage}</span>
        </div>
      );
    }
    if (errorMessage) {
      return (
        <div className="mobile-toast mobile-toast-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{errorMessage}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {displayMessage()}
      <div className="mobile-dashboard">
        {/* Header Section */}
        <div className="mobile-dashboard-header">
          <div className="mobile-dashboard-title">
            <h1>My Garage</h1>
            <p>{vehicles.length === 0 ? "Add your first vehicle!" : "Manage your vehicles"}</p>
          </div>
          <button
            onClick={handleAddVehicle}
            className="mobile-fab-button"
            aria-label="Add vehicle"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14m-7-7h14"/>
            </svg>
          </button>
        </div>

        {vehicles.length === 0 ? (
          <div className="mobile-empty-state">
            <div className="mobile-empty-icon">🚗</div>
            <h2>Your Garage is Empty</h2>
            <p>Add your first vehicle to start tracking expenses and service history</p>
            <button
              onClick={handleAddVehicle}
              className="mobile-primary-button"
            >
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <>
            {/* Vehicle Selector */}
            {vehicles.length > 1 && (
              <div className="mobile-vehicle-selector">
                <label className="mobile-selector-label">Select Vehicle:</label>
                <select
                  value={selectedVehicle?._id || ''}
                  onChange={(e) => {
                    const vehicle = vehicles.find(v => v._id === e.target.value);
                    handleVehicleSelect(vehicle);
                  }}
                  className="mobile-selector"
                >
                  {vehicles.map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.vehicleName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedVehicle ? (
              <>
                {/* Vehicle Card */}
                <div className="mobile-vehicle-card">
                  <div className="mobile-vehicle-header">
                    <div className="mobile-vehicle-info">
                      <h2>{selectedVehicle.vehicleName}</h2>
                      <p>{selectedVehicle.company} {selectedVehicle.model}</p>
                      <span className="mobile-vehicle-badge">ACTIVE</span>
                    </div>
                    <div className="mobile-vehicle-icon">
                      🚗
                    </div>
                  </div>
                  <div className="mobile-vehicle-stats">
                    <div className="mobile-stat-item">
                      <span className="mobile-stat-label">Odometer</span>
                      <span className="mobile-stat-value">{selectedVehicle.odometerReading || 0} km</span>
                    </div>
                    <div className="mobile-stat-item">
                      <span className="mobile-stat-label">Added</span>
                      <span className="mobile-stat-value">{new Date(selectedVehicle.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mobile-vehicle-actions">
                    <button
                      onClick={() => handleViewVehicle(selectedVehicle)}
                      className="mobile-action-button mobile-action-primary"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      View
                    </button>
                    <button
                      onClick={() => handleEditVehicle(selectedVehicle)}
                      className="mobile-action-button mobile-action-secondary"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(selectedVehicle._id)}
                      className="mobile-action-button mobile-action-danger"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mobile-quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="mobile-actions-grid">
                    <button
                      onClick={() => handleQuickAction('Fuel')}
                      className="mobile-quick-action-btn mobile-action-fuel"
                    >
                      <div className="mobile-action-icon">⛽</div>
                      <span>Log Fuel</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('Service')}
                      className="mobile-quick-action-btn mobile-action-service"
                    >
                      <div className="mobile-action-icon">🔧</div>
                      <span>Log Service</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('Other')}
                      className="mobile-quick-action-btn mobile-action-other"
                    >
                      <div className="mobile-action-icon">💰</div>
                      <span>Log Expense</span>
                    </button>
                  </div>
                </div>

                {/* Expense Summary */}
                {expenseStats && (
                  <div className="mobile-expense-summary">
                    <h3>Expense Summary</h3>
                    <div className="mobile-expense-total">
                      <span className="mobile-total-label">Total Expenses</span>
                      <span className="mobile-total-amount">₹{expenseStats.stats?.totalExpenses?.toFixed(2) || '0.00'}</span>
                    </div>
                    {expenseStats.stats?.expenseBreakdown?.map((item, index) => (
                      <div key={index} className="mobile-expense-item">
                        <span className="mobile-expense-type">{item.type}</span>
                        <span className="mobile-expense-amount">₹{item.total?.toFixed(2) || '0.00'}</span>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowExpensesList(true)}
                      className="mobile-view-all-btn"
                    >
                      View All Expenses
                    </button>
                  </div>
                )}

                {/* Recent Expenses */}
                {expenses.length > 0 && (
                  <div className="mobile-recent-expenses">
                    <div className="mobile-section-header">
                      <h3>Recent Expenses</h3>
                      <button
                        onClick={() => setShowExpensesList(true)}
                        className="mobile-view-more-btn"
                      >
                        View All
                      </button>
                    </div>
                    <div className="mobile-expenses-list">
                      {expenses.slice(0, 3).map((expense) => (
                        <div key={expense._id} className="mobile-expense-card">
                          <div className="mobile-expense-header">
                            <span className={`mobile-expense-type-badge ${expense.expenseType.toLowerCase()}`}>
                              {expense.expenseType}
                            </span>
                            <span className="mobile-expense-amount">₹{expense.amount.toFixed(2)}</span>
                          </div>
                          <div className="mobile-expense-details">
                            <p>{new Date(expense.date).toLocaleDateString()}</p>
                            {expense.description && <p>{expense.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mobile-empty-state">
                <div className="mobile-empty-icon">🚗</div>
                <h2>Select a Vehicle</h2>
                <p>Choose a vehicle to view details and manage expenses</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Modals */}
      {showAddVehicleModal && (
        <MobileVehicleFormModal
          vehicle={null}
          onClose={() => setShowAddVehicleModal(false)}
          onSuccess={handleVehicleSubmit}
        />
      )}
      {showEditVehicleModal && editingVehicle && (
        <MobileVehicleFormModal
          vehicle={editingVehicle}
          onClose={() => setShowEditVehicleModal(false)}
          onSuccess={handleVehicleSubmit}
        />
      )}
      {showViewVehicleModal && viewingVehicle && (
        <MobileViewVehicleModal
          vehicle={viewingVehicle}
          onClose={() => setShowViewVehicleModal(false)}
        />
      )}
      {showExpenseModal && (
        <MobileExpenseFormModal
          vehicle={selectedVehicle}
          expense={editingExpense}
          expenseType={expenseFormType}
          userVehicles={vehicles}
          onClose={() => setShowExpenseModal(false)}
          onSuccess={handleExpenseSubmit}
        />
      )}
      {showExpensesList && (
        <MobileExpensesListModal
          expenses={expenses}
          vehicle={selectedVehicle}
          loading={expensesLoading}
          onClose={() => setShowExpensesList(false)}
          onEditExpense={(expense) => {
            setShowExpensesList(false);
            setEditingExpense(expense);
            setExpenseFormType(expense.expenseType);
            setTimeout(() => setShowExpenseModal(true), 100);
          }}
        />
      )}
    </>
  );
};

// Mobile Modal Components
const MobileVehicleFormModal = ({ vehicle, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    vehicleName: '',
    company: '',
    model: '',
    purchasedDate: new Date().toISOString().split('T')[0],
    vehicleCost: '',
    insuranceExpiry: '',
    insuranceNumber: '',
    emissionTestExpiry: '',
    odometerReading: '',
    vehicleRegistrationNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleName: vehicle.vehicleName || '',
        company: vehicle.company || '',
        model: vehicle.model || '',
        purchasedDate: vehicle.purchasedDate ? new Date(vehicle.purchasedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        vehicleCost: vehicle.vehicleCost || '',
        insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().split('T')[0] : '',
        insuranceNumber: vehicle.insuranceNumber || '',
        emissionTestExpiry: vehicle.emissionTestExpiry ? new Date(vehicle.emissionTestExpiry).toISOString().split('T')[0] : '',
        odometerReading: vehicle.odometerReading || '',
        vehicleRegistrationNumber: vehicle.vehicleRegistrationNumber || ''
      });
    }
  }, [vehicle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSuccess(formData);
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-modal-header">
          <h2>{vehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
          <button onClick={onClose} className="mobile-modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mobile-form">
          <div className="mobile-form-group">
            <label>Vehicle Name *</label>
            <input
              type="text"
              value={formData.vehicleName}
              onChange={(e) => setFormData({...formData, vehicleName: e.target.value})}
              required
              placeholder="e.g., My Car"
            />
          </div>
          <div className="mobile-form-row">
            <div className="mobile-form-group">
              <label>Company *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                required
                placeholder="e.g., Toyota"
              />
            </div>
            <div className="mobile-form-group">
              <label>Model *</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                required
                placeholder="e.g., Camry"
              />
            </div>
          </div>
          <div className="mobile-form-group">
            <label>Registration Number *</label>
            <input
              type="text"
              value={formData.vehicleRegistrationNumber}
              onChange={(e) => setFormData({...formData, vehicleRegistrationNumber: e.target.value})}
              required
              placeholder="e.g., MH-12-AB-1234"
            />
          </div>
          <div className="mobile-form-row">
            <div className="mobile-form-group">
              <label>Purchase Date *</label>
              <input
                type="date"
                value={formData.purchasedDate}
                onChange={(e) => setFormData({...formData, purchasedDate: e.target.value})}
                required
              />
            </div>
            <div className="mobile-form-group">
              <label>Vehicle Cost (₹) *</label>
              <input
                type="number"
                value={formData.vehicleCost}
                onChange={(e) => setFormData({...formData, vehicleCost: e.target.value})}
                required
                placeholder="500000"
              />
            </div>
          </div>
          <div className="mobile-form-row">
            <div className="mobile-form-group">
              <label>Odometer Reading (km)</label>
              <input
                type="number"
                value={formData.odometerReading}
                onChange={(e) => setFormData({...formData, odometerReading: e.target.value})}
                placeholder="15000"
              />
            </div>
            <div className="mobile-form-group">
              <label>Insurance Expiry *</label>
              <input
                type="date"
                value={formData.insuranceExpiry}
                onChange={(e) => setFormData({...formData, insuranceExpiry: e.target.value})}
                required
              />
            </div>
          </div>
          {errors.submit && <div className="mobile-form-error">{errors.submit}</div>}
          <button type="submit" className="mobile-form-submit" disabled={loading}>
            {loading ? 'Saving...' : (vehicle ? 'Update Vehicle' : 'Add Vehicle')}
          </button>
        </form>
      </div>
    </div>
  );
};

const MobileViewVehicleModal = ({ vehicle, onClose }) => {
  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-modal-header">
          <h2>Vehicle Details</h2>
          <button onClick={onClose} className="mobile-modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="mobile-vehicle-details">
          <div className="mobile-detail-section">
            <h3>Basic Information</h3>
            <div className="mobile-detail-item">
              <span>Name:</span>
              <span>{vehicle.vehicleName}</span>
            </div>
            <div className="mobile-detail-item">
              <span>Company:</span>
              <span>{vehicle.company}</span>
            </div>
            <div className="mobile-detail-item">
              <span>Model:</span>
              <span>{vehicle.model}</span>
            </div>
            <div className="mobile-detail-item">
              <span>Registration:</span>
              <span>{vehicle.vehicleRegistrationNumber}</span>
            </div>
          </div>
          <div className="mobile-detail-section">
            <h3>Purchase Information</h3>
            <div className="mobile-detail-item">
              <span>Purchase Date:</span>
              <span>{new Date(vehicle.purchasedDate).toLocaleDateString()}</span>
            </div>
            <div className="mobile-detail-item">
              <span>Vehicle Cost:</span>
              <span>₹{parseFloat(vehicle.vehicleCost).toLocaleString()}</span>
            </div>
            <div className="mobile-detail-item">
              <span>Odometer:</span>
              <span>{vehicle.odometerReading} km</span>
            </div>
          </div>
          <div className="mobile-detail-section">
            <h3>Insurance Information</h3>
            <div className="mobile-detail-item">
              <span>Insurance Expiry:</span>
              <span>{new Date(vehicle.insuranceExpiry).toLocaleDateString()}</span>
            </div>
            {vehicle.insuranceNumber && (
              <div className="mobile-detail-item">
                <span>Policy Number:</span>
                <span>{vehicle.insuranceNumber}</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={onClose} className="mobile-form-submit">Close</button>
      </div>
    </div>
  );
};

const MobileExpenseFormModal = ({ vehicle, expense, expenseType, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    vehicle: vehicle?._id,
    expenseType: expenseType,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    odometerReading: '',
    fuelAdded: '',
    totalCost: '',
    serviceDescription: '',
    otherExpenseType: '',
    notes: '',
    location: '',
    paymentMethod: 'Cash'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        vehicle: expense.vehicle?._id,
        expenseType: expense.expenseType || expenseType,
        amount: expense.amount || '',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: expense.description || '',
        odometerReading: expense.odometerReading || '',
        fuelAdded: expense.fuelAdded || '',
        totalCost: expense.totalCost || '',
        serviceDescription: expense.serviceDescription || '',
        otherExpenseType: expense.otherExpenseType || '',
        notes: expense.notes || '',
        location: expense.location || '',
        paymentMethod: expense.paymentMethod || 'Cash'
      });
    }
  }, [expense, expenseType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSuccess(formData);
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div className="mobile-modal-content mobile-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-modal-header">
          <h2>{expense ? 'Edit Expense' : `Add ${expenseType} Expense`}</h2>
          <button onClick={onClose} className="mobile-modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mobile-form">
          <div className="mobile-form-group">
            <label>Amount (₹) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
              placeholder="100.00"
            />
          </div>
          <div className="mobile-form-row">
            <div className="mobile-form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div className="mobile-form-group">
              <label>Odometer (km) *</label>
              <input
                type="number"
                value={formData.odometerReading}
                onChange={(e) => setFormData({...formData, odometerReading: e.target.value})}
                required
                placeholder="15000"
              />
            </div>
          </div>
          <div className="mobile-form-group">
            <label>Description *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              placeholder="Fuel at Shell station"
            />
          </div>
          {expenseType === 'Fuel' && (
            <>
              <div className="mobile-form-row">
                <div className="mobile-form-group">
                  <label>Fuel Added (L) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fuelAdded}
                    onChange={(e) => setFormData({...formData, fuelAdded: e.target.value})}
                    required
                    placeholder="25.5"
                  />
                </div>
                <div className="mobile-form-group">
                  <label>Total Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalCost}
                    onChange={(e) => setFormData({...formData, totalCost: e.target.value})}
                    required
                    placeholder="2500.00"
                  />
                </div>
              </div>
            </>
          )}
          {expenseType === 'Service' && (
            <div className="mobile-form-group">
              <label>Service Description *</label>
              <input
                type="text"
                value={formData.serviceDescription}
                onChange={(e) => setFormData({...formData, serviceDescription: e.target.value})}
                required
                placeholder="Oil change and filter replacement"
              />
            </div>
          )}
          {expenseType === 'Other' && (
            <div className="mobile-form-group">
              <label>Expense Type *</label>
              <input
                type="text"
                value={formData.otherExpenseType}
                onChange={(e) => setFormData({...formData, otherExpenseType: e.target.value})}
                required
                placeholder="Parking, Toll, etc."
              />
            </div>
          )}
          <div className="mobile-form-group">
            <label>Location (optional)</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Shell Station, Mumbai"
            />
          </div>
          <div className="mobile-form-group">
            <label>Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mobile-form-group">
            <label>Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              placeholder="Additional notes about this expense"
            />
          </div>
          <button type="submit" className="mobile-form-submit" disabled={loading}>
            {loading ? 'Saving...' : (expense ? 'Update Expense' : 'Add Expense')}
          </button>
        </form>
      </div>
    </div>
  );
};

const MobileExpensesListModal = ({ expenses, vehicle, loading, onClose, onEditExpense }) => {
  if (loading) {
    return (
      <div className="mobile-modal-overlay" onClick={onClose}>
        <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-loading-spinner">Loading expenses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div className="mobile-modal-content mobile-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-modal-header">
          <h2>Expenses - {vehicle?.vehicleName}</h2>
          <button onClick={onClose} className="mobile-modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="mobile-expenses-list-modal">
          {expenses.length === 0 ? (
            <div className="mobile-empty-state">
              <div className="mobile-empty-icon">💸</div>
              <h3>No expenses recorded</h3>
              <p>Start tracking your vehicle expenses</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense._id} className="mobile-expense-item-modal">
                <div className="mobile-expense-item-header">
                  <span className={`mobile-expense-type-badge ${expense.expenseType.toLowerCase()}`}>
                    {expense.expenseType}
                  </span>
                  <span className="mobile-expense-amount">₹{expense.amount.toFixed(2)}</span>
                </div>
                <div className="mobile-expense-item-details">
                  <p>{expense.description}</p>
                  <p className="mobile-expense-date">{new Date(expense.date).toLocaleDateString()}</p>
                  {expense.location && <p className="mobile-expense-location">📍 {expense.location}</p>}
                </div>
                <button
                  onClick={() => onEditExpense(expense)}
                  className="mobile-expense-edit-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Mobile Trips Page Component with Full Functionality
const TripsPageMobile = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [trips, setTrips] = useState([]);
  const [tripStats, setTripStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal states
  const [showTripModal, setShowTripModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  // API call function
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5000/api${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Load vehicles on component mount
  useEffect(() => {
    localStorage.setItem('currentPage', 'trips');
    fetchVehicles();
  }, []);

  // Load trips and stats when vehicle is selected
  useEffect(() => {
    if (selectedVehicle) {
      fetchTrips(selectedVehicle._id);
      fetchTripStats(selectedVehicle._id);
    } else {
      setTrips([]);
      setTripStats(null);
    }
  }, [selectedVehicle]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/vehicles');
      setVehicles(response.data);
      if (!selectedVehicle && response.data.length > 0) {
        setSelectedVehicle(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setErrorMessage('Error fetching vehicles: ' + error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async (vehicleId) => {
    try {
      setTripsLoading(true);
      const endpoint = vehicleId ? `/trips?vehicle=${vehicleId}` : '/trips';
      const response = await apiCall(endpoint);
      setTrips(response.data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setErrorMessage('Failed to fetch trips: ' + (error.message || 'Unknown error'));
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setTripsLoading(false);
    }
  };

  const fetchTripStats = async (vehicleId) => {
    try {
      const response = await apiCall(`/trips/stats/${vehicleId}`);
      setTripStats(response.data);
    } catch (error) {
      console.error('Error fetching trip stats:', error);
      setTripStats(null);
    }
  };

  const handleTripSubmit = async (tripData) => {
    try {
      setTripsLoading(true);
      if (editingTrip) {
        const response = await apiCall(`/trips/${editingTrip._id}`, {
          method: 'PUT',
          body: JSON.stringify(tripData)
        });
        const updatedTrips = trips.map(t =>
          t._id === editingTrip._id ? response.data : t
        );
        setTrips(updatedTrips);
        setSuccessMessage('Trip updated successfully!');
      } else {
        const response = await apiCall('/trips', {
          method: 'POST',
          body: JSON.stringify(tripData)
        });
        setTrips([response.data, ...trips]);
        setSuccessMessage('Trip added successfully!');
      }
      setShowTripModal(false);
      setEditingTrip(null);
      if (selectedVehicle) {
        fetchTripStats(selectedVehicle._id);
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving trip:', error);
      setErrorMessage('Failed to save trip: ' + (error.message || 'Unknown error'));
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setTripsLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        setTripsLoading(true);
        await apiCall(`/trips/${tripId}`, {
          method: 'DELETE'
        });
        const updatedTrips = trips.filter(t => t._id !== tripId);
        setTrips(updatedTrips);
        setSuccessMessage('Trip deleted successfully!');
        if (selectedVehicle) {
          fetchTripStats(selectedVehicle._id);
        }
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting trip:', error);
        setErrorMessage('Failed to delete trip: ' + error.message);
        setTimeout(() => setErrorMessage(''), 3000);
      } finally {
        setTripsLoading(false);
      }
    }
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setShowTripModal(true);
  };

  const handleAddTrip = () => {
    if (!selectedVehicle) {
      setErrorMessage('Please select a vehicle first');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setEditingTrip(null);
    setShowTripModal(true);
  };

  const displayMessage = () => {
    if (successMessage) {
      return (
        <div className="mobile-toast mobile-toast-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <span>{successMessage}</span>
        </div>
      );
    }
    if (errorMessage) {
      return (
        <div className="mobile-toast mobile-toast-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{errorMessage}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {displayMessage()}
      <div className="mobile-trips">
        {/* Header */}
        <div className="mobile-trips-header">
          <div className="mobile-trips-title">
            <h1>🗺️ Trip Management</h1>
            <p>Track your journeys and analytics</p>
          </div>
          <button
            onClick={handleAddTrip}
            className="mobile-fab-button"
            aria-label="Add trip"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14m-7-7h14"/>
            </svg>
          </button>
        </div>

        {/* Vehicle Selector */}
        {vehicles.length > 1 && (
          <div className="mobile-vehicle-selector">
            <label className="mobile-selector-label">Select Vehicle:</label>
            <select
              value={selectedVehicle?._id || ''}
              onChange={(e) => {
                const vehicle = vehicles.find(v => v._id === e.target.value);
                setSelectedVehicle(vehicle);
              }}
              className="mobile-selector"
            >
              {vehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.vehicleName}
                </option>
              ))}
            </select>
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="mobile-empty-state">
            <div className="mobile-empty-icon">🚗</div>
            <h2>No Vehicles Found</h2>
            <p>Add vehicles to your garage first to start tracking trips</p>
            <button
              onClick={() => window.location.href = '#dashboard'}
              className="mobile-primary-button"
            >
              Go to Dashboard
            </button>
          </div>
        ) : !selectedVehicle ? (
          <div className="mobile-empty-state">
            <div className="mobile-empty-icon">🗺️</div>
            <h2>Select a Vehicle</h2>
            <p>Choose a vehicle to view and manage its trips</p>
          </div>
        ) : (
          <>
            {/* Current Vehicle Card */}
            <div className="mobile-current-vehicle-card">
              <div className="mobile-current-vehicle-info">
                <div className="mobile-current-vehicle-icon">🚗</div>
                <div>
                  <h3>{selectedVehicle.vehicleName}</h3>
                  <p>{selectedVehicle.company} {selectedVehicle.model}</p>
                </div>
              </div>
            </div>

            {/* Trip Statistics */}
            {tripStats && (
              <div className="mobile-trip-stats">
                <h3>Trip Statistics</h3>
                <div className="mobile-stats-grid">
                  <div className="mobile-stat-card">
                    <span className="mobile-stat-number">{Array.isArray(trips) && trips?.length || 0}</span>
                    <span className="mobile-stat-label">Total Trips</span>
                  </div>
                  <div className="mobile-stat-card">
                    <span className="mobile-stat-number">{Array.isArray(trips) ? getTotalDistance(trips) : 0 }</span>
                    <span className="mobile-stat-label">Distance (km)</span>
                  </div>
                  <div className="mobile-stat-card">
                    <span className="mobile-stat-number">{Array.isArray(trips) ? getTotalFormattedCost(trips) : '₹0'}</span>
                    <span className="mobile-stat-label">Total Cost</span>
                  </div>
                  <div className="mobile-stat-card">
                    <span className="mobile-stat-number">
                      {Array.isArray(trips) ? getAverageDistance(trips) : 0} km
                    </span>
                    <span className="mobile-stat-label">Avg Distance</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trips List */}
            <div className="mobile-trips-list">
              <div className="mobile-section-header">
                <h3>Trip History</h3>
              </div>

              {tripsLoading ? (
                <div className="mobile-loading-spinner">Loading trips...</div>
              ) : trips && trips.length > 0 ? (
                <div className="mobile-trips-container">
                  {trips.map((trip) => (
                    <div key={trip._id} className="mobile-trip-card">
                      <div className="mobile-trip-header">
                        <div className="mobile-trip-route">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                          </svg>
                          <span>{trip.startLocation} → {trip.endLocation}</span>
                        </div>
                        <span className="mobile-trip-purpose">
                          {trip.purpose || 'Personal'}
                        </span>
                      </div>
                      <div className="mobile-trip-details">
                        <div className="mobile-trip-date">
                          {new Date(trip.date).toLocaleDateString()}
                        </div>
                        <div className="mobile-trip-metrics">
                          <div className="mobile-trip-metric">
                            <span className="mobile-metric-label">Distance</span>
                            <span className="mobile-metric-value">{trip.distance} km</span>
                          </div>
                          <div className="mobile-trip-metric">
                            <span className="mobile-metric-label">Cost</span>
                            <span className="mobile-metric-value">₹{trip.totalCost?.toFixed(2)}</span>
                          </div>
                          {(trip.startOdometer || trip.endOdometer) && (
                            <div className="mobile-trip-metric">
                              <span className="mobile-metric-label">Odometer</span>
                              <span className="mobile-metric-value">
                                {trip.startOdometer || 0} → {trip.endOdometer || 0} km
                              </span>
                            </div>
                          )}
                        </div>
                        {trip.notes && (
                          <div className="mobile-trip-notes">
                            <strong>Notes:</strong> {trip.notes}
                          </div>
                        )}
                      </div>
                      <div className="mobile-trip-actions">
                        <button
                          onClick={() => handleEditTrip(trip)}
                          className="mobile-action-button mobile-action-primary"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip._id)}
                          className="mobile-action-button mobile-action-danger"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mobile-empty-state">
                  <div className="mobile-empty-icon">🗺️</div>
                  <h2>No trips recorded yet</h2>
                  <p>Start tracking your journeys by adding your first trip</p>
                  <button
                    onClick={handleAddTrip}
                    className="mobile-primary-button"
                  >
                    Add Your First Trip
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Trip Modal */}
        {showTripModal && (
          <MobileTripFormModal
            trip={editingTrip}
            vehicle={selectedVehicle}
            userVehicles={vehicles}
            onClose={() => {
              setShowTripModal(false);
              setEditingTrip(null);
            }}
            onSuccess={handleTripSubmit}
          />
        )}
      </div>
    </>
  );
};

// Mobile Trip Form Modal
const MobileTripFormModal = ({ trip, vehicle, userVehicles, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    vehicle: vehicle?._id || '',
    startLocation: '',
    endLocation: '',
    date: new Date().toISOString().split('T')[0],
    distance: '',
    totalCost: '',
    purpose: 'Personal',
    startOdometer: '',
    endOdometer: '',
    notes: '',
    fuelConsumed: '',
    tripType: 'City'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trip) {
      setFormData({
        vehicle: trip.vehicle?._id || vehicle?._id || '',
        startLocation: trip.startLocation || '',
        endLocation: trip.endLocation || '',
        date: trip.date ? new Date(trip.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        distance: trip.distance || '',
        totalCost: trip.totalCost || '',
        purpose: trip.purpose || 'Personal',
        startOdometer: trip.startOdometer || '',
        endOdometer: trip.endOdometer || '',
        notes: trip.notes || '',
        fuelConsumed: trip.fuelConsumed || '',
        tripType: trip.tripType || 'City'
      });
    } else if (vehicle) {
      setFormData({
        ...formData,
        vehicle: vehicle._id,
        startOdometer: vehicle.odometerReading || ''
      });
    }
  }, [trip, vehicle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSuccess(formData);
      onClose();
    } catch (error) {
      console.error('Error saving trip:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div className="mobile-modal-content mobile-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-modal-header">
          <h2>{trip ? 'Edit Trip' : 'Log New Trip'}</h2>
          <button onClick={onClose} className="mobile-modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mobile-form">
          <div className="mobile-form-group">
            <label>Start Location *</label>
            <input
              type="text"
              value={formData.startLocation}
              onChange={(e) => setFormData({...formData, startLocation: e.target.value})}
              required
              placeholder="e.g., Home"
            />
          </div>
          <div className="mobile-form-group">
            <label>End Location *</label>
            <input
              type="text"
              value={formData.endLocation}
              onChange={(e) => setFormData({...formData, endLocation: e.target.value})}
              required
              placeholder="e.g., Office"
            />
          </div>
          <div className="mobile-form-row">
            <div className="mobile-form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div className="mobile-form-group">
              <label>Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              >
                <option value="Personal">Personal</option>
                <option value="Business">Business</option>
                <option value="Commute">Commute</option>
                <option value="Leisure">Leisure</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="mobile-form-row">
            <div className="mobile-form-group">
              <label>Distance (km) *</label>
              <input
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) => setFormData({...formData, distance: e.target.value})}
                required
                placeholder="25.5"
              />
            </div>
            <div className="mobile-form-group">
              <label>Total Cost (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.totalCost}
                onChange={(e) => setFormData({...formData, totalCost: e.target.value})}
                required
                placeholder="500.00"
              />
            </div>
          </div>
          <div className="mobile-form-row">
            <div className="mobile-form-group">
              <label>Start Odometer (km)</label>
              <input
                type="number"
                value={formData.startOdometer}
                onChange={(e) => setFormData({...formData, startOdometer: e.target.value})}
                placeholder="15000"
              />
            </div>
            <div className="mobile-form-group">
              <label>End Odometer (km)</label>
              <input
                type="number"
                value={formData.endOdometer}
                onChange={(e) => setFormData({...formData, endOdometer: e.target.value})}
                placeholder="15025"
              />
            </div>
          </div>
          <div className="mobile-form-row">
            <div className="mobile-form-group">
              <label>Fuel Consumed (L)</label>
              <input
                type="number"
                step="0.1"
                value={formData.fuelConsumed}
                onChange={(e) => setFormData({...formData, fuelConsumed: e.target.value})}
                placeholder="5.2"
              />
            </div>
            <div className="mobile-form-group">
              <label>Trip Type</label>
              <select
                value={formData.tripType}
                onChange={(e) => setFormData({...formData, tripType: e.target.value})}
              >
                <option value="City">City</option>
                <option value="Highway">Highway</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>
          <div className="mobile-form-group">
            <label>Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              placeholder="Additional notes about this trip"
            />
          </div>
          <button type="submit" className="mobile-form-submit" disabled={loading}>
            {loading ? 'Saving...' : (trip ? 'Update Trip' : 'Add Trip')}
          </button>
        </form>
      </div>
    </div>
  );
};

// Mobile Profile Page Component with User Management
const ProfilePageMobile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [userData, setUserData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Load user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phoneNumber: user.phoneNumber || '',
          address: user.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = {
        ...userData,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
    }
    setIsEditing(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const displayName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || userData?.username || 'User';

  if (!userData) {
    return (
      <div className="mobile-loading-screen">
        <div className="mobile-loading-content">
          <div className="mobile-loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {successMessage && (
        <div className="mobile-toast mobile-toast-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mobile-toast mobile-toast-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}
      <div className="mobile-profile">
        {/* Profile Header */}
        {/* <div className="mobile-profile-header">
          <div className="mobile-profile-avatar">
            <span>{displayName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="mobile-profile-info">
            <h2>{displayName}</h2>
            <p>{userData?.email || 'user@example.com'}</p>
            {userData?.authMethod === 'google' && (
              <span className="mobile-profile-badge">🔐 Google SSO</span>
            )}
          </div>
          <button
            onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
            className="mobile-profile-edit-btn"
          >
            {isEditing ? '💾 Save' : '✏️ Edit'}
          </button>
        </div> */}

        {/* Profile Content */}
        <div className="mobile-profile-content">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="mobile-profile-form">
              <div className="mobile-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                />
              </div>
              <div className="mobile-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>
              <div className="mobile-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="mobile-form-section">
                <h3>Address Information</h3>
                <div className="mobile-form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="mobile-form-row">
                  <div className="mobile-form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div className="mobile-form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>
                <div className="mobile-form-row">
                  <div className="mobile-form-group">
                    <label>ZIP Code</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      placeholder="400001"
                    />
                  </div>
                  <div className="mobile-form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>
              <div className="mobile-profile-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mobile-cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mobile-save-button"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="mobile-profile-view">
              {/* Personal Information */}
              <div className="mobile-profile-section">
                <h3>Personal Information</h3>
                <div className="mobile-profile-item">
                  <span>Name</span>
                  <span>{displayName || 'Not provided'}</span>
                </div>
                <div className="mobile-profile-item">
                  <span>Email</span>
                  <span>{userData?.email || 'Not provided'}</span>
                </div>
                <div className="mobile-profile-item">
                  <span>Phone</span>
                  <span>{formData.phoneNumber || 'Not provided'}</span>
                </div>
              </div>

              {/* Address Information */}
              <div className="mobile-profile-section">
                <h3>Address</h3>
                {formData.address.street || formData.address.city ? (
                  <div className="mobile-profile-item">
                    <span>Address</span>
                    <span>
                      {[formData.address.street, formData.address.city, formData.address.state, formData.address.zipCode, formData.address.country]
                        .filter(Boolean)
                        .join(', ') || 'Not provided'}
                    </span>
                  </div>
                ) : (
                  <div className="mobile-profile-item">
                    <span>Address</span>
                    <span>Not provided</span>
                  </div>
                )}
              </div>

              {/* Account Information */}
              <div className="mobile-profile-section">
                <h3>Account</h3>
                <div className="mobile-profile-item">
                  <span>Member Since</span>
                  <span>{new Date(userData?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="mobile-profile-item">
                  <span>Login Method</span>
                  <span>Google Sign-In</span>
                </div>
              </div>

              {/* Quick Actions */}
              {/* <div className="mobile-profile-actions">
                <button
                  onClick={() => setIsEditing(true)}
                  className="mobile-primary-button"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      localStorage.removeItem('currentPage');
                      window.location.reload();
                    }
                  }}
                  className="mobile-logout-button"
                >
                  Logout
                </button>
              </div> */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MotorMateAppMobile;