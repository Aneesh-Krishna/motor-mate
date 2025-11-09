import React, { useState } from 'react';
import CommunityPage from './pages/Community';
import AnalyticsPage from './pages/Analytics';
import './MotorMateApp.css';

// Main App Component
const MotorMateApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  // Check for authentication status on component mount
  React.useEffect(() => {
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
      // Save the dashboard page and set it as current
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
  React.useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage, isLoggedIn]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Restore the last visited page
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
  };

  const navigateToPage = (page) => {
    setCurrentPage(page);
    // Save the current page to localStorage
    localStorage.setItem('currentPage', page);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(to right, #2563eb, #9333ea)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading...</div>
          <div>Please wait while we verify your authentication</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen">
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateToPage}
        onLogout={handleLogout}
      />
      {currentPage === 'home' && <HomePage onNavigate={navigateToPage} />}
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'trips' && <TripsPage />}
      {currentPage === 'analytics' && <AnalyticsPage />}
      {currentPage === 'community' && <CommunityPage />}
      {currentPage === 'profile' && <ProfilePage />}
    </div>
  );
};

// Navbar Component
const Navbar = ({ currentPage, onNavigate, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Logo */}
        <div className="navbar-logo">
          <svg className="w-8 h-10" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
          <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>MotorMate</span>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <button
            onClick={() => handleNavigation('home')}
            className="transition-colors"
            style={{
              color: currentPage === 'home' ? '#bfdbfe' : '#ffffff',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem 0',
              transition: 'color 150ms ease-in-out'
            }}
          >
            Home
          </button>
          <button
            onClick={() => handleNavigation('dashboard')}
            className="transition-colors"
            style={{
              color: currentPage === 'dashboard' ? '#bfdbfe' : '#ffffff',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem 0',
              transition: 'color 150ms ease-in-out'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNavigation('trips')}
            className="transition-colors"
            style={{
              color: currentPage === 'trips' ? '#bfdbfe' : '#ffffff',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem 0',
              transition: 'color 150ms ease-in-out'
            }}
          >
            Trips
          </button>
          <button
            onClick={() => handleNavigation('analytics')}
            className="transition-colors"
            style={{
              color: currentPage === 'analytics' ? '#bfdbfe' : '#ffffff',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem 0',
              transition: 'color 150ms ease-in-out'
            }}
          >
            Analytics
          </button>
          <button
            onClick={() => handleNavigation('community')}
            className="transition-colors"
            style={{
              color: currentPage === 'community' ? '#bfdbfe' : '#ffffff',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem 0',
              transition: 'color 150ms ease-in-out'
            }}
          >
            Community
          </button>
          <button
            onClick={() => handleNavigation('profile')}
            className="transition-colors"
            style={{
              color: currentPage === 'profile' ? '#bfdbfe' : '#ffffff',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem 0',
              transition: 'color 150ms ease-in-out'
            }}
          >
            Profile
          </button>
        </div>

        {/* User Section */}
        <div className="navbar-user">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
          >
            U
          </div>
          <span style={{ fontSize: '0.875rem' }}>Welcome, User</span>
          <button
            onClick={onLogout}
            className="btn-logout"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        {window.innerWidth <= 768 && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-btn"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu-content">
          <div className="navbar-mobile-menu-links">
            <button
              onClick={() => handleNavigation('home')}
              className="transition-colors"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.5rem 0',
                textAlign: 'left',
                width: '100%',
                transition: 'color 150ms ease-in-out'
              }}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('dashboard')}
              className="transition-colors"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.5rem 0',
                textAlign: 'left',
                width: '100%',
                transition: 'color 150ms ease-in-out'
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNavigation('trips')}
              className="transition-colors"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.5rem 0',
                textAlign: 'left',
                width: '100%',
                transition: 'color 150ms ease-in-out'
              }}
            >
              Trips
            </button>
            <button
              onClick={() => handleNavigation('analytics')}
              className="transition-colors"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.5rem 0',
                textAlign: 'left',
                width: '100%',
                transition: 'color 150ms ease-in-out'
              }}
            >
              Analytics
            </button>
            <button
              onClick={() => handleNavigation('community')}
              className="transition-colors"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.5rem 0',
                textAlign: 'left',
                width: '100%',
                transition: 'color 150ms ease-in-out'
              }}
            >
              Community
            </button>
            <button
              onClick={() => handleNavigation('profile')}
              className="transition-colors"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.5rem 0',
                textAlign: 'left',
                width: '100%',
                transition: 'color 150ms ease-in-out'
              }}
            >
              Profile
            </button>
            <div className="navbar-mobile-menu-user">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              >
                U
              </div>
              <span style={{ fontSize: '0.875rem' }}>Welcome, User</span>
              <button
                onClick={onLogout}
                className="btn-logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// LoginPage Component
const LoginPage = ({ onLogin }) => {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center">
          {/* Logo */}
          <div className="login-logo">
            <svg className="w-10 h-10" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>MotorMate</span>
          </div>

          {/* Subtitle */}
          <p style={{ color: '#4b5563', marginBottom: '2rem' }}>Track your vehicle expenses with ease</p>

          {/* Title */}
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '2rem' }}>
            Sign In to MotorMate
          </h1>

          {/* Google Sign In Button */}
          <button
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
            className="google-sign-in-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Helper Text */}
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1.5rem', maxWidth: '20rem', marginLeft: 'auto', marginRight: 'auto' }}>
            MotorMate uses Google authentication for secure and easy access to your vehicle management dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

// HomePage Component
const HomePage = ({ onNavigate }) => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Vehicle Garage",
      description: "Store and manage all your vehicles in one centralized location with detailed information."
    },
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "Expense Tracking",
      description: "Track fuel, maintenance, and other vehicle expenses with detailed categorization."
    },
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Service History",
      description: "Maintain comprehensive service records and maintenance schedules for all vehicles."
    },
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: "Trip Analytics",
      description: "Analyze your driving patterns, fuel efficiency, and trip statistics over time."
    },
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Budget Management",
      description: "Set budgets and get insights into your vehicle spending patterns and trends."
    },
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Reports & Insights",
      description: "Generate detailed reports and gain insights into your vehicle expenses and usage."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div>
            <div className="hero-logo">
              <svg className="w-10 h-10" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
              <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>MotorMate</span>
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1.5rem', color: '#ffffff' }}>
              Your Complete Vehicle Management Solution
            </h1>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#dbeafe' }}>
              Track expenses, monitor service history, and analyze your vehicle performance all in one place.
            </p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn-primary"
            >
              Go to Your Garage
            </button>
          </div>
          <div className="hero-mockup">
            <div className="hero-mockup-placeholder">
              <p>App Mockup</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-content">
          <div className="features-header">
            <h2 style={{ fontSize: '3rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
              Everything You Need to Manage Your Vehicle
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#4b5563', maxWidth: '48rem', marginLeft: 'auto', marginRight: 'auto' }}>
              Comprehensive tools to track every aspect of your vehicle ownership experience.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem', textAlign: 'center' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#4b5563', textAlign: 'center' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem', color: '#ffffff' }}>
            Ready to Take Control of Your Vehicle Expenses?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#dbeafe', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}>
            Join thousands of motorists who have simplified their vehicle management with MotorMate.
          </p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="btn-white"
          >
            Open Your Garage
          </button>
        </div>
      </section>
    </div>
  );
};

