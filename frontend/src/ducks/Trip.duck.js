import { tripsAPI } from '../services/api';

// Action Types
const GET_TRIPS_REQUEST = 'trips/GET_TRIPS_REQUEST';
const GET_TRIPS_SUCCESS = 'trips/GET_TRIPS_SUCCESS';
const GET_TRIPS_FAILURE = 'trips/GET_TRIPS_FAILURE';

const CREATE_TRIP_REQUEST = 'trips/CREATE_TRIP_REQUEST';
const CREATE_TRIP_SUCCESS = 'trips/CREATE_TRIP_SUCCESS';
const CREATE_TRIP_FAILURE = 'trips/CREATE_TRIP_FAILURE';

const UPDATE_TRIP_REQUEST = 'trips/UPDATE_TRIP_REQUEST';
const UPDATE_TRIP_SUCCESS = 'trips/UPDATE_TRIP_SUCCESS';
const UPDATE_TRIP_FAILURE = 'trips/UPDATE_TRIP_FAILURE';

const DELETE_TRIP_REQUEST = 'trips/DELETE_TRIP_REQUEST';
const DELETE_TRIP_SUCCESS = 'trips/DELETE_TRIP_SUCCESS';
const DELETE_TRIP_FAILURE = 'trips/DELETE_TRIP_FAILURE';

const GET_TRIP_STATS_REQUEST = 'trips/GET_TRIP_STATS_REQUEST';
const GET_TRIP_STATS_SUCCESS = 'trips/GET_TRIP_STATS_SUCCESS';
const GET_TRIP_STATS_FAILURE = 'trips/GET_TRIP_STATS_FAILURE';

const GET_RECENT_TRIPS_REQUEST = 'trips/GET_RECENT_TRIPS_REQUEST';
const GET_RECENT_TRIPS_SUCCESS = 'trips/GET_RECENT_TRIPS_SUCCESS';
const GET_RECENT_TRIPS_FAILURE = 'trips/GET_RECENT_TRIPS_FAILURE';

const CLEAR_TRIP_ERROR = 'trips/CLEAR_TRIP_ERROR';

// Initial State
const initialState = {
  trips: [],
  recentTrips: [],
  tripStats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  }
};

