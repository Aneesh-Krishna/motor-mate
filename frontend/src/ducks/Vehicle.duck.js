import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehiclesAPI } from '../services/api';

// Async thunks for vehicle management
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehiclesAPI.getVehicles();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vehicles');
    }
  }
);

export const addVehicle = createAsyncThunk(
  'vehicles/addVehicle',
  async (vehicleData, { rejectWithValue }) => {
    try {
      const response = await vehiclesAPI.createVehicle(vehicleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add vehicle');
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'vehicles/updateVehicle',
  async ({ id, vehicleData }, { rejectWithValue }) => {
    try {
      const response = await vehiclesAPI.updateVehicle(id, vehicleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update vehicle');
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicles/deleteVehicle',
  async (vehicleId, { rejectWithValue }) => {
    try {
      await vehiclesAPI.deleteVehicle(vehicleId);
      return vehicleId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete vehicle');
    }
  }
);

// Initial state
const initialState = {
  vehicles: [],
  selectedVehicle: null,
  selectedVehicleId: null,
  loading: false,
  error: null,
  addingVehicle: false,
  updatingVehicle: false,
  deletingVehicle: false
};

// Vehicle slice
const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    selectVehicle: (state, action) => {
      state.selectedVehicleId = action.payload;
      state.selectedVehicle = state.vehicles.find(v => v._id === action.payload) || null;
    },
    clearSelectedVehicle: (state) => {
      state.selectedVehicle = null;
      state.selectedVehicleId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateVehicleOdometer: (state, action) => {
      const { vehicleId, odometer } = action.payload;
      const vehicle = state.vehicles.find(v => v._id === vehicleId);
      if (vehicle) {
        vehicle.mileage = odometer; // Changed from odometer to mileage to match backend
        vehicle.updatedAt = new Date().toISOString();
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch vehicles
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
        // Select first vehicle if none selected
        if (!state.selectedVehicleId && action.payload.length > 0) {
          state.selectedVehicleId = action.payload[0]._id;
          state.selectedVehicle = action.payload[0];
        }
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add vehicle
    builder
      .addCase(addVehicle.pending, (state) => {
        state.addingVehicle = true;
        state.error = null;
      })
      .addCase(addVehicle.fulfilled, (state, action) => {
        state.addingVehicle = false;
        state.vehicles.push(action.payload);
        // Auto-select the newly added vehicle
        state.selectedVehicleId = action.payload._id;
        state.selectedVehicle = action.payload;
      })
      .addCase(addVehicle.rejected, (state, action) => {
        state.addingVehicle = false;
        state.error = action.payload;
      });

    // Update vehicle
    builder
      .addCase(updateVehicle.pending, (state) => {
        state.updatingVehicle = true;
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.updatingVehicle = false;
        const index = state.vehicles.findIndex(v => v._id === action.payload._id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
          // Update selected vehicle if it was the one being updated
          if (state.selectedVehicleId === action.payload._id) {
            state.selectedVehicle = action.payload;
          }
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.updatingVehicle = false;
        state.error = action.payload;
      });

    // Delete vehicle
    builder
      .addCase(deleteVehicle.pending, (state) => {
        state.deletingVehicle = true;
        state.error = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.deletingVehicle = false;
        state.vehicles = state.vehicles.filter(v => v._id !== action.payload);
        // Clear selected vehicle if it was deleted
        if (state.selectedVehicleId === action.payload) {
          if (state.vehicles.length > 0) {
            state.selectedVehicleId = state.vehicles[0]._id;
            state.selectedVehicle = state.vehicles[0];
          } else {
            state.selectedVehicleId = null;
            state.selectedVehicle = null;
          }
        }
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.deletingVehicle = false;
        state.error = action.payload;
      });
  }
});

// Action creators
export const {
  selectVehicle,
  clearSelectedVehicle,
  clearError,
  updateVehicleOdometer
} = vehicleSlice.actions;

// Selectors
export const selectVehicles = (state) => state.vehicles.vehicles;
export const selectSelectedVehicle = (state) => state.vehicles.selectedVehicle;
export const selectSelectedVehicleId = (state) => state.vehicles.selectedVehicleId;
export const selectVehicleById = (state, vehicleId) => {
  const vehicles = selectVehicles(state);
  return vehicles.find(v => v._id === vehicleId) || null;
};
export const selectVehiclesLoading = (state) => state.vehicles.loading;
export const selectVehiclesError = (state) => state.vehicles.error;
export const selectAddingVehicle = (state) => state.vehicles.addingVehicle;
export const selectUpdatingVehicle = (state) => state.vehicles.updatingVehicle;
export const selectDeletingVehicle = (state) => state.vehicles.deletingVehicle;
export const selectVehiclesCount = (state) => state.vehicles.vehicles.length;

// Reducer
export default vehicleSlice.reducer;