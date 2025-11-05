import React from 'react';
import { useSelector } from 'react-redux';
import { selectSelectedVehicle } from '../ducks/Vehicle.duck';
import './VehicleDetails.css';

const VehicleDetails = ({ onEdit, onDelete, onQuickAction }) => {
  const vehicle = useSelector(selectSelectedVehicle);

  if (!vehicle) {
    return (
      <div className="vehicle-details empty">
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <h3>No Vehicle Selected</h3>
          <p>Select a vehicle from your garage to view its details and manage its information.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(vehicle);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete && window.confirm(`Are you sure you want to delete "${vehicle.vehicleName}"? This action cannot be undone and will remove all associated expenses and service history.`)) {
      onDelete(vehicle._id);
    }
  };

  return (
    <div className="vehicle-details">
      <div className="vehicle-details-header">
        <div className="vehicle-header-info">
          <h2>{vehicle.vehicleName}</h2>
          <p className="vehicle-subtitle">{vehicle.company} {vehicle.model}</p>
        </div>
        <div className="vehicle-header-actions">
          <button
            className="btn btn-primary"
            onClick={handleEditClick}
          >
            <span className="btn-icon">✏️</span>
            Edit Vehicle
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDeleteClick}
          >
            <span className="btn-icon">🗑️</span>
            Delete
          </button>
        </div>
      </div>

      <div className="vehicle-details-content">
        <div className="detail-section">
          <h3>📊 Vehicle Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Company</span>
              <span className="detail-value">{vehicle.company}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Model</span>
              <span className="detail-value">{vehicle.model}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Purchased Date</span>
              <span className="detail-value">{formatDate(vehicle.purchasedDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Vehicle Cost</span>
              <span className="detail-value">₹{vehicle.vehicleCost?.toLocaleString('en-IN') || 0}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Insurance Expiry</span>
              <span className="detail-value">{formatDate(vehicle.insuranceExpiry)}</span>
            </div>
            {vehicle.insuranceNumber && (
              <div className="detail-item">
                <span className="detail-label">Insurance Number</span>
                <span className="detail-value">{vehicle.insuranceNumber}</span>
              </div>
            )}
            {vehicle.emissionTestExpiry && (
              <div className="detail-item">
                <span className="detail-label">Emission Test Expiry</span>
                <span className="detail-value">{formatDate(vehicle.emissionTestExpiry)}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Odometer Reading</span>
              <span className="detail-value odometer">{vehicle.odometerReading?.toLocaleString() || 0} kms</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Registration Number</span>
              <span className="detail-value">{vehicle.vehicleRegistrationNumber}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>📅 Timeline</h3>
          <div className="timeline-items">
            <div className="timeline-item">
              <div className="timeline-icon">➕</div>
              <div className="timeline-content">
                <span className="timeline-title">Vehicle Added</span>
                <span className="timeline-date">{formatDate(vehicle.createdAt)}</span>
              </div>
            </div>
            {vehicle.updatedAt && vehicle.updatedAt !== vehicle.createdAt && (
              <div className="timeline-item">
                <div className="timeline-icon">✏️</div>
                <div className="timeline-content">
                  <span className="timeline-title">Last Updated</span>
                  <span className="timeline-date">{formatDate(vehicle.updatedAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3>🚀 Quick Actions</h3>
          <div className="quick-actions">
            <div className="quick-action-card" onClick={() => onQuickAction && onQuickAction('fuel')}>
              <div className="action-icon">⛽</div>
              <div className="action-content">
                <h4>Log Fuel</h4>
                <p>Add a fuel purchase record</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
            <div className="quick-action-card" onClick={() => onQuickAction && onQuickAction('service')}>
              <div className="action-icon">🔧</div>
              <div className="action-content">
                <h4>Log Service</h4>
                <p>Record maintenance work</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
            <div className="quick-action-card" onClick={() => onQuickAction && onQuickAction('expense')}>
              <div className="action-icon">📝</div>
              <div className="action-content">
                <h4>Log Expense</h4>
                <p>Add other vehicle costs</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
            <div className="quick-action-card" onClick={() => onQuickAction && onQuickAction('trip')}>
              <div className="action-icon">🗺️</div>
              <div className="action-content">
                <h4>Log Trip</h4>
                <p>Record a completed trip</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;