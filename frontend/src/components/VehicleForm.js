import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addVehicle,
  updateVehicle,
  selectAddingVehicle,
  selectUpdatingVehicle,
  clearError
} from '../ducks/Vehicle.duck';
import './VehicleForm.css';

const VehicleForm = ({ vehicle, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const addingVehicle = useSelector(selectAddingVehicle);
  const updatingVehicle = useSelector(selectUpdatingVehicle);
  const isEditing = Boolean(vehicle);

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

  useEffect(() => {
    if (isEditing && vehicle) {
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
  }, [vehicle, isEditing]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

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
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        await dispatch(updateVehicle({ id: vehicle.id, vehicleData: formData })).unwrap();
      } else {
        await dispatch(addVehicle(formData)).unwrap();
      }

      if (onSuccess) {
        onSuccess(isEditing ? 'Vehicle updated successfully!' : 'Vehicle added successfully!');
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      // Error is handled by Redux state
      console.error('Failed to save vehicle:', error);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const isLoading = addingVehicle || updatingVehicle;

  return (
    <div className="vehicle-form-overlay">
      <div className="vehicle-form">
        <div className="vehicle-form-header">
          <h2>{isEditing ? '✏️ Edit Vehicle' : '➕ Add New Vehicle'}</h2>
          <button
            type="button"
            className="close-btn"
            onClick={handleClose}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form-content">
          <div className="form-group">
            <label htmlFor="vehicleName">
              Vehicle Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="vehicleName"
              name="vehicleName"
              value={formData.vehicleName}
              onChange={handleInputChange}
              placeholder="e.g., My Blue Truck, Family Car"
              className={errors.vehicleName ? 'error' : ''}
              disabled={isLoading}
              maxLength={50}
            />
            {errors.vehicleName && <span className="error-message">{errors.vehicleName}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company">
                Company <span className="required">*</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="e.g., Toyota, Ford, Honda"
                className={errors.company ? 'error' : ''}
                disabled={isLoading}
                maxLength={50}
              />
              {errors.company && <span className="error-message">{errors.company}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="model">
                Model <span className="required">*</span>
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="e.g., Camry, F-150, Civic"
                className={errors.model ? 'error' : ''}
                disabled={isLoading}
                maxLength={50}
              />
              {errors.model && <span className="error-message">{errors.model}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchasedDate">
                Purchase Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="purchasedDate"
                name="purchasedDate"
                value={formData.purchasedDate}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className={errors.purchasedDate ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.purchasedDate && <span className="error-message">{errors.purchasedDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="vehicleCost">
                Vehicle Cost (₹) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="vehicleCost"
                name="vehicleCost"
                value={formData.vehicleCost}
                onChange={handleInputChange}
                placeholder="Vehicle purchase cost in INR"
                className={errors.vehicleCost ? 'error' : ''}
                disabled={isLoading}
                min="0"
                step="0.01"
              />
              {errors.vehicleCost && <span className="error-message">{errors.vehicleCost}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="insuranceExpiry">
                Insurance Expiry Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="insuranceExpiry"
                name="insuranceExpiry"
                value={formData.insuranceExpiry}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={errors.insuranceExpiry ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.insuranceExpiry && <span className="error-message">{errors.insuranceExpiry}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="insuranceNumber">
                Insurance Number
              </label>
              <input
                type="text"
                id="insuranceNumber"
                name="insuranceNumber"
                value={formData.insuranceNumber}
                onChange={handleInputChange}
                placeholder="Insurance policy number (optional)"
                className={errors.insuranceNumber ? 'error' : ''}
                disabled={isLoading}
                maxLength={50}
              />
              {errors.insuranceNumber && <span className="error-message">{errors.insuranceNumber}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emissionTestExpiry">
                Emission Test Expiry Date
              </label>
              <input
                type="date"
                id="emissionTestExpiry"
                name="emissionTestExpiry"
                value={formData.emissionTestExpiry}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={errors.emissionTestExpiry ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.emissionTestExpiry && <span className="error-message">{errors.emissionTestExpiry}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="odometerReading">
                Odometer Reading (kms) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="odometerReading"
                name="odometerReading"
                value={formData.odometerReading}
                onChange={handleInputChange}
                placeholder="Current odometer reading in kilometers"
                className={errors.odometerReading ? 'error' : ''}
                disabled={isLoading}
                min="0"
              />
              {errors.odometerReading && <span className="error-message">{errors.odometerReading}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="vehicleRegistrationNumber">
              Vehicle Registration Number <span className="required">*</span>
            </label>
            <input
              type="text"
              id="vehicleRegistrationNumber"
              name="vehicleRegistrationNumber"
              value={formData.vehicleRegistrationNumber}
              onChange={handleInputChange}
              placeholder="Vehicle registration number"
              className={errors.vehicleRegistrationNumber ? 'error' : ''}
              disabled={isLoading}
              maxLength={20}
            />
            {errors.vehicleRegistrationNumber && <span className="error-message">{errors.vehicleRegistrationNumber}</span>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <span className="btn-icon">{isEditing ? '💾' : '➕'}</span>
                  {isEditing ? 'Update Vehicle' : 'Add Vehicle'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;