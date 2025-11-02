import { createSlice } from '@reduxjs/toolkit';
import api from '../services/apiService';

const initialState = {
  loading: false,
  isAuthenticated: !!localStorage.getItem('token'),
  user: null,
  error: null,
  token: localStorage.getItem('token'),
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      localStorage.removeItem('token');
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('token');
      // Clear any Google OAuth session data
      localStorage.removeItem('googleOAuthState');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError
} = loginSlice.actions;

export const selectIsAuthenticated = (state) => state.login.isAuthenticated;
export const selectUser = (state) => state.login.user;
export const selectLoading = (state) => state.login.loading;
export const selectError = (state) => state.login.error;
export const selectToken = (state) => state.login.token;

export const getProfile = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get('/auth/profile');

    dispatch(loginSuccess({
      user: response.data.user,
      token: localStorage.getItem('token'),
    }));
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Failed to get profile'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateProfile = (profileData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.put('/auth/profile', profileData);

    dispatch(loginSuccess({
      user: response.data.user,
      token: localStorage.getItem('token'),
    }));

    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update profile';
    dispatch(loginFailure(errorMessage));
    return { success: false, message: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

export const loginWithGoogle = () => async (dispatch) => {
  try {
    dispatch(loginStart());

    // Redirect to Google OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`;

    return { success: true };
  } catch (error) {
    const errorMessage = 'Google login failed. Please try again.';
    dispatch(loginFailure(errorMessage));
    return { success: false, message: errorMessage };
  }
};

// Set user directly from auth callback
export const setUser = (authData) => (dispatch) => {
  dispatch(loginSuccess({
    user: authData.user,
    token: authData.token,
  }));
};

export default loginSlice.reducer;