// Reducer
export default function tripReducer(state = initialState, action) {
  switch (action.type) {
    case GET_TRIPS_REQUEST:
    case CREATE_TRIP_REQUEST:
    case UPDATE_TRIP_REQUEST:
    case DELETE_TRIP_REQUEST:
    case GET_TRIP_STATS_REQUEST:
    case GET_RECENT_TRIPS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_TRIPS_SUCCESS:
      return {
        ...state,
        loading: false,
        trips: action.payload.data,
        pagination: {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          pages: action.payload.pages
        }
      };

    case CREATE_TRIP_SUCCESS:
      return {
        ...state,
        loading: false,
        trips: [action.payload.data, ...state.trips]
      };

    case UPDATE_TRIP_SUCCESS:
      return {
        ...state,
        loading: false,
        trips: state.trips.map(trip =>
          trip._id === action.payload.data._id ? action.payload.data : trip
        )
      };

    case DELETE_TRIP_SUCCESS:
      return {
        ...state,
        loading: false,
        trips: state.trips.filter(trip => trip._id !== action.payload.tripId)
      };

    case GET_TRIP_STATS_SUCCESS:
      return {
        ...state,
        loading: false,
        tripStats: action.payload.data
      };

    case GET_RECENT_TRIPS_SUCCESS:
      return {
        ...state,
        loading: false,
        recentTrips: action.payload.data
      };

    case GET_TRIPS_FAILURE:
    case CREATE_TRIP_FAILURE:
    case UPDATE_TRIP_FAILURE:
    case DELETE_TRIP_FAILURE:
    case GET_TRIP_STATS_FAILURE:
    case GET_RECENT_TRIPS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case CLEAR_TRIP_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Action Creators
const getTripsRequest = () => ({ type: GET_TRIPS_REQUEST });
const getTripsSuccess = (data) => ({ type: GET_TRIPS_SUCCESS, payload: data });
const getTripsFailure = (error) => ({ type: GET_TRIPS_FAILURE, payload: error });

const createTripRequest = () => ({ type: CREATE_TRIP_REQUEST });
const createTripSuccess = (data) => ({ type: CREATE_TRIP_SUCCESS, payload: data });
const createTripFailure = (error) => ({ type: CREATE_TRIP_FAILURE, payload: error });

const updateTripRequest = () => ({ type: UPDATE_TRIP_REQUEST });
const updateTripSuccess = (data) => ({ type: UPDATE_TRIP_SUCCESS, payload: data });
const updateTripFailure = (error) => ({ type: UPDATE_TRIP_FAILURE, payload: error });

const deleteTripRequest = () => ({ type: DELETE_TRIP_REQUEST });
const deleteTripSuccess = (tripId) => ({ type: DELETE_TRIP_SUCCESS, payload: tripId });
const deleteTripFailure = (error) => ({ type: DELETE_TRIP_FAILURE, payload: error });

const getTripStatsRequest = () => ({ type: GET_TRIP_STATS_REQUEST });
const getTripStatsSuccess = (data) => ({ type: GET_TRIP_STATS_SUCCESS, payload: data });
const getTripStatsFailure = (error) => ({ type: GET_TRIP_STATS_FAILURE, payload: error });

const getRecentTripsRequest = () => ({ type: GET_RECENT_TRIPS_REQUEST });
const getRecentTripsSuccess = (data) => ({ type: GET_RECENT_TRIPS_SUCCESS, payload: data });
const getRecentTripsFailure = (error) => ({ type: GET_RECENT_TRIPS_FAILURE, payload: error });

export const clearTripError = () => ({ type: CLEAR_TRIP_ERROR });

// Thunk Action Creators
export const getTrips = (filters = {}) => async (dispatch) => {
  try {
    dispatch(getTripsRequest());
    const response = await tripsAPI.getTrips(filters);
    dispatch(getTripsSuccess(response));
  } catch (error) {
    dispatch(getTripsFailure(error.message));
  }
};

export const createTrip = (tripData) => async (dispatch) => {
  try {
    dispatch(createTripRequest());
    const response = await tripsAPI.createTrip(tripData);
    dispatch(createTripSuccess(response));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create trip';
    dispatch(createTripFailure(errorMessage));
    throw error;
  }
};

export const updateTrip = (id, tripData) => async (dispatch) => {
  try {
    dispatch(updateTripRequest());
    const response = await tripsAPI.updateTrip(id, tripData);
    dispatch(updateTripSuccess(response));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update trip';
    dispatch(updateTripFailure(errorMessage));
    throw error;
  }
};

export const deleteTrip = (id) => async (dispatch) => {
  try {
    dispatch(deleteTripRequest());
    await tripsAPI.deleteTrip(id);
    dispatch(deleteTripSuccess(id));
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete trip';
    dispatch(deleteTripFailure(errorMessage));
    throw error;
  }
};

export const getTripStats = (vehicleId, startDate, endDate) => async (dispatch) => {
  try {
    dispatch(getTripStatsRequest());
    const response = await tripsAPI.getTripStats(vehicleId, startDate, endDate);
    dispatch(getTripStatsSuccess(response));
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to get trip statistics';
    dispatch(getTripStatsFailure(errorMessage));
  }
};

export const getRecentTrips = (vehicleId, limit = 10) => async (dispatch) => {
  try {
    dispatch(getRecentTripsRequest());
    const response = await tripsAPI.getRecentTrips(vehicleId, limit);
    dispatch(getRecentTripsSuccess(response));
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to get recent trips';
    dispatch(getRecentTripsFailure(errorMessage));
  }
};