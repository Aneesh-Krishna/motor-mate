import React, { useState } from 'react';
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

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleQuickAction = (action) => {
    setSuccessMessage(`${action} functionality would be implemented here`);
    setTimeout(() => setSuccessMessage(''), 3000);
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
                <button className="btn-danger">
                  Logout
                </button>
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
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="info-card" style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
                    Quick Actions
                  </h3>
                  <div className="quick-actions-grid">
                    <button
                      onClick={() => handleQuickAction('Log Fuel')}
                      className="quick-action-btn"
                    >
                      <div className="quick-action-icon" style={{ backgroundColor: '#dbeafe' }}>
                        <svg className="w-6 h-6" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', color: '#111827' }}>Log Fuel</p>
                        <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Track fuel expenses</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleQuickAction('Log Service')}
                      className="quick-action-btn"
                    >
                      <div className="quick-action-icon" style={{ backgroundColor: '#dcfce7' }}>
                        <svg className="w-6 h-6" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', color: '#111827' }}>Log Service</p>
                        <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Record maintenance</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleQuickAction('Log Expense')}
                      className="quick-action-btn"
                    >
                      <div className="quick-action-icon" style={{ backgroundColor: '#fee2e2' }}>
                        <svg className="w-6 h-6" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', color: '#111827' }}>Log Expense</p>
                        <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Track other costs</p>
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
                      ${viewingVehicle.vehicleCost ? viewingVehicle.vehicleCost.toLocaleString() : '0'}
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
    </>
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

export default MotorMateApp;