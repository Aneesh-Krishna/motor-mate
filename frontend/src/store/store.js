import { configureStore } from '@reduxjs/toolkit';
import homeReducer from '../ducks/Home.duck';
import loginReducer from '../ducks/Login.duck';
import registerReducer from '../ducks/Register.duck';
import dashboardReducer from '../ducks/Dashboard.duck';

const store = configureStore({
  reducer: {
    home: homeReducer,
    login: loginReducer,
    register: registerReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;