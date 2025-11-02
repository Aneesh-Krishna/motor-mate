import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchVehicles,
  deleteVehicle,
  selectVehicles,
  selectSelectedVehicle,
  selectVehiclesLoading,
  selectDeletingVehicle
} from '../ducks/Vehicle.duck';
import VehicleList from '../components/VehicleList';
import VehicleDetails from '../components/VehicleDetails';
import VehicleForm from '../components/VehicleForm';
import './Garage.css';

const Garage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const vehicles = useSelector(selectVehicles);
  const selectedVehicle = useSelector(selectSelectedVehicle);
  const loading = useSelector(selectVehiclesLoading);
  const deletingVehicle = useSelector(selectDeletingVehicle);

  // Local state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [toast, setToast] = useState(null);

  // Load vehicles on component mount
  React.useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const handleVehicleSelect = (vehicle) => {
    // Vehicle selection is handled by Redux in VehicleList component
    console.log('Vehicle selected:', vehicle);
  };

  const handleAddVehicle = () => {
    setShowAddForm(true);
    setEditingVehicle(null);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowAddForm(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await dispatch(deleteVehicle(vehicleId)).unwrap();
      showToast('Vehicle deleted successfully!', 'success');
    } catch (error) {
      showToast('Failed to delete vehicle', 'error');
    }
  };

  const handleFormClose = () => {
    setShowAddForm(false);
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

    // Navigate to appropriate pages or open modals based on action
    switch (actionType) {
      case 'fuel':
        navigate('/dashboard', { state: { action: 'add-fuel', vehicle: selectedVehicle } });
        break;
      case 'service':
        navigate('/dashboard', { state: { action: 'add-service', vehicle: selectedVehicle } });
        break;
      case 'expense':
        navigate('/dashboard', { state: { action: 'add-expense', vehicle: selectedVehicle } });
        break;
      case 'trip':
        navigate('/dashboard', { state: { action: 'add-trip', vehicle: selectedVehicle } });
        break;
      default:
        showToast('Feature coming soon!', 'info');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="garage loading">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>Loading Your Garage</h2>
          <p>Fetching your vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="garage">
      <div className="garage-header">
        <div className="garage-header-content">
          <div>
            <h1>🚗 My Garage</h1>
            <p>Manage your vehicles and track their information</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAddVehicle}
          >
            <span className="btn-icon">➕</span>
            Add Vehicle
          </button>
        </div>
      </div>

      <div className="garage-content">
        {vehicles.length === 0 ? (
          <div className="empty-garage">
            <div className="empty-icon">🚗</div>
            <h2>Your Garage is Empty</h2>
            <p>Start tracking your vehicle expenses by adding your first vehicle to your garage.</p>
            <button
              className="btn btn-primary btn-large"
              onClick={handleAddVehicle}
            >
              <span className="btn-icon">➕</span>
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="garage-layout">
            <div className="garage-sidebar">
              <VehicleList
                onVehicleSelect={handleVehicleSelect}
                onEditVehicle={handleEditVehicle}
                onDeleteVehicle={handleDeleteVehicle}
              />
            </div>

            <div className="garage-main">
              <VehicleDetails
                onEdit={handleEditVehicle}
                onDelete={handleDeleteVehicle}
                onQuickAction={handleQuickAction}
              />
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Form Modal */}
      {showAddForm && (
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

export default Garage;