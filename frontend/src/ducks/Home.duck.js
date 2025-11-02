import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  features: [
    {
      id: 1,
      title: '🚀 Modern Stack',
      description: 'Built with MongoDB, Express, React, and Node.js for optimal performance and scalability.'
    },
    {
      id: 2,
      title: '🔐 Authentication',
      description: 'Secure user authentication with JWT tokens and password hashing using bcrypt.'
    },
    {
      id: 3,
      title: '📱 Responsive Design',
      description: 'Clean, modern interface that works seamlessly across all devices and screen sizes.'
    },
    {
      id: 4,
      title: '⚡ Fast Development',
      description: 'Hot reload development server with React and nodemon for rapid iteration.'
    }
  ],
  stats: {
    totalUsers: 0,
    totalProjects: 0,
    uptime: 0
  }
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    updateFeature: (state, action) => {
      const { id, feature } = action.payload;
      const index = state.features.findIndex(f => f.id === id);
      if (index !== -1) {
        state.features[index] = { ...state.features[index], ...feature };
      }
    },
  },
});

export const { setLoading, setStats, updateFeature } = homeSlice.actions;

export const selectFeatures = (state) => state.home.features;
export const selectStats = (state) => state.home.stats;
export const selectLoading = (state) => state.home.loading;

export const fetchStats = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    // Simulate API call - replace with actual API if needed
    setTimeout(() => {
      dispatch(setStats({
        totalUsers: Math.floor(Math.random() * 1000),
        totalProjects: Math.floor(Math.random() * 100),
        uptime: Math.floor(Math.random() * 365)
      }));
      dispatch(setLoading(false));
    }, 1000);
  } catch (error) {
    console.error('Error fetching stats:', error);
    dispatch(setLoading(false));
  }
};

export default homeSlice.reducer;