// DashboardPage Component
const DashboardPage = () => {
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [showViewVehicleModal, setShowViewVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Expense management state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showExpensesList, setShowExpensesList] = useState(false);
  const [showNextServiceModal, setShowNextServiceModal] = useState(false);
  const [nextServiceDueDate, setNextServiceDueDate] = useState('');
  const [expenseFormType, setExpenseFormType] = useState('Fuel'); // 'Fuel', 'Service', 'Other'
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
          // Token expired or invalid
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

  // Load vehicles from backend on mount
  React.useEffect(() => {
    // Save current page when dashboard loads
    localStorage.setItem('currentPage', 'dashboard');
    fetchVehicles();
  }, []);

  // Load expenses and stats when vehicle is selected
  React.useEffect(() => {
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

      // Set selected vehicle if none selected and vehicles exist
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
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        setLoading(true);
        await apiCall(`/vehicles/${vehicleId}`, {
          method: 'DELETE'
        });

        const updatedVehicles = vehicles.filter(v => v._id !== vehicleId);
        setVehicles(updatedVehicles);

        if (selectedVehicle?._id === vehicleId) {
          setSelectedVehicle(updatedVehicles.length > 0 ? updatedVehicles[0] : null);
        }

        setSuccessMessage('Vehicle deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setErrorMessage('Error deleting vehicle: ' + error.message);
        setTimeout(() => setErrorMessage(''), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCalculateMileage = async (vehicleId) => {
    try {
      setLoading(true);
      const response = await apiCall(`/expenses/calculate-mileage/${vehicleId}`, {
        method: 'POST'
      });

      if (response.data && response.data.length > 0) {
        // Refresh expenses to show updated mileage information
        await fetchExpenses();

        setSuccessMessage(`Mileage calculated for ${response.data.length} fuel expense(s)!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('No fuel expenses found for mileage calculation. Add at least 2 fuel expenses with odometer readings.');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error calculating mileage:', error);
      setErrorMessage('Error calculating mileage: ' + error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  
  const handleVehicleSubmit = async (vehicleData) => {
    try {
      setLoading(true);

      if (editingVehicle) {
        // Update existing vehicle
        const response = await apiCall(`/vehicles/${editingVehicle._id}`, {
          method: 'PUT',
          body: JSON.stringify(vehicleData)
        });

        const updatedVehicles = vehicles.map(v =>
          v._id === editingVehicle._id ? response.data : v
        );
        setVehicles(updatedVehicles);
        setSelectedVehicle(response.data);
        setSuccessMessage('Vehicle updated successfully!');
      } else {
        // Add new vehicle
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
      console.error('Error saving vehicle:', error);
      setErrorMessage('Failed to save vehicle: ' + error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleNextServiceDueUpdate = async () => {
    if (!nextServiceDueDate) {
      setErrorMessage('Please select a date for next service due');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      setLoading(true);
      const response = await apiCall(`/vehicles/${selectedVehicle._id}`, {
        method: 'PUT',
        body: JSON.stringify({ nextServiceDue: nextServiceDueDate })
      });

      const updatedVehicles = vehicles.map(v =>
        v._id === selectedVehicle._id ? { ...v, nextServiceDue: response.data.nextServiceDue } : v
      );
      setVehicles(updatedVehicles);
      setSelectedVehicle({ ...selectedVehicle, nextServiceDue: response.data.nextServiceDue });

      setShowNextServiceModal(false);
      setNextServiceDueDate('');
      setSuccessMessage('Next service due date updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating next service due:', error);
      setErrorMessage('Failed to update next service due date: ' + error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Expense-related functions
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

  const handleQuickAction = (action) => {
    if (!selectedVehicle) {
      setErrorMessage('Please select a vehicle first');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    switch (action) {
      case 'Log Fuel':
        setExpenseFormType('Fuel');
        setEditingExpense(null);
        setShowExpenseModal(true);
        break;
      case 'Log Service':
        setExpenseFormType('Service');
        setEditingExpense(null);
        setShowExpenseModal(true);
        break;
      case 'Log Expense':
        setExpenseFormType('Other');
        setEditingExpense(null);
        setShowExpenseModal(true);
        break;
      default:
        setSuccessMessage(`${action} functionality would be implemented here`);
        setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleExpenseSubmit = async (expenseData) => {
    try {
      setExpensesLoading(true);

      if (editingExpense) {
        // Update existing expense
        const toSendData = { ...expenseData, fuelAmount: expenseData?.fuelAmount || expenseData?.fuelAdded || 0, nextFuelingOdometer: expenseData?.nextFuelingOdometer && expenseData?.nextFuelingOdometer > 0 ? expenseData?.nextFuelingOdometer : 0 };
        const response = await apiCall(`/expenses/${editingExpense._id}`, {
          method: 'PUT',
          body: JSON.stringify(toSendData)
        });

        const updatedExpenses = expenses.map(e =>
          e._id === editingExpense._id ? response.data : e
        );
        setExpenses(updatedExpenses);
        setSuccessMessage('Expense updated successfully!');
      } else {
        // Add new expense
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

      // Refresh stats
      if (selectedVehicle) {
        fetchExpenseStats(selectedVehicle._id);
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving expense:', error);
      setErrorMessage('Failed to save expense: ' + (error.message || 'Unknown error'));
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setExpensesLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        setExpensesLoading(true);
        await apiCall(`/expenses/${expenseId}`, {
          method: 'DELETE'
        });

        const updatedExpenses = expenses.filter(e => e._id !== expenseId);
        setExpenses(updatedExpenses);
        setSuccessMessage('Expense deleted successfully!');

        // Refresh stats
        if (selectedVehicle) {
          fetchExpenseStats(selectedVehicle._id);
        }

        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting expense:', error);
        setErrorMessage('Failed to delete expense: ' + error.message);
        setTimeout(() => setErrorMessage(''), 3000);
      } finally {
        setExpensesLoading(false);
      }
    }
  };

  const handleEditExpense = (expense) => {
    // Close the view modal first
    setShowExpensesList(false);
    // Then set up the edit modal
    setEditingExpense(expense);
    setExpenseFormType(expense.expenseType);
    // Use setTimeout to ensure view modal is closed before opening edit modal
    setTimeout(() => {
      setShowExpenseModal(true);
    }, 100);
  };

  
  // Display messages
  const displayMessage = () => {
    if (successMessage) {
      return (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#dcfce7',
          color: '#14532d',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #86efac',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          ✅ {successMessage}
        </div>
      );
    }
    if (errorMessage) {
      return (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #fca5a5',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          ❌ {errorMessage}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {displayMessage()}
      <div className="dashboard-container">
        {/* Left Column - Garage List */}
        <div className="sidebar">
          <div className="sidebar-content">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
              My Garage ({vehicles.length})
            </h2>

            {vehicles.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                border: '2px dashed #d1d5db'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
                <h3 style={{ color: '#4b5563', marginBottom: '0.5rem' }}>Your Garage is Empty</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Add your first vehicle to start tracking expenses and service history.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className={`vehicle-card-selected ${selectedVehicle?._id === vehicle._id ? '' : 'opacity-75'}`}
                    onClick={() => handleVehicleSelect(vehicle)}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 150ms ease-in-out'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontWeight: '700', fontSize: '1.125rem' }}>
                          {vehicle.vehicleName}
                        </h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {vehicle.company} {vehicle.model}
                        </p>
                      </div>
                      <span
                        style={{
                          backgroundColor: selectedVehicle?._id === vehicle._id ? '#4ade80' : 'rgba(255, 255, 255, 0.2)',
                          color: '#14532d',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px'
                        }}
                      >
                        {selectedVehicle?._id === vehicle._id ? 'ACTIVE' : 'SELECT'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>ODOMETER: {vehicle.odometerReading || 0} kms</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Added {new Date(vehicle.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewVehicle(vehicle);
                        }}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          transition: 'background-color 150ms ease-in-out',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        title="View Vehicle Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditVehicle(vehicle);
                        }}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          transition: 'background-color 150ms ease-in-out',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        title="Edit Vehicle"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVehicle(vehicle._id);
                        }}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          transition: 'background-color 150ms ease-in-out',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        title="Delete Vehicle"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="main-content">
          {/* Top Bar */}
          <div className="dashboard-top-bar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>My Garage</h1>
                <p style={{ color: '#4b5563' }}>
                  {vehicles.length === 0
                    ? "Add your first vehicle to get started!"
                    : "Good evening! Your vehicles are ready for management."
                  }
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleAddVehicle}
                  className="btn-secondary"
                >
                  Add Vehicle
                </button>
                {/* <button className="btn-danger">
                  Logout
                </button> */}
              </div>
            </div>
          </div>

          {selectedVehicle ? (
            <>
              {/* Vehicle Title */}
              <div className="vehicle-title-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                      {selectedVehicle.vehicleName}
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: '#4b5563' }}>
                      {selectedVehicle.company} {selectedVehicle.model} ({selectedVehicle.fuelType || 'N/A'})
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleEditVehicle(selectedVehicle)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease-in-out'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                      Edit Vehicle
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(selectedVehicle._id)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease-in-out'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleCalculateMileage(selectedVehicle._id)}
                      style={{
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease-in-out'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                      title="Calculate mileage from fuel expenses"
                    >
                      📊 Calculate Mileage
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Cards */}
              <div className="info-cards">
                {/* Vehicle Information Card */}
                <div className="info-card">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
                    Vehicle Information
                  </h3>
                  <div className="info-grid">
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        COMPANY
                      </p>
                      <p style={{ fontWeight: '500', color: '#111827' }}>
                        {selectedVehicle.company || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        MODEL
                      </p>
                      <p style={{ fontWeight: '500', color: '#111827' }}>
                        {selectedVehicle.model || 'N/A'}
                      </p>
                    </div>
                    {/* <div>
                      <p style={{ fontSize: '0.75rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        FUEL TYPE
                      </p>
                      <p style={{ fontWeight: '500', color: '#111827' }}>
                        {selectedVehicle.fuelType || 'N/A'}
                      </p>
                    </div> */}
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        PURCHASED DATE
                      </p>
                      <p style={{ fontWeight: '500', color: '#111827' }}>
                        {selectedVehicle.purchasedDate
                          ? new Date(selectedVehicle.purchasedDate).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        REGISTRATION
                      </p>
                      <p style={{ fontWeight: '500', color: '#111827' }}>
                        {selectedVehicle.vehicleRegistrationNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        VEHICLE COST
                      </p>
                      <p style={{ fontWeight: '500', color: '#111827' }}>
                        {selectedVehicle.vehicleCost
                          ? `₹${parseFloat(selectedVehicle.vehicleCost).toLocaleString()}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        FUEL TYPE
                      </p>
                      <p style={{ fontWeight: '500', color: '#111827' }}>
                        {selectedVehicle.fuelType || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="info-card">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
                    Timeline
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="timeline-item">
                      <div className="timeline-icon" style={{ backgroundColor: '#dbeafe' }}>
                        <svg className="w-4 h-4" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', color: '#111827' }}>Vehicle Added</p>
                        <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                          {new Date(selectedVehicle.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Next Service Due Timeline Item */}
                    <div className="timeline-item">
                      <div className="timeline-icon" style={{ backgroundColor: '#fef3c7' }}>
                        <svg className="w-4 h-4" style={{ color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontWeight: '500', color: '#111827' }}>Next Service Due</p>
                            {selectedVehicle?.nextServiceDue ? (
                              <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                                {new Date(selectedVehicle.nextServiceDue).toLocaleDateString()}
                              </p>
                            ) : (
                              <p style={{ fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>
                                Not set
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setNextServiceDueDate(selectedVehicle?.nextServiceDue ? new Date(selectedVehicle.nextServiceDue).toISOString().split('T')[0] : '');
                              setShowNextServiceModal(true);
                            }}
                            style={{
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'background-color 150ms ease-in-out'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                            title="Set next service due date"
                          >
                            {selectedVehicle?.nextServiceDue ? 'Edit' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="timeline-item">
                      <div className="timeline-icon" style={{ backgroundColor: '#dcfce7' }}>
                        <svg className="w-4 h-4" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', color: '#111827' }}>Last Updated</p>
                        <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                          {selectedVehicle.updatedAt
                            ? new Date(selectedVehicle.updatedAt).toLocaleDateString()
                            : new Date(selectedVehicle.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-icon" style={{ backgroundColor: '#dbeafe' }}>
                        <svg className="w-4 h-4" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', color: '#111827' }}>Insurance expiry</p>
                        <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                          {new Date(selectedVehicle?.insuranceExpiry).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {selectedVehicle?.emissionTestExpiry && (
                      <div className="timeline-item">
                        <div className="timeline-icon" style={{ backgroundColor: '#dbeafe' }}>
                          <svg className="w-4 h-4" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p style={{ fontWeight: '500', color: '#111827' }}>Emission test expiry</p>
                          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                            {new Date(selectedVehicle?.emissionTestExpiry).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expense Statistics Card */}
                <div className="info-card">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
                    Expense Summary
                  </h3>
                  {expenseStats && expenseStats.stats ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>Total Expenses:</span>
                        <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>
                          ₹{expenseStats.stats.totalExpenses?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      {expenseStats.stats.expenseBreakdown?.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>{item.type}:</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                            ₹{item.total?.toFixed(2) || '0.00'} ({item.count || 0})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                      <div>No expense data available</div>
                    </div>
                  )}
                  <button
                    onClick={() => setShowExpensesList(true)}
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 150ms ease-in-out'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    View All Expenses
                  </button>
                </div>

                
                {/* Quick Actions Card */}
                <div className="info-card">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
                    Quick Actions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleQuickAction('Log Fuel')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#dbeafe',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease-in-out'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#bfdbfe'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#dbeafe'}
                    >
                      <div style={{ backgroundColor: '#3b82f6', padding: '0.5rem', borderRadius: '0.375rem' }}>
                        <svg className="w-5 h-5" style={{ color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '500', color: '#111827' }}>Log Fuel</div>
                        <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Track fuel expenses</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleQuickAction('Log Service')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#dcfce7',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease-in-out'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#bbf7d0'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#dcfce7'}
                    >
                      <div style={{ backgroundColor: '#059669', padding: '0.5rem', borderRadius: '0.375rem' }}>
                        <svg className="w-5 h-5" style={{ color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '500', color: '#111827' }}>Log Service</div>
                        <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Record maintenance</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleQuickAction('Log Expense')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#fee2e2',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease-in-out'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#fecaca'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#fee2e2'}
                    >
                      <div style={{ backgroundColor: '#ef4444', padding: '0.5rem', borderRadius: '0.375rem' }}>
                        <svg className="w-5 h-5" style={{ color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '500', color: '#111827' }}>Log Expense</div>
                        <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Track other costs</div>
                      </div>
                    </button>

                                      </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
              <h3 style={{ color: '#4b5563', marginBottom: '1rem' }}>
                No Vehicle Selected
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Select a vehicle from your garage or add a new one to get started.
              </p>
              <button
                onClick={handleAddVehicle}
                className="btn-secondary"
              >
                Add Your First Vehicle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Form Modal */}
      {(showAddVehicleModal || showEditVehicleModal) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => {
            setShowAddVehicleModal(false);
            setShowEditVehicleModal(false);
            setEditingVehicle(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                {editingVehicle ? '✏️ Edit Vehicle' : '➕ Add New Vehicle'}
              </h2>
              <button
                onClick={() => {
                  setShowAddVehicleModal(false);
                  setShowEditVehicleModal(false);
                  setEditingVehicle(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <VehicleForm
              vehicle={editingVehicle}
              onSuccess={handleVehicleSubmit}
              onClose={() => {
                setShowAddVehicleModal(false);
                setShowEditVehicleModal(false);
                setEditingVehicle(null);
              }}
            />
          </div>
        </div>
      )}

      {/* View Vehicle Modal */}
      {showViewVehicleModal && viewingVehicle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                Vehicle Details
              </h2>
              <button
                onClick={() => {
                  setShowViewVehicleModal(false);
                  setViewingVehicle(null);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              {/* Basic Information */}
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  Basic Information
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Vehicle Name:</span>
                    <span style={{ color: '#111827' }}>{viewingVehicle.vehicleName || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Company:</span>
                    <span style={{ color: '#111827' }}>{viewingVehicle.company || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Model:</span>
                    <span style={{ color: '#111827' }}>{viewingVehicle.model || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Fuel Type:</span>
                    <span style={{ color: '#111827' }}>{viewingVehicle.fuelType || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Registration Number:</span>
                    <span style={{ color: '#111827' }}>{viewingVehicle.vehicleRegistrationNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Purchase Information */}
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  Purchase Information
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Purchase Date:</span>
                    <span style={{ color: '#111827' }}>
                      {viewingVehicle.purchasedDate
                        ? new Date(viewingVehicle.purchasedDate).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Vehicle Cost:</span>
                    <span style={{ color: '#111827' }}>
                      ₹{viewingVehicle.vehicleCost ? viewingVehicle.vehicleCost.toLocaleString() : '0'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Odometer Reading:</span>
                    <span style={{ color: '#111827' }}>
                      {viewingVehicle.odometerReading ? viewingVehicle.odometerReading.toLocaleString() : '0'} kms
                    </span>
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  Insurance Information
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Insurance Number:</span>
                    <span style={{ color: '#111827' }}>{viewingVehicle.insuranceNumber || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Insurance Expiry:</span>
                    <span style={{ color: '#111827' }}>
                      {viewingVehicle.insuranceExpiry
                        ? new Date(viewingVehicle.insuranceExpiry).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  Additional Information
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Emission Test Expiry:</span>
                    <span style={{ color: '#111827' }}>
                      {viewingVehicle.emissionTestExpiry
                        ? new Date(viewingVehicle.emissionTestExpiry).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Date Added:</span>
                    <span style={{ color: '#111827' }}>
                      {viewingVehicle.createdAt
                        ? new Date(viewingVehicle.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Last Updated:</span>
                    <span style={{ color: '#111827' }}>
                      {viewingVehicle.updatedAt
                        ? new Date(viewingVehicle.updatedAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => {
                  setShowViewVehicleModal(false);
                  setViewingVehicle(null);
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease-in-out'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {showExpenseModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
          }}
          onClick={() => {
            setShowExpenseModal(false);
            setEditingExpense(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                {editingExpense ? '✏️ Edit Expense' : `➕ Add ${expenseFormType} Expense`}
              </h2>
              <button
                onClick={() => {
                  setShowExpenseModal(false);
                  setEditingExpense(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <ExpenseForm
              vehicle={selectedVehicle}
              expense={editingExpense}
              expenseType={expenseFormType}
              userVehicles={vehicles}
              onSuccess={handleExpenseSubmit}
              onClose={() => {
                setShowExpenseModal(false);
                setEditingExpense(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Next Service Due Modal */}
      {showNextServiceModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => {
            setShowNextServiceModal(false);
            setNextServiceDueDate('');
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '2rem',
              width: '90%',
              maxWidth: '400px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                {selectedVehicle?.nextServiceDue ? '⚙️ Edit Service Due Date' : '➕ Add Next Service Due'}
              </h2>
              <button
                onClick={() => {
                  setShowNextServiceModal(false);
                  setNextServiceDueDate('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Next Service Due Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={nextServiceDueDate}
                  onChange={(e) => setNextServiceDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Select the date when the next service is due
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowNextServiceModal(false);
                    setNextServiceDueDate('');
                  }}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease-in-out'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleNextServiceDueUpdate}
                  disabled={loading || !nextServiceDueDate}
                  style={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: loading || !nextServiceDueDate ? 'not-allowed' : 'pointer',
                    transition: 'background-color 150ms ease-in-out',
                    opacity: loading || !nextServiceDueDate ? 0.5 : 1
                  }}
                >
                  {loading ? 'Saving...' : '💾 Save Date'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expenses List Modal */}
      {showExpensesList && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                💰 All Expenses - {selectedVehicle?.vehicleName || 'Selected Vehicle'}
              </h2>
              <button
                onClick={() => setShowExpensesList(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>

            {expensesLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <div>Loading expenses...</div>
              </div>
            ) : expenses.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.75rem',
                border: '2px dashed #d1d5db'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💸</div>
                <h3 style={{ color: '#4b5563', marginBottom: '0.5rem' }}>No expenses recorded</h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Start tracking your vehicle expenses by adding your first expense.
                </p>
                <button
                  onClick={() => {
                    setShowExpensesList(false);
                    setExpenseFormType('Fuel');
                    setShowExpenseModal(true);
                  }}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Add First Expense
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {expenses.map((expense) => (
                  <div key={expense._id} style={{
                    backgroundColor: '#f9fafb',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{
                          backgroundColor: expense.expenseType === 'Fuel' ? '#dbeafe' :
                                         expense.expenseType === 'Service' ? '#dcfce7' : '#fee2e2',
                          color: expense.expenseType === 'Fuel' ? '#1e40af' :
                                 expense.expenseType === 'Service' ? '#065f46' : '#991b1b',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {expense.expenseType}
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>
                          ₹{expense.amount.toFixed(2)}
                        </span>
                      </div>

                      {/* Vehicle Information */}
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
                        🚗 {expense.vehicle?.vehicleName} ({expense.vehicle?.company} {expense.vehicle?.model})
                        {expense.vehicle?.vehicleRegistrationNumber && ` • ${expense.vehicle.vehicleRegistrationNumber}`}
                      </div>

                      <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                        {expense.expenseType === 'Fuel' && (
                          <>
                            {expense.fuelAdded ? `${expense.fuelAdded}L added` : ''}
                            {expense.totalCost && ` • ₹${expense.totalCost.toFixed(2)}`}
                            {expense.odometerReading && ` • ${expense.odometerReading.toLocaleString()} km`}
                            {expense.mileageInfo && (
                              <div style={{
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                marginTop: '0.25rem',
                                display: 'inline-block'
                              }}>
                                📊 {expense.mileageInfo}
                              </div>
                            )}
                          </>
                        )}
                        {expense.expenseType === 'Service' && (
                          <>
                            {expense.serviceType || 'Service'}
                            {expense.serviceDescription && ` • ${expense.serviceDescription}`}
                            {expense.odometerReading && ` • ${expense.odometerReading.toLocaleString()} km`}
                          </>
                        )}
                        {expense.expenseType === 'Other' && (
                          <>
                            {expense.otherExpenseType || 'Other'} • {expense.description}
                          </>
                        )}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {new Date(expense.date).toLocaleDateString()} at {new Date(expense.date).toLocaleTimeString()}
                        {expense.location && ` • ${expense.location}`}
                        {expense.paymentMethod && ` • ${expense.paymentMethod}`}
                      </div>

                      {expense.notes && (
                        <div style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.5rem', fontStyle: 'italic' }}>
                          Note: {expense.notes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      <button
                        onClick={() => handleEditExpense(expense)}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 150ms ease-in-out'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                        title="Edit Expense"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense._id)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 150ms ease-in-out'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                        title="Delete Expense"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

          </>
  );
};

// TripsPage Component
const TripsPage = () => {
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
  React.useEffect(() => {
    localStorage.setItem('currentPage', 'trips');
    fetchVehicles();
  }, []);

  // Load trips and stats when vehicle is selected
  React.useEffect(() => {
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

      // Set selected vehicle if none selected and vehicles exist
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
        // Update existing trip
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
        // Add new trip
        const response = await apiCall('/trips', {
          method: 'POST',
          body: JSON.stringify(tripData)
        });

        setTrips([response.data, ...trips]);
        setSuccessMessage('Trip added successfully!');
      }

      setShowTripModal(false);
      setEditingTrip(null);

      // Refresh stats
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

        // Refresh stats
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
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#dcfce7',
          color: '#14532d',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #86efac',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          ✅ {successMessage}
        </div>
      );
    }
    if (errorMessage) {
      return (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #fca5a5',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          ❌ {errorMessage}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {displayMessage()}
      <div className="min-h-screen" style={{ backgroundColor: '#f3f4f6' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1.5rem 0'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h1 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  🗺️ Trip Management
                </h1>
                <p style={{ color: '#6b7280' }}>
                  Track and manage your vehicle trips and journey analytics
                </p>
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
              }}>
                {vehicles.length > 0 && (
                  <select
                    value={selectedVehicle?._id || ''}
                    onChange={(e) => {
                      const vehicle = vehicles.find(v => v._id === e.target.value);
                      setSelectedVehicle(vehicle);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      minWidth: '200px'
                    }}
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.vehicleName}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={handleAddTrip}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease-in-out'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                >
                  ➕ Add Trip
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem 1rem'
        }}>
          {vehicles.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
              <h3 style={{ color: '#4b5563', marginBottom: '1rem' }}>
                No Vehicles Found
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Add vehicles to your garage first to start tracking trips.
              </p>
              <button
                onClick={() => window.location.href = '#dashboard'}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease-in-out'
                }}
              >
                Go to Dashboard
              </button>
            </div>
          ) : !selectedVehicle ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
              <h3 style={{ color: '#4b5563', marginBottom: '1rem' }}>
                Select a Vehicle
              </h3>
              <p style={{ color: '#6b7280' }}>
                Choose a vehicle from the dropdown to view and manage its trips.
              </p>
            </div>
          ) : (
            <>
              {/* Vehicle Info and Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Vehicle Info Card */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '1rem'
                  }}>
                    Current Vehicle
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '1.5rem'
                    }}>
                      🚗
                    </div>
                    <div>
                      <div style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#111827'
                      }}>
                        {selectedVehicle.vehicleName}
                      </div>
                      <div style={{ color: '#6b7280' }}>
                        {selectedVehicle.company} {selectedVehicle.model}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trip Stats Card */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '1rem'
                  }}>
                    Trip Statistics
                  </h3>
                  {tripStats ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '1rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          Total Trips
                        </div>
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#111827'
                        }}>
                          {tripStats.totalTrips || 0}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          Total Distance
                        </div>
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#111827'
                        }}>
                          {(tripStats.totalDistance || 0).toLocaleString()} km
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          Total Cost
                        </div>
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#111827'
                        }}>
                          ₹{(tripStats.totalCost || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          Avg Distance
                        </div>
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#111827'
                        }}>
                          {tripStats.totalTrips > 0 ? (tripStats.totalDistance / tripStats.totalTrips).toFixed(1) : 0} km
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#6b7280' }}>
                      No trip data available
                    </div>
                  )}
                </div>
              </div>

              {/* Trips List */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '1.5rem'
                }}>
                  Trip History
                </h3>

                {tripsLoading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    <div>Loading trips...</div>
                  </div>
                ) : trips && trips.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {trips.map((trip) => (
                      <div key={trip._id} style={{
                        backgroundColor: '#f9fafb',
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #e5e7eb',
                        transition: 'transform 150ms ease-in-out'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <div style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>
                                {trip.startLocation} → {trip.endLocation}
                              </div>
                              <span style={{
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}>
                                {trip.purpose || 'Personal'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                              {new Date(trip.date).toLocaleDateString()}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                              <span><strong>Distance:</strong> {trip.distance} km</span>
                              <span><strong>Cost:</strong> ₹{trip.totalCost?.toFixed(2)}</span>
                              {(trip.startOdometer || trip.endOdometer) && (
                                <span><strong>Odometer:</strong> {trip.startOdometer || 0} → {trip.endOdometer || 0} km</span>
                              )}
                            </div>
                            {trip.notes && (
                              <div style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic', marginTop: '0.5rem' }}>
                                {trip.notes}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleEditTrip(trip)}
                              style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 150ms ease-in-out'
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTrip(trip._id)}
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 150ms ease-in-out'
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                              onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗺️</div>
                    <h3 style={{ color: '#4b5563', marginBottom: '1rem' }}>No trips recorded yet</h3>
                    <p style={{ marginBottom: '1rem' }}>Start tracking your journeys by adding your first trip.</p>
                    <button
                      onClick={handleAddTrip}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease-in-out'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      Add Your First Trip
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Trip Form Modal */}
        {showTripModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100
            }}
            onClick={() => {
              setShowTripModal(false);
              setEditingTrip(null);
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                padding: '2rem',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                onClick={() => {
                  setShowTripModal(false);
                  setEditingTrip(null);
                }}
              >
                ×
              </button>

              <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
                {editingTrip ? 'Edit Trip' : 'Log New Trip'}
              </h2>

              <TripForm
                trip={editingTrip}
                vehicles={vehicles}
                selectedVehicle={selectedVehicle}
                onSubmit={handleTripSubmit}
                onCancel={() => {
                  setShowTripModal(false);
                  setEditingTrip(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ExpenseForm Component
const ExpenseForm = ({ vehicle, expense, expenseType, onSuccess, onClose, userVehicles = [] }) => {
  const [formData, setFormData] = useState({
    vehicle: vehicle?._id || '',
    expenseType: expenseType,
    otherExpenseType: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receiptNumber: '',
    odometerReading: '',
    // Fuel specific
    totalFuel: '',
    totalCost: '',
    fuelAdded: '',
    nextFuelingOdometer: '',
    // Service specific
    serviceDescription: '',
    serviceType: 'General Maintenance',
    // Common
    notes: '',
    location: '',
    paymentMethod: 'Cash'
  });

  // Update form data when vehicle changes
  React.useEffect(() => {
    if (vehicle) {
      setFormData(prev => ({
        ...prev,
        vehicle: vehicle._id
      }));
    }
  }, [vehicle]);

  // Update form data when expense changes (for editing)
  React.useEffect(() => {
    if (expense) {
      setFormData({
        vehicle: vehicle?._id || expense.vehicle?._id || '',
        expenseType: expense.expenseType,
        otherExpenseType: expense.otherExpenseType || '',
        amount: expense.amount || '',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: expense.description || '',
        receiptNumber: expense.receiptNumber || '',
        odometerReading: expense.odometerReading || '',
        // Fuel specific
        totalFuel: expense.totalFuel || '',
        totalCost: expense.totalCost || '',
        fuelAdded: expense.fuelAdded || '',
        nextFuelingOdometer: expense.nextFuelingOdometer || '',
        // Service specific
        serviceDescription: expense.serviceDescription || '',
        serviceType: expense.serviceType || 'General Maintenance',
        // Common
        notes: expense.notes || '',
        location: expense.location || '',
        paymentMethod: expense.paymentMethod || 'Cash'
      });
    } else {
      // Reset form for new expense
      setFormData({
        vehicle: vehicle?._id || '',
        expenseType: expenseType,
        otherExpenseType: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        receiptNumber: '',
        odometerReading: '',
        // Fuel specific
        totalFuel: '',
        totalCost: '',
        fuelAdded: '',
        nextFuelingOdometer: '',
        // Service specific
        serviceDescription: '',
        serviceType: 'General Maintenance',
        // Common
        notes: '',
        location: '',
        paymentMethod: 'Cash'
      });
    }
  }, [expense, vehicle, expenseType]);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    const currentExpenseType = expense?.expenseType || expenseType;

    // Amount validation - different for fuel vs other expenses
    if (currentExpenseType !== 'Fuel') {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount must be greater than 0 (INR)';
      }
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.vehicle && !vehicle) {
      newErrors.vehicle = 'Vehicle is required';
    }

    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.odometerReading || parseFloat(formData.odometerReading) < 0) {
      newErrors.odometerReading = 'Odometer reading is required';
    }

    if (currentExpenseType === 'Fuel') {
      if (!formData.fuelAdded || parseFloat(formData.fuelAdded) <= 0) {
        newErrors.fuelAdded = 'Fuel added must be greater than 0';
      }
      if (!formData.totalFuel || parseFloat(formData.totalFuel) <= 0) {
        newErrors.totalFuel = 'Tank capacity must be greater than 0';
      }
      if (!formData.totalCost || parseFloat(formData.totalCost) <= 0) {
        newErrors.totalCost = 'Total amount must be greater than 0';
      }
      // nextFuelingOdometer is optional, no validation needed
    }

    if (currentExpenseType === 'Service') {
      if (!formData.serviceDescription || !formData.serviceDescription.trim()) {
        newErrors.serviceDescription = 'Service description is required';
      }
    }

    if (currentExpenseType === 'Other') {
      if (!formData.otherExpenseType || !formData.otherExpenseType.trim()) {
        newErrors.otherExpenseType = 'Other expense type specification is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If expense type is changing, reset type-specific fields
    if (name === 'expenseType') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Reset fuel-specific fields
        totalFuel: '',
        totalCost: '',
        fuelAdded: '',
        nextFuelingOdometer: '',
        // Reset service-specific fields
        serviceDescription: '',
        serviceType: 'General Maintenance',
        // Reset other-specific fields
        otherExpenseType: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentExpenseType = expense?.expenseType || formData.expenseType;

    if (!validateForm()) {
      return;
    }

    // Clean form data before submitting
    const cleanedFormData = { ...formData };

    // Use provided vehicle if no vehicle selected in form
    if (!cleanedFormData.vehicle && vehicle) {
      cleanedFormData.vehicle = vehicle._id;
    }

    // Ensure vehicle is just the ID string, not the entire object
    if (cleanedFormData.vehicle && typeof cleanedFormData.vehicle === 'object') {
      cleanedFormData.vehicle = cleanedFormData.vehicle._id || cleanedFormData.vehicle.id;
    }

    // Convert numeric fields - only convert relevant fields based on expense type
    if (currentExpenseType === 'Fuel') {
      // Convert all fuel-related numeric fields
      ['amount', 'odometerReading', 'totalFuel', 'totalCost', 'fuelAdded', 'nextFuelingOdometer'].forEach(field => {
        if (cleanedFormData[field]) {
          cleanedFormData[field] = parseFloat(cleanedFormData[field]);
        }
      });
    } else {
      // Only convert common numeric fields for non-fuel expenses
      ['amount', 'odometerReading'].forEach(field => {
        if (cleanedFormData[field]) {
          cleanedFormData[field] = parseFloat(cleanedFormData[field]);
        }
      });
    }

    // Only include relevant fields based on expense type
    const submissionData = {
      vehicle: cleanedFormData.vehicle,
      expenseType: cleanedFormData.expenseType,
      amount: cleanedFormData.amount,
      date: cleanedFormData.date,
      description: cleanedFormData.description,
      odometerReading: cleanedFormData.odometerReading,
      receiptNumber: cleanedFormData.receiptNumber,
      paymentMethod: cleanedFormData.paymentMethod,
      location: cleanedFormData.location,
      notes: cleanedFormData.notes
    };

    if (currentExpenseType === 'Fuel') {
      // For fuel expenses, set amount to totalCost for backward compatibility
      submissionData.amount = cleanedFormData.totalCost;
      submissionData.totalFuel = cleanedFormData.totalFuel;
      submissionData.totalCost = cleanedFormData.totalCost;
      submissionData.fuelAdded = cleanedFormData.fuelAdded;
      submissionData.nextFuelingOdometer = cleanedFormData.nextFuelingOdometer || undefined;
    } else if (currentExpenseType === 'Service') {
      submissionData.serviceDescription = cleanedFormData.serviceDescription;
      submissionData.serviceType = cleanedFormData.serviceType;
    } else if (currentExpenseType === 'Other') {
      submissionData.otherExpenseType = cleanedFormData.otherExpenseType;
    }

    if (onSuccess) {
      onSuccess(submissionData);
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
      {/* Expense Type Selection - only show for new expenses, not editing */}
      {!expense && (
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Expense Type <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            name="expenseType"
            value={formData.expenseType}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="Fuel">⛽ Fuel</option>
            <option value="Service">🔧 Service</option>
            <option value="Other">📋 Other</option>
          </select>
        </div>
      )}

      {/* Vehicle Selection - always show vehicle dropdown for new expenses */}
      {!vehicle && !expense && userVehicles.length > 0 && (
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Vehicle <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            name="vehicle"
            value={formData.vehicle}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.vehicle ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          >
            <option value="">Select a vehicle</option>
            {userVehicles.map(v => (
              <option key={v._id} value={v._id}>
                {v.vehicleName} ({v.company} {v.model}) - {v.vehicleRegistrationNumber}
              </option>
            ))}
          </select>
          {errors.vehicle && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.vehicle}
            </div>
          )}
        </div>
      )}

      {/* Show vehicle info when editing or when vehicle is provided via prop */}
      {(vehicle || expense) && (
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.25rem' }}>
            🚗 Vehicle: {(vehicle || expense.vehicle)?.vehicleName}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {(vehicle || expense.vehicle)?.company} {(vehicle || expense.vehicle)?.model} • {(vehicle || expense.vehicle)?.vehicleRegistrationNumber}
          </div>
          {expense && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              💰 Type: {expense.expenseType} (Cannot be changed when editing)
            </div>
          )}
        </div>
      )}

      {/* Common Fields */}
      {/* Amount field - only show for non-fuel expenses */}
      {(expense?.expenseType || formData.expenseType) !== 'Fuel' && (
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Amount (INR) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            step="0.01"
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.amount ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.amount && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.amount}
            </div>
          )}
        </div>
      )}

      {/* For fuel expenses, show Total Amount instead of regular Amount */}
      {(expense?.expenseType || formData.expenseType) === 'Fuel' && (
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Total Amount (INR) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="number"
            name="totalCost"
            value={formData.totalCost}
            onChange={handleInputChange}
            step="0.01"
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.totalCost ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.totalCost && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.totalCost}
            </div>
          )}
        </div>
      )}

      {/* Date field - for all expenses */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Date <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          max={new Date().toISOString().split('T')[0]}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `1px solid ${errors.date ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '0.5rem',
            fontSize: '1rem'
          }}
        />
        {errors.date && (
          <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {errors.date}
          </div>
        )}
      </div>

      {/* Description and Odometer - required for all types */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Description <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of the expense"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.description ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.description && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.description}
            </div>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Odometer Reading (kms) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="number"
            name="odometerReading"
            value={formData.odometerReading}
            onChange={handleInputChange}
            placeholder="Current odometer reading"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.odometerReading ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.odometerReading && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.odometerReading}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Number (optional) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Receipt Number
          </label>
          <input
            type="text"
            name="receiptNumber"
            value={formData.receiptNumber}
            onChange={handleInputChange}
            placeholder="Optional receipt number"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Payment Method
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          >
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Digital Wallet">Digital Wallet</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Type-specific fields */}
      {(expense?.expenseType || formData.expenseType) === 'Fuel' && (
        <>
          <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af', fontSize: '0.875rem', fontWeight: '600' }}>
              ⛽ Fuel Expense Details
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
              Enter fuel details to enable mileage calculation between fuelings
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Tank Capacity (liters) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                name="totalFuel"
                value={formData.totalFuel}
                onChange={handleInputChange}
                step="0.01"
                placeholder="Total tank capacity"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.totalFuel ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
              {errors.totalFuel && (
                <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.totalFuel}
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Total fuel tank capacity
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Fuel Added (liters) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                name="fuelAdded"
                value={formData.fuelAdded}
                onChange={handleInputChange}
                step="0.01"
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.fuelAdded ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
              {errors.fuelAdded && (
                <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.fuelAdded}
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Amount of fuel added during this fueling
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Next Fueling Odometer (kms)
              </label>
              <input
                type="number"
                name="nextFuelingOdometer"
                value={formData.nextFuelingOdometer}
                onChange={handleInputChange}
                placeholder="Odometer at next fueling"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Optional: Odometer reading at next fueling for mileage calculation
              </div>
            </div>
          </div>
        </>
      )}

      {(expense?.expenseType || formData.expenseType) === 'Service' && (
        <>
          <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '0.875rem', fontWeight: '600' }}>
              🔧 Service Expense Details
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
              Record maintenance and service expenses for your vehicle
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Service Type
              </label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Oil Change">Oil Change</option>
                <option value="Tire Service">Tire Service</option>
                <option value="Brake Service">Brake Service</option>
                <option value="Engine Service">Engine Service</option>
                <option value="Transmission Service">Transmission Service</option>
                <option value="Battery Service">Battery Service</option>
                <option value="AC Service">AC Service</option>
                <option value="General Maintenance">General Maintenance</option>
                <option value="Repair">Repair</option>
                <option value="Inspection">Inspection</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Service Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              name="serviceDescription"
              value={formData.serviceDescription}
              onChange={handleInputChange}
              placeholder="Describe the service performed"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.serviceDescription ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
            {errors.serviceDescription && (
              <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.serviceDescription}
              </div>
            )}
          </div>
        </>
      )}

      {(expense?.expenseType || formData.expenseType) === 'Other' && (
        <>
          <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#991b1b', fontSize: '0.875rem', fontWeight: '600' }}>
              📋 Other Expense Details
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
              Specify the type of other expense for better categorization
            </p>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Other Expense Type <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="otherExpenseType"
              value={formData.otherExpenseType}
              onChange={handleInputChange}
              placeholder="e.g., Parking, Toll, Car Wash, Insurance, etc."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.otherExpenseType ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
            {errors.otherExpenseType && (
              <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.otherExpenseType}
              </div>
            )}
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Specify what type of other expense this is (e.g., Parking, Toll, Car Wash, Insurance, Registration, Tax, Fine, Accessories, etc.)
            </div>
          </div>
        </>
      )}

      {/* Optional common fields */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Where was this expense incurred?"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Receipt Number
          </label>
          <input
            type="text"
            name="receiptNumber"
            value={formData.receiptNumber}
            onChange={handleInputChange}
            placeholder="Receipt or reference number"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Any additional notes about this expense"
          rows={2}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 150ms ease-in-out'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 150ms ease-in-out'
          }}
        >
          {expense ? '💾 Update Expense' : '➕ Add Expense'}
        </button>
      </div>
    </form>
  );
};

// ProfilePage Component - Enhanced version with all profile items from pages/Profile.js
const ProfilePage = () => {
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

  React.useEffect(() => {
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
      // Update localStorage (in real app, this would be an API call)
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

      // Clear success message after 5 seconds
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      {/* <div style={{
        background: 'linear-gradient(to right, #2563eb, #9333ea)',
        color: 'white',
        padding: '4rem 1rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>👤 My Profile</h1>
              <p style={{ fontSize: '1.125rem', color: '#dbeafe' }}>Manage your personal information and preferences</p>
              {userData?.authMethod === 'google' && (
                <span style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem',
                  display: 'inline-block'
                }}>
                  🔐 Google SSO
                </span>
              )}
            </div>
            <button
              onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
              style={{
                backgroundColor: isEditing ? '#10b981' : '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 150ms ease-in-out'
              }}
            >
              {isEditing ? '💾 Save Changes' : '✏️ Edit Profile'}
            </button>
          </div>
        </div>
      </div> */}

      {/* Messages */}
      {/* {successMessage && (
        <div style={{
          maxWidth: '1200px',
          margin: '1rem auto',
          padding: '0 1rem'
        }}>
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#14532d',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #86efac'
          }}>
            ✅ {successMessage}
          </div>
        </div>
      )}

      {errorMessage && (
        <div style={{
          maxWidth: '1200px',
          margin: '1rem auto',
          padding: '0 1rem'
        }}>
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #fca5a5'
          }}>
            ❌ {errorMessage}
          </div>
        </div>
      )} */}

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gap: '2rem' }}>

          {/* Profile Card with Avatar */}
          {/* <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: '700',
                flexShrink: 0
              }}>
                {userData.avatar ? (
                  <img src={userData.avatar} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                  {displayName}
                </h2>
                <p style={{ color: '#4b5563', marginBottom: '0.5rem' }}>{userData.email}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Member since: {new Date(userData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div> */}

          {/* Editable Profile Form */}
          {/* <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}> */}

            {/* Personal Information */}
            {/* <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '2rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📝 Personal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your first name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      cursor: isEditing ? 'text' : 'default'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your last name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      cursor: isEditing ? 'text' : 'default'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+1 (555) 123-4567"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      cursor: isEditing ? 'text' : 'default'
                    }}
                  />
                </div>
              </div>
            </div> */}

            {/* Address Information */}
            {/* <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '2rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🏠 Address Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="123 Main Street"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      cursor: isEditing ? 'text' : 'default'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="New York"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      cursor: isEditing ? 'text' : 'default'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="NY"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      cursor: isEditing ? 'text' : 'default'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="10001"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      cursor: isEditing ? 'text' : 'default'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="United States"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      cursor: isEditing ? 'text' : 'default'
                    }}
                  />
                </div>
              </div>
            </div> */}

            {/* Action Buttons */}
            {/* {isEditing && (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease-in-out'
                  }}
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease-in-out'
                  }}
                >
                  💾 Save Changes
                </button>
              </div>
            )} */}
          {/* </form> */}

          {/* Account Information */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '2rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ℹ️ Account Information
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Username:</span>
                <span style={{ color: '#4b5563' }}>{userData?.username || 'N/A'}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Email:</span>
                <span style={{ color: '#4b5563' }}>{userData.email}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Authentication:</span>
                <span style={{ color: '#4b5563' }}>
                  {userData.authMethod === 'google' ? 'Google SSO' : userData.authMethod}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Member Since:</span>
                <span style={{ color: '#4b5563' }}>
                  {new Date(userData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// VehicleForm Component
const VehicleForm = ({ vehicle, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    vehicleName: '',
    company: '',
    model: '',
    fuelType: 'Petrol',
    purchasedDate: new Date().toISOString().split('T')[0],
    vehicleCost: '',
    insuranceExpiry: '',
    insuranceNumber: '',
    emissionTestExpiry: '',
    odometerReading: '',
    vehicleRegistrationNumber: ''
  });

  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleName: vehicle.vehicleName || '',
        company: vehicle.company || '',
        model: vehicle.model || '',
        fuelType: vehicle.fuelType || 'Petrol',
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicleName.trim()) {
      newErrors.vehicleName = 'Vehicle name is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (!formData.fuelType) {
      newErrors.fuelType = 'Fuel type is required';
    }

    if (!formData.purchasedDate) {
      newErrors.purchasedDate = 'Purchase date is required';
    } else if (new Date(formData.purchasedDate) > new Date()) {
      newErrors.purchasedDate = 'Purchase date cannot be in the future';
    }

    if (!formData.vehicleCost || formData.vehicleCost <= 0) {
      newErrors.vehicleCost = 'Vehicle cost must be greater than 0';
    }

    if (!formData.insuranceExpiry) {
      newErrors.insuranceExpiry = 'Insurance expiry date is required';
    } else if (new Date(formData.insuranceExpiry) <= new Date()) {
      newErrors.insuranceExpiry = 'Insurance expiry date must be in the future';
    }

    if (formData.emissionTestExpiry && new Date(formData.emissionTestExpiry) <= new Date()) {
      newErrors.emissionTestExpiry = 'Emission test expiry date must be in the future';
    }

    if (!formData.odometerReading || formData.odometerReading < 0) {
      newErrors.odometerReading = 'Odometer reading must be 0 or greater';
    }

    if (!formData.vehicleRegistrationNumber.trim()) {
      newErrors.vehicleRegistrationNumber = 'Vehicle registration number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (onSuccess) {
      onSuccess(formData);
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Vehicle Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="vehicleName"
            value={formData.vehicleName}
            onChange={handleInputChange}
            placeholder="e.g., My Blue Truck, Family Car"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.vehicleName ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.vehicleName && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.vehicleName}
            </div>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Company <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            placeholder="e.g., Toyota, Ford, Honda"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.company ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.company && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.company}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Model <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            placeholder="e.g., Camry, F-150, Civic"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.model ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.model && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.model}
            </div>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Fuel Type <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.fuelType ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="">Select Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
            <option value="CNG">CNG</option>
            <option value="LPG">LPG</option>
          </select>
          {errors.fuelType && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.fuelType}
            </div>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Purchase Date <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="date"
            name="purchasedDate"
            value={formData.purchasedDate}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.purchasedDate ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.purchasedDate && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.purchasedDate}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Vehicle Cost (₹) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="number"
            name="vehicleCost"
            value={formData.vehicleCost}
            onChange={handleInputChange}
            placeholder="Vehicle purchase cost"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.vehicleCost ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              min: '0'
            }}
          />
          {errors.vehicleCost && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.vehicleCost}
            </div>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Insurance Expiry Date <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="date"
            name="insuranceExpiry"
            value={formData.insuranceExpiry}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.insuranceExpiry ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.insuranceExpiry && (
            <div style={{ color: '#ef444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.insuranceExpiry}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Insurance Number
          </label>
          <input
            type="text"
            name="insuranceNumber"
            value={formData.insuranceNumber}
            onChange={handleInputChange}
            placeholder="Insurance policy number (optional)"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.insuranceNumber && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.insuranceNumber}
            </div>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Emission Test Expiry
          </label>
          <input
            type="date"
            name="emissionTestExpiry"
            value={formData.emissionTestExpiry}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.emissionTestExpiry ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.emissionTestExpiry && (
            <div style={{ color: '#ef444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.emissionTestExpiry}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Odometer Reading (kms) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="number"
            name="odometerReading"
            value={formData.odometerReading}
            onChange={handleInputChange}
            placeholder="Current odometer reading in kilometers"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.odometerReading ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              min: '0'
            }}
          />
          {errors.odometerReading && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.odometerReading}
            </div>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Vehicle Registration Number <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="vehicleRegistrationNumber"
            value={formData.vehicleRegistrationNumber}
            onChange={handleInputChange}
            placeholder="Vehicle registration number"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.vehicleRegistrationNumber ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          {errors.vehicleRegistrationNumber && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.vehicleRegistrationNumber}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 150ms ease-in-out'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 150ms ease-in-out'
          }}
        >
          {vehicle ? '💾 Update Vehicle' : '➕ Add Vehicle'}
        </button>
      </div>
    </form>
  );
};

// TripForm Component
const TripForm = ({ trip, vehicles, selectedVehicle, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    vehicle: selectedVehicle?._id || '',
    date: new Date().toISOString().split('T')[0],
    startLocation: '',
    endLocation: '',
    distance: '',
    totalCost: '',
    purpose: 'Personal',
    notes: '',
    startOdometer: '',
    endOdometer: ''
  });

  const [errors, setErrors] = useState({});

  // Update form data when trip prop changes
  React.useEffect(() => {
    if (trip) {
      setFormData({
        vehicle: trip.vehicle?._id || trip.vehicle || '',
        date: trip.date ? new Date(trip.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        startLocation: trip.startLocation || '',
        endLocation: trip.endLocation || '',
        distance: trip.distance !== undefined && trip.distance !== null ? String(trip.distance) : '',
        totalCost: trip.totalCost !== undefined && trip.totalCost !== null ? String(trip.totalCost) : '',
        purpose: trip.purpose || 'Personal',
        notes: trip.notes || '',
        startOdometer: trip.startOdometer !== undefined && trip.startOdometer !== null ? String(trip.startOdometer) : '',
        endOdometer: trip.endOdometer !== undefined && trip.endOdometer !== null ? String(trip.endOdometer) : ''
      });
    }
  }, [trip]);

  // Update vehicle when selectedVehicle changes (for new trips)
  React.useEffect(() => {
    if (!trip && selectedVehicle) {
      setFormData(prev => ({
        ...prev,
        vehicle: selectedVehicle._id
      }));
    }
  }, [selectedVehicle, trip]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicle) newErrors.vehicle = 'Vehicle is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.startLocation || formData.startLocation.trim() === '') newErrors.startLocation = 'Start location is required';
    if (!formData.endLocation || formData.endLocation.trim() === '') newErrors.endLocation = 'End location is required';

    const distance = parseFloat(formData.distance);
    if (isNaN(distance) || distance <= 0) newErrors.distance = 'Distance must be greater than 0';

    const totalCost = parseFloat(formData.totalCost);
    if (isNaN(totalCost) || totalCost <= 0) newErrors.totalCost = 'Cost must be greater than 0';

    if (formData.startOdometer && formData.endOdometer) {
      const startOdo = parseFloat(formData.startOdometer);
      const endOdo = parseFloat(formData.endOdometer);
      if (!isNaN(startOdo) && !isNaN(endOdo) && endOdo <= startOdo) {
        newErrors.endOdometer = 'End odometer must be greater than start odometer';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        distance: parseFloat(formData.distance),
        totalCost: parseFloat(formData.totalCost),
        startOdometer: formData.startOdometer && formData.startOdometer.trim() !== '' ? parseFloat(formData.startOdometer) : undefined,
        endOdometer: formData.endOdometer && formData.endOdometer.trim() !== '' ? parseFloat(formData.endOdometer) : undefined
      };
      onSubmit(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Vehicle <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          name="vehicle"
          value={formData.vehicle}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            backgroundColor: 'white'
          }}
        >
          <option value="">Select a vehicle</option>
          {vehicles.map(vehicle => (
            <option key={vehicle._id} value={vehicle._id}>
              {vehicle.vehicleName} ({vehicle.company} {vehicle.model})
            </option>
          ))}
        </select>
        {errors.vehicle && (
          <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {errors.vehicle}
          </div>
        )}
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Date <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
          }}
        />
        {errors.date && (
          <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {errors.date}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Start Location <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="startLocation"
            value={formData.startLocation}
            onChange={handleChange}
            placeholder="e.g., Home, Office"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
          {errors.startLocation && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.startLocation}
            </div>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            End Location <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="endLocation"
            value={formData.endLocation}
            onChange={handleChange}
            placeholder="e.g., Airport, Mall"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
          {errors.endLocation && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.endLocation}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Distance (km) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="number"
            name="distance"
            value={formData.distance}
            onChange={handleChange}
            placeholder="0.0"
            step="0.1"
            min="0"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
          {errors.distance && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.distance}
            </div>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Total Cost (₹) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="number"
            name="totalCost"
            value={formData.totalCost}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
          {errors.totalCost && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.totalCost}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Start Odometer (km)
          </label>
          <input
            type="number"
            name="startOdometer"
            value={formData.startOdometer}
            onChange={handleChange}
            placeholder="Optional"
            step="1"
            min="0"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            End Odometer (km)
          </label>
          <input
            type="number"
            name="endOdometer"
            value={formData.endOdometer}
            onChange={handleChange}
            placeholder="Optional"
            step="1"
            min="0"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
          {errors.endOdometer && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.endOdometer}
            </div>
          )}
        </div>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Purpose
        </label>
        <select
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            backgroundColor: 'white'
          }}
        >
          <option value="Personal">Personal</option>
          <option value="Business">Business</option>
          <option value="Commute">Commute</option>
          <option value="Leisure">Leisure</option>
          <option value="Emergency">Emergency</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Optional notes about the trip"
          rows="3"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '500',
            border: '1px solid #d1d5db',
            backgroundColor: 'white',
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'background-color 150ms ease-in-out'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 150ms ease-in-out'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
        >
          {trip ? '💾 Update Trip' : '➕ Log Trip'}
        </button>
      </div>
    </form>
  );
};

export default MotorMateApp;