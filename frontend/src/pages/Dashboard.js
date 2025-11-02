import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser as selectAuthUser, logout } from '../ducks/Login.duck';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    setVehicles([
      {
        id: 1,
        nickname: "My Blue Truck",
        make: "Ford",
        model: "F-150",
        year: 2022,
        odometer: 15420,
        totalFuelCost: 1250,
        totalServiceCost: 450,
        lastService: "2024-09-15",
        insuranceExpiry: "2025-01-15"
      },
      {
        id: 2,
        nickname: "Family Car",
        make: "Toyota",
        model: "Camry",
        year: 2020,
        odometer: 45230,
        totalFuelCost: 2100,
        totalServiceCost: 780,
        lastService: "2024-10-01",
        insuranceExpiry: "2024-12-20"
      }
    ]);
    setSelectedVehicle(1);
  }, []);

  const currentVehicle = vehicles.find(v => v.id === selectedVehicle);

  const handleLogout = () => {
    // Show confirmation dialog before logging out
    if (window.confirm('Are you sure you want to log out? Your vehicle data will be saved for your next visit.')) {
      dispatch(logout());
      console.log('You have been successfully logged out of Motorist App.');
    }
  };

  const handleAddVehicle = (newVehicle) => {
    const vehicle = {
      ...newVehicle,
      id: vehicles.length + 1,
      odometer: 0,
      totalFuelCost: 0,
      totalServiceCost: 0
    };
    setVehicles([...vehicles, vehicle]);
    setShowAddVehicle(false);
    setSelectedVehicle(vehicle.id);
  };

  const handleAddExpense = (expense) => {
    // In a real app, this would save to backend
    console.log('Adding expense:', expense);
    setShowAddExpense(false);
  };

  const handleExpenseClick = (expenseType) => {
    // Placeholder function for expense logging
    console.log(`${expenseType} expense logging clicked - Feature coming soon!`);
    alert(`${expenseType} expense logging feature will be available in the next update!`);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>🚗 My Garage</h1>
            <div className="user-welcome">
              <p>Welcome back, {user?.name || user?.email?.split('@')[0] || 'Motorist'}!</p>
              {user?.email?.includes('gmail.com') && (
                <span className="auth-badge">🔐 Signed in with Google</span>
              )}
            </div>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowAddVehicle(true)}
            >
              + Add Vehicle
            </button>
            <button className="btn btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h2>No Vehicles Yet</h2>
            <p>Start tracking your vehicle expenses by adding your first vehicle to your garage.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddVehicle(true)}
            >
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <>
            <div className="vehicle-selector">
              <div className="vehicle-tabs">
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    className={`vehicle-tab ${selectedVehicle === vehicle.id ? 'active' : ''}`}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                  >
                    <div className="vehicle-tab-info">
                      <span className="vehicle-nickname">{vehicle.nickname}</span>
                      <span className="vehicle-details">{vehicle.year} {vehicle.make} {vehicle.model}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {currentVehicle && (
              <div className="dashboard-grid">
                <div className="dashboard-card vehicle-overview">
                  <div className="vehicle-header">
                    <h3>{currentVehicle.nickname}</h3>
                    <span className="vehicle-badge">{currentVehicle.year} {currentVehicle.make} {currentVehicle.model}</span>
                  </div>
                  <div className="vehicle-stats">
                    <div className="vehicle-stat">
                      <span className="stat-icon">📊</span>
                      <div>
                        <span className="stat-label">Odometer</span>
                        <span className="stat-value">{currentVehicle.odometer.toLocaleString()} mi</span>
                      </div>
                    </div>
                    <div className="vehicle-stat">
                      <span className="stat-icon">⛽</span>
                      <div>
                        <span className="stat-label">Total Fuel Cost</span>
                        <span className="stat-value">${currentVehicle.totalFuelCost.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="vehicle-stat">
                      <span className="stat-icon">🔧</span>
                      <div>
                        <span className="stat-label">Total Service Cost</span>
                        <span className="stat-value">${currentVehicle.totalServiceCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dashboard-card important-dates">
                  <h3>📅 Important Dates</h3>
                  <div className="date-items">
                    <div className="date-item">
                      <span className="date-icon">🛡️</span>
                      <div>
                        <span className="date-label">Insurance Expires</span>
                        <span className="date-value">{new Date(currentVehicle.insuranceExpiry).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="date-item">
                      <span className="date-icon">🔧</span>
                      <div>
                        <span className="date-label">Last Service</span>
                        <span className="date-value">{new Date(currentVehicle.lastService).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dashboard-card quick-actions">
                  <h3>⚡ Quick Actions</h3>
                  <div className="actions-grid">
                    <button
                      className="action-btn fuel"
                      onClick={() => handleExpenseClick('Fuel')}
                    >
                      <span className="action-icon">⛽</span>
                      Log Fuel
                    </button>
                    <button
                      className="action-btn service"
                      onClick={() => handleExpenseClick('Service')}
                    >
                      <span className="action-icon">🔧</span>
                      Log Service
                    </button>
                    <button
                      className="action-btn other"
                      onClick={() => handleExpenseClick('Other')}
                    >
                      <span className="action-icon">📝</span>
                      Log Other
                    </button>
                    <button
                      className="action-btn trip"
                      onClick={() => handleExpenseClick('Trip')}
                    >
                      <span className="action-icon">🗺️</span>
                      Log Trip
                    </button>
                  </div>
                </div>

                <div className="dashboard-card recent-expenses">
                  <h3>💰 Recent Expenses</h3>
                  <div className="expense-list">
                    <div className="expense-item">
                      <div className="expense-info">
                        <span className="expense-type">⛽ Fuel</span>
                        <span className="expense-date">Oct 28, 2024</span>
                      </div>
                      <span className="expense-amount">$45.20</span>
                    </div>
                    <div className="expense-item">
                      <div className="expense-info">
                        <span className="expense-type">🔧 Oil Change</span>
                        <span className="expense-date">Oct 15, 2024</span>
                      </div>
                      <span className="expense-amount">$35.00</span>
                    </div>
                    <div className="expense-item">
                      <div className="expense-info">
                        <span className="expense-type">🧹 Car Wash</span>
                        <span className="expense-date">Oct 10, 2024</span>
                      </div>
                      <span className="expense-amount">$15.00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal overlays would go here for AddVehicle and AddExpense forms */}
    </div>
  );
};

export default Dashboard;