const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get the auth token from localStorage
const getAuthToken = () => {
  // First try to get token from user object (for future compatibility)
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    if (userData.token) {
      return userData.token;
    }
  }

  // Then try to get token directly (current implementation)
  const token = localStorage.getItem('token');
  if (token) {
    return token;
  }

  return null;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`API Request: ${config.method || 'GET'} ${url}`);
    console.log('Token exists:', !!token);

    const response = await fetch(url, config);

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server returned non-JSON response');
    }

    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Request Error (${endpoint}):`, error);
    console.error('Error details:', error.message);
    throw error;
  }
};

// API methods for vehicles
export const vehiclesAPI = {
  // Get all vehicles for the authenticated user
  getVehicles: () => apiRequest('/vehicles'),

  // Get a single vehicle by ID
  getVehicleById: (id) => apiRequest(`/vehicles/${id}`),

  // Create a new vehicle
  createVehicle: (vehicleData) => apiRequest('/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicleData),
  }),

  // Update a vehicle
  updateVehicle: (id, vehicleData) => apiRequest(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(vehicleData),
  }),

  // Delete a vehicle
  deleteVehicle: (id) => apiRequest(`/vehicles/${id}`, {
    method: 'DELETE',
  }),

  // Get vehicle statistics
  getStats: () => apiRequest('/vehicles/stats'),
};

// API methods for authentication
export const authAPI = {
  // Get user profile
  getProfile: () => apiRequest('/auth/profile'),

  // Login with Google
  googleLogin: (token) => apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }),

  // Logout
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
};

// API methods for expenses
export const expensesAPI = {
  // Get all expenses for a user
  getExpenses: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiRequest(`/expenses${queryString ? '?' + queryString : ''}`);
  },

  // Get single expense by ID
  getExpense: (id) => apiRequest(`/expenses/${id}`),

  // Create new expense
  createExpense: (expenseData) => apiRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify(expenseData),
  }),

  // Update expense
  updateExpense: (id, expenseData) => apiRequest(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(expenseData),
  }),

  // Delete expense
  deleteExpense: (id) => apiRequest(`/expenses/${id}`, {
    method: 'DELETE',
  }),

  // Get fuel expenses for mileage calculations
  getFuelExpenses: (vehicleId, limit = 50) =>
    apiRequest(`/expenses/fuel/${vehicleId}?limit=${limit}`),

  // Calculate and update mileage for a vehicle
  calculateMileage: (vehicleId) =>
    apiRequest(`/expenses/calculate-mileage/${vehicleId}`, {
      method: 'POST',
    }),

  // Get vehicle mileage statistics
  getMileageStats: (vehicleId) =>
    apiRequest(`/expenses/mileage-stats/${vehicleId}`),

  // Get vehicle expense statistics
  getExpenseStats: (vehicleId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiRequest(`/expenses/stats/${vehicleId}${params.toString() ? '?' + params.toString() : ''}`);
  }
};

export default {
  vehicles: vehiclesAPI,
  auth: authAPI,
  expenses: expensesAPI,
};