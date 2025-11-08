import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createTrip, updateTrip } from '../ducks/Trip.duck';
import './AddTripForm.css';

const AddTripForm = ({ vehicle, trip, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    vehicle: vehicle?._id,
    date: new Date().toISOString().split('T')[0],
    startLocation: '',
    endLocation: '',
    distance: '',
    totalCost: '',
    notes: '',
    startOdometer: '',
    endOdometer: '',
    purpose: 'Personal'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip) {
      setFormData({
        vehicle: trip.vehicle?._id || vehicle?._id,
        date: trip.date ? new Date(trip.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        startLocation: trip.startLocation || '',
        endLocation: trip.endLocation || '',
        distance: trip.distance || '',
        totalCost: trip.totalCost || '',
        notes: trip.notes || '',
        startOdometer: trip.startOdometer || '',
        endOdometer: trip.endOdometer || '',
        purpose: trip.purpose || 'Personal'
      });
    }
  }, [trip, vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting trip form:', formData);

      // Validate required fields
      if (!formData.date || !formData.startLocation || !formData.endLocation || !formData.distance || !formData.totalCost) {
        throw new Error('Date, start location, end location, distance, and total cost are required');
      }

      // Validate distance and cost are positive
      if (parseFloat(formData.distance) <= 0) {
        throw new Error('Distance must be greater than 0');
      }

      if (parseFloat(formData.totalCost) <= 0) {
        throw new Error('Total cost must be greater than 0');
      }

      // Validate odometer readings if provided
      if (formData.startOdometer && formData.endOdometer) {
        if (parseFloat(formData.endOdometer) <= parseFloat(formData.startOdometer)) {
          throw new Error('End odometer reading must be greater than start odometer reading');
        }
      }

      const tripData = {
        ...formData,
        distance: parseFloat(formData.distance),
        totalCost: parseFloat(formData.totalCost),
        startOdometer: formData.startOdometer ? parseFloat(formData.startOdometer) : undefined,
        endOdometer: formData.endOdometer ? parseFloat(formData.endOdometer) : undefined,
        date: new Date(formData.date).toISOString()
      };

      console.log('Prepared trip data:', tripData);

      if (trip) {
        // Update existing trip
        await dispatch(updateTrip(trip._id, tripData));
        console.log('Trip updated successfully');
      } else {
        // Create new trip
        await dispatch(createTrip(tripData));
        console.log('Trip created successfully');
      }

      // Reset form on success
      setFormData({
        vehicle: vehicle?._id,
        date: new Date().toISOString().split('T')[0],
        startLocation: '',
        endLocation: '',
        distance: '',
        totalCost: '',
        notes: '',
        startOdometer: '',
        endOdometer: '',
        purpose: 'Personal'
      });

      if (onSuccess) {
        onSuccess();
      }

      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error('Error submitting trip form:', error);
      setError(error.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="trip-form-container">
      <div className="trip-form-header">
        <h2>{trip ? 'Edit Trip' : 'Add New Trip'}</h2>
        <button className="close-button" onClick={handleCancel}>×</button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="trip-form">
        <div className="form-grid">
          {/* Vehicle Selection (if no vehicle provided) */}
          {!vehicle && (
            <div className="form-group">
              <label htmlFor="vehicle" className="form-label">Vehicle *</label>
              <select
                id="vehicle"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Vehicle</option>
                {/* This would need to be populated with user's vehicles */}
              </select>
            </div>
          )}

          {/* Date */}
          <div className="form-group">
            <label htmlFor="date" className="form-label">Trip Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-control"
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Start Location */}
          <div className="form-group">
            <label htmlFor="startLocation" className="form-label">Start Location *</label>
            <input
              type="text"
              id="startLocation"
              name="startLocation"
              value={formData.startLocation}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., Home, Office, City Center"
              maxLength="200"
              required
            />
          </div>

          {/* End Location */}
          <div className="form-group">
            <label htmlFor="endLocation" className="form-label">End Location *</label>
            <input
              type="text"
              id="endLocation"
              name="endLocation"
              value={formData.endLocation}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., Airport, Mall, Client Office"
              maxLength="200"
              required
            />
          </div>

          {/* Distance */}
          <div className="form-group">
            <label htmlFor="distance" className="form-label">Distance (km) *</label>
            <input
              type="number"
              id="distance"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., 25.5"
              step="0.1"
              min="0"
              required
            />
          </div>

          {/* Total Cost */}
          <div className="form-group">
            <label htmlFor="totalCost" className="form-label">Total Cost (₹) *</label>
            <input
              type="number"
              id="totalCost"
              name="totalCost"
              value={formData.totalCost}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., 150.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Start Odometer */}
          <div className="form-group">
            <label htmlFor="startOdometer" className="form-label">Start Odometer (km)</label>
            <input
              type="number"
              id="startOdometer"
              name="startOdometer"
              value={formData.startOdometer}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., 15000"
              step="1"
              min="0"
            />
          </div>

          {/* End Odometer */}
          <div className="form-group">
            <label htmlFor="endOdometer" className="form-label">End Odometer (km)</label>
            <input
              type="number"
              id="endOdometer"
              name="endOdometer"
              value={formData.endOdometer}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., 15050"
              step="1"
              min="0"
            />
          </div>

          {/* Purpose */}
          <div className="form-group">
            <label htmlFor="purpose" className="form-label">Trip Purpose</label>
            <select
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="form-control"
            >
              <option value="Personal">Personal</option>
              <option value="Business">Business</option>
              <option value="Commute">Commute</option>
              <option value="Leisure">Leisure</option>
              <option value="Emergency">Emergency</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Notes */}
          <div className="form-group full-width">
            <label htmlFor="notes" className="form-label">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-control"
              placeholder="Any additional notes about the trip..."
              rows="4"
              maxLength="1000"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (trip ? 'Update Trip' : 'Add Trip')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTripForm;