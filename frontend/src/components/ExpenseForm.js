import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createExpense, updateExpense } from '../ducks/Expense.duck';
import './ExpenseForm.css';

const ExpenseForm = ({ vehicle, expense, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    vehicle: vehicle?._id,
    expenseType: 'Fuel',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    odometerReading: '',
    totalFuel: '',
    totalCost: '',
    fuelAdded: '',
    serviceDescription: '',
    serviceType: 'Oil Change',
    otherExpenseType: '',
    notes: '',
    location: '',
    paymentMethod: 'Cash'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setFormData({
        vehicle: expense.vehicle?._id,
        expenseType: expense.expenseType || 'Fuel',
        amount: expense.amount || '',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: expense.description || '',
        odometerReading: expense.odometerReading || '',
        totalFuel: expense.totalFuel || '',
        totalCost: expense.totalCost || '',
        fuelAdded: expense.fuelAdded || '',
        serviceDescription: expense.serviceDescription || '',
        serviceType: expense.serviceType || 'Oil Change',
        otherExpenseType: expense.otherExpenseType || '',
        notes: expense.notes || '',
        location: expense.location || '',
        paymentMethod: expense.paymentMethod || 'Cash'
      });
    }
  }, [expense]);

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
      console.log('Submitting expense form:', formData);

      // Validate required fields
      if (!formData.amount || !formData.date || !formData.description) {
        throw new Error('Amount, date, and description are required');
      }

      if (!formData.odometerReading) {
        throw new Error('Odometer reading is required');
      }

      // Type-specific validation
      if (formData.expenseType === 'Fuel') {
        if (!formData.totalFuel || !formData.totalCost || !formData.fuelAdded) {
          throw new Error('Total fuel, total cost, and fuel added are required for fuel expenses');
        }
      }

      if (formData.expenseType === 'Service' && !formData.serviceDescription) {
        throw new Error('Service description is required for service expenses');
      }

      if (formData.expenseType === 'Other' && !formData.otherExpenseType) {
        throw new Error('Other expense type is required');
      }

      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        odometerReading: parseInt(formData.odometerReading),
        totalFuel: formData.totalFuel ? parseFloat(formData.totalFuel) : undefined,
        totalCost: formData.totalCost ? parseFloat(formData.totalCost) : undefined,
        fuelAdded: formData.fuelAdded ? parseFloat(formData.fuelAdded) : undefined
      };

      console.log('Prepared expense data:', expenseData);

      let result;
      if (expense) {
        console.log('Updating expense:', expense._id);
        result = await dispatch(updateExpense(expense._id, expenseData));
      } else {
        console.log('Creating new expense');
        result = await dispatch(createExpense(expenseData));
      }

      console.log('Expense operation result:', result);

      if (onSuccess) {
        console.log('Calling onSuccess callback');
        onSuccess(result);
      }

      onClose();
    } catch (err) {
      console.error('Error in expense form submission:', err);
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-form-overlay">
      <div className="expense-form">
        <div className="expense-form-header">
          <h3>{expense ? 'Edit Expense' : 'Add New Expense'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form-content">
          {error && (
            <div className="error-message">
              <span>❌ {error}</span>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Expense Type *</label>
              <select name="expenseType" value={formData.expenseType} onChange={handleChange} required>
                <option value="Fuel">⛽ Fuel</option>
                <option value="Service">🔧 Service</option>
                <option value="Other">📝 Other</option>
              </select>
            </div>
          </div>

          {formData.expenseType === 'Other' && (
            <div className="form-row">
              <div className="form-group">
                <label>Specify Expense Type *</label>
                <input
                  type="text"
                  name="otherExpenseType"
                  value={formData.otherExpenseType}
                  onChange={handleChange}
                  placeholder="e.g., Parking, Toll, Insurance"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Odometer Reading (kms) *</label>
              <input
                type="number"
                name="odometerReading"
                value={formData.odometerReading}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Digital Wallet">Digital Wallet</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Description *</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the expense"
                required
              />
            </div>
          </div>

          {formData.expenseType === 'Fuel' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Fuel (L) *</label>
                  <input
                    type="number"
                    name="totalFuel"
                    value={formData.totalFuel}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fuel Added (L) *</label>
                  <input
                    type="number"
                    name="fuelAdded"
                    value={formData.fuelAdded}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Cost (₹) *</label>
                  <input
                    type="number"
                    name="totalCost"
                    value={formData.totalCost}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Fuel station location"
                  />
                </div>
              </div>
            </>
          )}

          {formData.expenseType === 'Service' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Service Type *</label>
                  <select name="serviceType" value={formData.serviceType} onChange={handleChange} required>
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

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Service Description *</label>
                  <textarea
                    name="serviceDescription"
                    value={formData.serviceDescription}
                    onChange={handleChange}
                    placeholder="Detailed description of the service performed"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes or comments"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (expense ? 'Update Expense' : 'Add Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;