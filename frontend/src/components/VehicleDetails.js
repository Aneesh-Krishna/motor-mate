import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedVehicle } from '../ducks/Vehicle.duck';
import { selectExpenses, selectMileageStats, selectExpensesLoading } from '../ducks/Expense.duck';
import { fetchExpenses, fetchMileageStats } from '../ducks/Expense.duck';
import { getRecentTrips } from '../ducks/Trip.duck';
import ExpenseForm from './ExpenseForm';
import AddTripForm from './AddTripForm';
import TripList from './TripList';
import './VehicleDetails.css';

const VehicleDetails = ({ onEdit, onDelete, onQuickAction, onRefreshExpenseData }) => {
  const vehicle = useSelector(selectSelectedVehicle);
  const expenses = useSelector(selectExpenses);
  const mileageStats = useSelector(selectMileageStats);
  const expensesLoading = useSelector(selectExpensesLoading);
  const { recentTrips, loading: tripsLoading } = useSelector(state => state.trips);
  const dispatch = useDispatch();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseFormType, setExpenseFormType] = useState(null);
  const [showTripForm, setShowTripForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'trips'

  // Fetch expenses and trips when vehicle changes
  useEffect(() => {
    if (vehicle) {
      dispatch(fetchExpenses({ vehicleId: vehicle._id, limit: 10 }));
      dispatch(fetchMileageStats(vehicle._id));
      dispatch(getRecentTrips(vehicle._id, 5));
    }
  }, [vehicle, dispatch]);

  // Calculate total expenses and breakdown from frontend data
  const calculateExpensesSummary = (expensesData) => {
    if (!expensesData || expensesData.length === 0) {
      return {
        totalExpenses: 0,
        expenseBreakdown: []
      };
    }

    const summary = expensesData.reduce((acc, expense) => {
      const amount = expense.amount || 0;
      const type = expense.expenseType || 'Other';

      // Add to total
      acc.totalExpenses += amount;

      // Add to type breakdown
      if (!acc.expenseBreakdown[type]) {
        acc.expenseBreakdown[type] = {
          type,
          total: 0,
          count: 0,
          average: 0
        };
      }

      acc.expenseBreakdown[type].total += amount;
      acc.expenseBreakdown[type].count += 1;
      acc.expenseBreakdown[type].average = acc.expenseBreakdown[type].total / acc.expenseBreakdown[type].count;

      return acc;
    }, {
      totalExpenses: 0,
      expenseBreakdown: {}
    });

    // Convert expenseBreakdown object to array
    summary.expenseBreakdown = Object.values(summary.expenseBreakdown);

    return summary;
  };

  const frontendCalculatedStats = calculateExpensesSummary(expenses);

  // Use backend stats if available, otherwise use frontend calculated stats
  const displayStats = mileageStats || frontendCalculatedStats;
  const totalExpenses = displayStats.totalExpenses || 0;
  const expenseBreakdown = displayStats.expenseBreakdown || [];

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

  const handleExpenseFormOpen = (type) => {
    setExpenseFormType(type);
    setShowExpenseForm(true);
  };

  const handleExpenseFormClose = () => {
    setShowExpenseForm(false);
    setExpenseFormType(null);
  };

  const handleExpenseFormSuccess = () => {
    console.log('Expense form success callback triggered');
    // Refresh expense data after successful create/update
    if (vehicle) {
      console.log('Refreshing expenses for vehicle:', vehicle._id);
      dispatch(fetchExpenses({ vehicleId: vehicle._id, limit: 10 }));
      dispatch(fetchMileageStats(vehicle._id));
    }
    // Also call the parent refresh function if available
    if (onRefreshExpenseData) {
      console.log('Calling parent refresh function');
      onRefreshExpenseData();
    }
  };

  const handleTripFormOpen = () => {
    setEditingTrip(null);
    setShowTripForm(true);
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setShowTripForm(true);
  };

  const handleTripFormClose = () => {
    setShowTripForm(false);
    setEditingTrip(null);
  };

  const handleTripFormSuccess = () => {
    console.log('Trip form success callback triggered');
    // Refresh trip data after successful create/update
    if (vehicle) {
      console.log('Refreshing trips for vehicle:', vehicle._id);
      dispatch(getRecentTrips(vehicle._id, 5));
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

        {/* Expenses Section */}
        <div className="detail-section">
          <h3>⛽ Recent Expenses</h3>

          
          {/* Total Expenses Summary */}
          <div className="total-expenses-summary">
            <div className="total-label">Total Expenses</div>
            <div className="total-amount">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          {/* Expense Breakdown */}
          {expenseBreakdown && expenseBreakdown.length > 0 && (
            <div className="expense-breakdown">
              <h4>Expense Breakdown</h4>
              <div className="breakdown-items">
                {expenseBreakdown.map((item, index) => (
                  <div key={index} className="breakdown-item">
                    <div className="breakdown-type">
                      <span className="type-icon">
                        {item.type === 'Fuel' && '⛽'}
                        {item.type === 'Service' && '🔧'}
                        {item.type === 'Other' && '📝'}
                      </span>
                      {item.type}
                    </div>
                    <div className="breakdown-details">
                      <div className="breakdown-amount">₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="breakdown-count">{item.count} transaction{item.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expensesLoading ? (
            <div className="loading-small">Loading expenses...</div>
          ) : expenses && expenses.length > 0 ? (
            <div className="recent-expenses">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense._id} className="expense-item">
                  <div className="expense-type">{expense.expenseType}</div>
                  <div className="expense-amount">₹{expense.amount?.toFixed(2)}</div>
                  <div className="expense-date">{new Date(expense.date).toLocaleDateString()}</div>
                  {expense.expenseType === 'Fuel' && expense.mileage && (
                    <div className="expense-mileage">{expense.mileage.toFixed(2)} km/l</div>
                  )}
                  {expense.expenseType === 'Fuel' && expense.odometerReading && (
                    <div className="expense-odometer">{expense.odometerReading.toLocaleString()} km</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-expenses">No expenses recorded yet</div>
          )}
        </div>

        {/* Trips Section */}
        <div className="detail-section">
          <div className="section-header">
            <h3>🗺️ Recent Trips</h3>
            <div className="section-tabs">
              <button
                className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
                onClick={() => setActiveTab('expenses')}
              >
                Expenses
              </button>
              <button
                className={`tab-btn ${activeTab === 'trips' ? 'active' : ''}`}
                onClick={() => setActiveTab('trips')}
              >
                Trips
              </button>
            </div>
          </div>

          {activeTab === 'trips' && (
            <>
              <div className="trip-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleTripFormOpen}
                >
                  <span className="btn-icon">➕</span>
                  Add Trip
                </button>
              </div>

              {tripsLoading ? (
                <div className="loading-small">Loading trips...</div>
              ) : recentTrips && recentTrips.length > 0 ? (
                <div className="recent-trips">
                  {recentTrips.map((trip) => (
                    <div key={trip._id} className="trip-item">
                      <div className="trip-route">
                        <span className="trip-start">{trip.startLocation}</span>
                        <span className="trip-arrow">→</span>
                        <span className="trip-end">{trip.endLocation}</span>
                      </div>
                      <div className="trip-details">
                        <div className="trip-distance">{trip.distance} km</div>
                        <div className="trip-cost">₹{trip.totalCost?.toFixed(2)}</div>
                        <div className="trip-date">{new Date(trip.date).toLocaleDateString()}</div>
                      </div>
                      <div className="trip-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditTrip(trip)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-trips">
                  <div className="no-trips-icon">🗺️</div>
                  <p>No trips recorded yet</p>
                  <button
                    className="btn btn-primary"
                    onClick={handleTripFormOpen}
                  >
                    Add Your First Trip
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mileage Stats Section */}
        {mileageStats && (
          <div className="detail-section">
            <h3>📊 Mileage Statistics</h3>
            <div className="mileage-stats">
              <div className="stat-item">
                <div className="stat-label">Average Mileage</div>
                <div className="stat-value">{mileageStats.averageMileage} km/l</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Best Mileage</div>
                <div className="stat-value">{mileageStats.bestMileage} km/l</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Total Distance</div>
                <div className="stat-value">{mileageStats.totalDistance?.toLocaleString()} km</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Data Points</div>
                <div className="stat-value">{mileageStats.dataPoints}</div>
              </div>
            </div>
          </div>
        )}

        <div className="detail-section">
          <h3>🚀 Quick Actions</h3>
          <div className="quick-actions">
            <div className="quick-action-card" onClick={() => handleExpenseFormOpen('Fuel')}>
              <div className="action-icon">⛽</div>
              <div className="action-content">
                <h4>Log Fuel</h4>
                <p>Add a fuel purchase record</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
            <div className="quick-action-card" onClick={() => handleExpenseFormOpen('Service')}>
              <div className="action-icon">🔧</div>
              <div className="action-content">
                <h4>Log Service</h4>
                <p>Record maintenance work</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
            <div className="quick-action-card" onClick={() => handleExpenseFormOpen('Other')}>
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

        {/* Expense Form Modal */}
        {showExpenseForm && (
          <ExpenseForm
            vehicle={vehicle}
            expense={{ expenseType: expenseFormType }}
            onClose={handleExpenseFormClose}
            onSuccess={handleExpenseFormSuccess}
          />
        )}

        {/* Trip Form Modal */}
        {showTripForm && (
          <AddTripForm
            vehicle={vehicle}
            trip={editingTrip}
            onClose={handleTripFormClose}
            onSuccess={handleTripFormSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default VehicleDetails;