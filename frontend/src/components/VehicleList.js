import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchVehicles,
  selectVehicles,
  selectSelectedVehicleId,
  selectVehiclesLoading,
  selectVehiclesError,
  selectVehicleById,
  selectVehiclesCount,
  selectVehicle as selectVehicleAction
} from '../ducks/Vehicle.duck';
import './VehicleList.css';

const VehicleList = ({ onVehicleSelect, onEditVehicle, onDeleteVehicle }) => {
  const dispatch = useDispatch();
  const vehicles = useSelector(selectVehicles);
  const selectedVehicleId = useSelector(selectSelectedVehicleId);
  const loading = useSelector(selectVehiclesLoading);
  const error = useSelector(selectVehiclesError);
  const vehiclesCount = useSelector(selectVehiclesCount);



  const handleVehicleSelect = (vehicleId) => {
    dispatch(selectVehicleAction(vehicleId));
    if (onVehicleSelect) {
      const vehicle = vehicles.find(v => v._id === vehicleId);
      onVehicleSelect(vehicle);
    }
  };

  const handleEditClick = (e, vehicle) => {
    e.stopPropagation();
    if (onEditVehicle) {
      onEditVehicle(vehicle);
    }
  };

  const handleDeleteClick = (e, vehicle) => {
    e.stopPropagation();
    if (onDeleteVehicle) {
      if (window.confirm(`Are you sure you want to delete "${vehicle.vehicleName}"? This action cannot be undone.`)) {
        onDeleteVehicle(vehicle._id);
      }
    }
  };

  if (loading) {
    return (
      <div className="vehicle-list loading">
        <div className="loading-spinner"></div>
        <p>Loading your garage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicle-list error">
        <div className="error-icon">⚠️</div>
        <h3>Unable to load vehicles</h3>
        <p>{error}</p>
        <button onClick={() => dispatch(fetchVehicles())} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (vehiclesCount === 0) {
    return (
      <div className="vehicle-list empty">
        <div className="empty-icon">🚗</div>
        <h3>Your Garage is Empty</h3>
        <p>Add your first vehicle to start tracking expenses and service history.</p>
      </div>
    );
  }

  return (
    <div className="vehicle-list">
      <div className="vehicle-list-header">
        <h2>My Garage ({vehiclesCount})</h2>
      </div>

      <div className="vehicles-grid">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle._id}
            className={`vehicle-card ${selectedVehicleId === vehicle._id ? 'selected' : ''}`}
            onClick={() => handleVehicleSelect(vehicle._id)}
          >
            <div className="vehicle-card-header">
              <div className="vehicle-info">
                <h3 className="vehicle-nickname">{vehicle.vehicleName}</h3>
                <p className="vehicle-details">{vehicle.company} {vehicle.model}</p>
              </div>
              <div className="vehicle-status">
                {selectedVehicleId === vehicle._id && (
                  <span className="selected-badge">✓ Active</span>
                )}
              </div>
            </div>

            <div className="vehicle-stats">
              <div className="vehicle-stat">
                <span className="stat-icon">📊</span>
                <div className="stat-info">
                  <span className="stat-label">Odometer</span>
                  <span className="stat-value">{vehicle.odometerReading?.toLocaleString() || 0} kms</span>
                </div>
              </div>
            </div>

            <div className="vehicle-meta">
              <span className="vehicle-added">
                Added {new Date(vehicle.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="vehicle-actions">
              <button
                className="btn-icon edit-btn"
                onClick={(e) => handleEditClick(e, vehicle)}
                title="Edit vehicle"
              >
                ✏️
              </button>
              <button
                className="btn-icon delete-btn"
                onClick={(e) => handleDeleteClick(e, vehicle)}
                title="Delete vehicle"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleList;