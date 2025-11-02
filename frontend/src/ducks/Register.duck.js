import { createSlice } from '@reduxjs/toolkit';
import api from '../services/apiService';

const initialState = {
  loading: false,
  success: false,
  error: null,
  registeredUser: null,
};

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.registeredUser = action.payload.user;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.success = false;
      state.registeredUser = null;
      state.error = action.payload;
    },
    clearRegisterState: (state) => {
      state.success = false;
      state.error = null;
      state.registeredUser = null;
    },
  },
});

export const {
  setLoading,
  registerStart,
  registerSuccess,
  registerFailure,
  clearRegisterState
} = registerSlice.actions;

export const selectLoading = (state) => state.register.loading;
export const selectSuccess = (state) => state.register.success;
export const selectError = (state) => state.register.error;
export const selectRegisteredUser = (state) => state.register.registeredUser;

export const registerUser = (username, email, password) => async (dispatch) => {
  try {
    dispatch(registerStart());
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
    });

    dispatch(registerSuccess({
      user: response.data.user,
      token: response.data.token,
    }));

    // Store token in localStorage
    localStorage.setItem('token', response.data.token);

    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Registration failed';
    dispatch(registerFailure(errorMessage));
    return { success: false, message: errorMessage };
  }
};

export default registerSlice.reducer;