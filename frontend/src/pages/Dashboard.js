import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser as selectAuthUser, logout } from '../ducks/Login.duck';
import {
  fetchVehicles,
  selectVehicles,
  selectSelectedVehicle,
  selectVehiclesLoading,
  selectDeletingVehicle,
  deleteVehicle
} from '../ducks/Vehicle.duck';
import { fetchExpenses, fetchMileageStats } from '../ducks/Expense.duck';
import VehicleList from '../components/VehicleList';
import VehicleDetails from '../components/VehicleDetails';
import VehicleForm from '../components/VehicleForm';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);

  // Vehicle Management State
  const vehicles = useSelector(selectVehicles);
  const selectedVehicle = useSelector(selectSelectedVehicle);
  const vehiclesLoading = useSelector(selectVehiclesLoading);
  const deletingVehicle = useSelector(selectDeletingVehicle);

  // Local State
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [toast, setToast] = useState(null);

  // Load vehicles on component mount only
  useEffect(() => {
    // Load vehicles from Redux only once when component mounts
    dispatch(fetchVehicles());
  }, []);

  // Vehicle Management Functions
  const handleVehicleSelect = (vehicle) => {
    // Vehicle selection is handled by Redux in VehicleList component
    console.log('Vehicle selected:', vehicle);
  };

  const handleAddVehicle = () => {
    setShowAddVehicle(true);
    setEditingVehicle(null);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowAddVehicle(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await dispatch(deleteVehicle(vehicleId)).unwrap();
      showToast('Vehicle deleted successfully!', 'success');
      dispatch(fetchVehicles()); // Refresh the vehicle list
    } catch (error) {
      showToast('Failed to delete vehicle', 'error');
    }
  };

  const handleFormClose = () => {
    setShowAddVehicle(false);
    setEditingVehicle(null);
  };

  const handleFormSuccess = (message) => {
    showToast(message, 'success');
    dispatch(fetchVehicles()); // Refresh the vehicle list
  };

  const handleQuickAction = (actionType) => {
    if (!selectedVehicle) {
      showToast('Please select a vehicle first', 'warning');
      return;
    }

    // Handle different action types
    switch (actionType) {
      case 'fuel':
        console.log('Fuel logging clicked for vehicle:', selectedVehicle);
        showToast('Fuel logging feature coming soon!', 'info');
        break;
      case 'service':
        console.log('Service logging clicked for vehicle:', selectedVehicle);
        showToast('Service logging feature coming soon!', 'info');
        break;
      case 'expense':
        console.log('Expense logging clicked for vehicle:', selectedVehicle);
        showToast('Expense logging feature coming soon!', 'info');
        break;
      case 'trip':
        console.log('Trip logging clicked for vehicle:', selectedVehicle);
        showToast('Trip logging feature coming soon!', 'info');
        break;
      default:
        showToast('Feature coming soon!', 'info');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshExpenseData = () => {
    if (selectedVehicle) {
      dispatch(fetchExpenses({ vehicleId: selectedVehicle._id, limit: 10 }));
      dispatch(fetchMileageStats(selectedVehicle._id));
    }
  };

  const currentVehicle = selectedVehicle;

  const handleLogout = () => {
    // Show confirmation dialog before logging out
    if (window.confirm('Are you sure you want to log out? Your vehicle data will be saved for your next visit.')) {
      dispatch(logout());
      console.log('You have been successfully logged out of MotorMate.');
    }
  };

  // Get today's date for dynamic greeting
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (vehiclesLoading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>Loading Your Dashboard</h2>
          <p>Fetching your vehicle data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="animate-in">🚗 My Garage</h1>
            <div className="user-welcome">
              <p className="animate-in" style={{ animationDelay: '0.1s' }}>
                {getCurrentGreeting()}, {user?.name || user?.email?.split('@')[0] || 'Motorist'}!
              </p>
              {user?.email?.includes('gmail.com') && (
                <span className="auth-badge animate-in" style={{ animationDelay: '0.2s' }}>
                  🔐 Signed in with Google
                </span>
              )}
            </div>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary animate-in"
              onClick={handleAddVehicle}
              style={{ animationDelay: '0.3s' }}
            >
              <span className="btn-icon">➕</span>
              Add Vehicle
            </button>
            <button
              className="btn btn-logout animate-in"
              onClick={handleLogout}
              style={{ animationDelay: '0.4s' }}
            >
              <span className="btn-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon animate-bounce">🚗</div>
            <h2>No Vehicles Yet</h2>
            <p>Add your first vehicle to start tracking expenses and service history.</p>
            <button
              className="btn btn-primary"
              onClick={handleAddVehicle}
            >
              <span className="btn-icon">➕</span>
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="dashboard-layout">
            {/* Vehicle List Sidebar */}
            <div className="dashboard-sidebar">
              <VehicleList
                onVehicleSelect={handleVehicleSelect}
                onEditVehicle={handleEditVehicle}
                onDeleteVehicle={handleDeleteVehicle}
              />
            </div>

            {/* Main Content Area */}
            <div className="dashboard-main">
              {currentVehicle ? (
                <VehicleDetails
                  onEdit={handleEditVehicle}
                  onDelete={handleDeleteVehicle}
                  onQuickAction={handleQuickAction}
                  onRefreshExpenseData={refreshExpenseData}
                />
              ) : (
                <div className="empty-vehicle-selection">
                  <div className="empty-icon">🚗</div>
                  <h3>Select a Vehicle</h3>
                  <p>Choose a vehicle from your garage to view its details and manage its information.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Form Modal */}
      {showAddVehicle && (
        <VehicleForm
          vehicle={editingVehicle}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type} show`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'warning' && '⚠️'}
            {toast.type === 'info' && 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      {/* Loading overlay for delete operations */}
      {deletingVehicle && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Deleting vehicle...</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;