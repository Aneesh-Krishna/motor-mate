import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTrips, deleteTrip, clearTripError } from '../ducks/Trip.duck';
import './TripList.css';

const TripList = ({ vehicleId, onEditTrip, onTripSelect }) => {
  const dispatch = useDispatch();
  const { trips, loading, error, pagination } = useSelector(state => state.trips);

  useEffect(() => {
    // Fetch trips when component mounts or vehicleId changes
    const filters = vehicleId ? { vehicle: vehicleId } : {};
    dispatch(getTrips(filters));

    return () => {
      dispatch(clearTripError());
    };
  }, [dispatch, vehicleId]);

  const handleEditClick = (e, trip) => {
    e.stopPropagation();
    if (onEditTrip) {
      onEditTrip(trip);
    }
  };

  const handleDeleteClick = (e, trip) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the trip from "${trip.startLocation}" to "${trip.endLocation}"? This action cannot be undone.`)) {
      dispatch(deleteTrip(trip._id));
    }
  };

  const handleTripClick = (trip) => {
    if (onTripSelect) {
      onTripSelect(trip);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPurpose = (purpose) => {
    const purposeColors = {
      'Business': '#007bff',
      'Personal': '#28a745',
      'Commute': '#ffc107',
      'Leisure': '#17a2b8',
      'Emergency': '#dc3545',
      'Other': '#6c757d'
    };
    return {
      text: purpose,
      color: purposeColors[purpose] || '#6c757d'
    };
  };

  const loadMoreTrips = () => {
    if (pagination.page < pagination.pages) {
      const filters = vehicleId ? { vehicle: vehicleId, page: pagination.page + 1 } : { page: pagination.page + 1 };
      dispatch(getTrips(filters));
    }
  };

  if (loading && trips.length === 0) {
    return (
      <div className="trip-list loading">
        <div className="loading-spinner"></div>
        <p>Loading trips...</p>
      </div>
    );
  }

  if (error && trips.length === 0) {
    return (
      <div className="trip-list error">
        <div className="error-icon">⚠️</div>
        <h3>Unable to load trips</h3>
        <p>{error}</p>
        <button onClick={() => dispatch(getTrips(vehicleId ? { vehicle: vehicleId } : {}))} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="trip-list empty">
        <div className="empty-icon">🗺️</div>
        <h3>No Trips Found</h3>
        <p>Start tracking your journeys by adding your first trip.</p>
      </div>
    );
  }

  return (
    <div className="trip-list">
      <div className="trip-list-header">
        <h2>Recent Trips</h2>
        <span className="trip-count">{trips.length} trips</span>
      </div>

      <div className="trips-container">
        {trips.map((trip) => {
          const purpose = formatPurpose(trip.purpose);
          return (
            <div
              key={trip._id}
              className="trip-card"
              onClick={() => handleTripClick(trip)}
            >
              <div className="trip-card-header">
                <div className="trip-route">
                  <div className="trip-locations">
                    <span className="trip-start">{trip.startLocation}</span>
                    <div className="trip-arrow">→</div>
                    <span className="trip-end">{trip.endLocation}</span>
                  </div>
                  <div className="trip-date">{formatDate(trip.date)}</div>
                </div>
                <div className="trip-purpose" style={{ backgroundColor: purpose.color }}>
                  {purpose.text}
                </div>
              </div>

              <div className="trip-card-body">
                <div className="trip-details">
                  <div className="trip-detail">
                    <span className="detail-label">Distance:</span>
                    <span className="detail-value">{trip.distance} km</span>
                  </div>
                  <div className="trip-detail">
                    <span className="detail-label">Cost:</span>
                    <span className="detail-value">₹{trip.totalCost.toFixed(2)}</span>
                  </div>
                  {(trip.startOdometer || trip.endOdometer) && (
                    <div className="trip-detail">
                      <span className="detail-label">Odometer:</span>
                      <span className="detail-value">
                        {trip.startOdometer && trip.endOdometer
                          ? `${trip.startOdometer} → ${trip.endOdometer}`
                          : trip.endOdometer || trip.startOdometer
                        } km
                      </span>
                    </div>
                  )}
                </div>

                {trip.notes && (
                  <div className="trip-notes">
                    <span className="notes-label">Notes:</span>
                    <p className="notes-text">{trip.notes}</p>
                  </div>
                )}

                {trip.vehicle && (
                  <div className="trip-vehicle">
                    <span className="vehicle-label">Vehicle:</span>
                    <span className="vehicle-name">
                      {trip.vehicle.vehicleName} ({trip.vehicle.company} {trip.vehicle.model})
                    </span>
                  </div>
                )}
              </div>

              <div className="trip-card-actions">
                <button
                  onClick={(e) => handleEditClick(e, trip)}
                  className="btn btn-secondary btn-sm"
                  title="Edit trip"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, trip)}
                  className="btn btn-danger btn-sm"
                  title="Delete trip"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {pagination.page < pagination.pages && (
        <div className="load-more-container">
          <button
            onClick={loadMoreTrips}
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="pagination-info">
          Showing {trips.length} of {pagination.total} trips
        </div>
      )}
    </div>
  );
};

export default TripList;