import { createSlice } from '@reduxjs/toolkit';
import api from '../services/apiService';

const initialState = {
  loading: false,
  user: null,
  stats: {
    projects: 0,
    tasks: 0,
    profileComplete: 100,
  },
  recentActivity: [
    {
      id: 1,
      text: 'Welcome to the MERN Template!',
      time: 'Just now',
      type: 'welcome'
    },
    {
      id: 2,
      text: 'Account created successfully',
      time: 'Just now',
      type: 'success'
    }
  ],
  projects: [],
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    setRecentActivity: (state, action) => {
      state.recentActivity = action.payload;
    },
    addActivity: (state, action) => {
      state.recentActivity.unshift({
        id: Date.now(),
        ...action.payload,
        time: 'Just now'
      });
      // Keep only last 10 activities
      state.recentActivity = state.recentActivity.slice(0, 10);
    },
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setUser,
  setStats,
  setRecentActivity,
  addActivity,
  setProjects,
  setError,
  clearError
} = dashboardSlice.actions;

export const selectUser = (state) => state.dashboard.user;
export const selectStats = (state) => state.dashboard.stats;
export const selectRecentActivity = (state) => state.dashboard.recentActivity;
export const selectProjects = (state) => state.dashboard.projects;
export const selectLoading = (state) => state.dashboard.loading;
export const selectError = (state) => state.dashboard.error;

export const fetchDashboardData = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());

    const response = await api.get('/auth/profile');

    dispatch(setUser(response.data.user));

    // Simulate fetching additional dashboard data
    setTimeout(() => {
      dispatch(setStats({
        projects: Math.floor(Math.random() * 10),
        tasks: Math.floor(Math.random() * 50),
        profileComplete: 100
      }));

      dispatch(addActivity({
        text: 'Dashboard data refreshed',
        type: 'info'
      }));

      dispatch(setLoading(false));
    }, 500);

  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to load dashboard data'));
    dispatch(setLoading(false));
  }
};

export const createProject = (projectName) => async (dispatch) => {
  try {
    // Simulate project creation - replace with actual API call
    dispatch(setLoading(true));

    setTimeout(() => {
      const newProject = {
        id: Date.now(),
        name: projectName,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      dispatch(setStats({
        projects: Math.floor(Math.random() * 10) + 1
      }));

      dispatch(addActivity({
        text: `Created project: ${projectName}`,
        type: 'success'
      }));

      dispatch(setLoading(false));
    }, 1000);

    return { success: true };
  } catch (error) {
    dispatch(setError('Failed to create project'));
    dispatch(setLoading(false));
    return { success: false };
  }
};

export default dashboardSlice.reducer;