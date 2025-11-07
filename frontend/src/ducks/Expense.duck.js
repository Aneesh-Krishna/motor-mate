import { expensesAPI } from '../services/api';

// Action Types
const GET_EXPENSES_REQUEST = 'expenses/GET_EXPENSES_REQUEST';
const GET_EXPENSES_SUCCESS = 'expenses/GET_EXPENSES_SUCCESS';
const GET_EXPENSES_FAILURE = 'expenses/GET_EXPENSES_FAILURE';

const CREATE_EXPENSE_REQUEST = 'expenses/CREATE_EXPENSE_REQUEST';
const CREATE_EXPENSE_SUCCESS = 'expenses/CREATE_EXPENSE_SUCCESS';
const CREATE_EXPENSE_FAILURE = 'expenses/CREATE_EXPENSE_FAILURE';

const UPDATE_EXPENSE_REQUEST = 'expenses/UPDATE_EXPENSE_REQUEST';
const UPDATE_EXPENSE_SUCCESS = 'expenses/UPDATE_EXPENSE_SUCCESS';
const UPDATE_EXPENSE_FAILURE = 'expenses/UPDATE_EXPENSE_FAILURE';

const DELETE_EXPENSE_REQUEST = 'expenses/DELETE_EXPENSE_REQUEST';
const DELETE_EXPENSE_SUCCESS = 'expenses/DELETE_EXPENSE_SUCCESS';
const DELETE_EXPENSE_FAILURE = 'expenses/DELETE_EXPENSE_FAILURE';

const GET_MILEAGE_STATS_REQUEST = 'expenses/GET_MILEAGE_STATS_REQUEST';
const GET_MILEAGE_STATS_SUCCESS = 'expenses/GET_MILEAGE_STATS_SUCCESS';
const GET_MILEAGE_STATS_FAILURE = 'expenses/GET_MILEAGE_STATS_FAILURE';

const CLEAR_EXPENSE_ERROR = 'expenses/CLEAR_EXPENSE_ERROR';

// Initial State
const initialState = {
  expenses: [],
  mileageStats: null,
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
export default function expenseReducer(state = initialState, action) {
  switch (action.type) {
    case GET_EXPENSES_REQUEST:
    case CREATE_EXPENSE_REQUEST:
    case UPDATE_EXPENSE_REQUEST:
    case DELETE_EXPENSE_REQUEST:
    case GET_MILEAGE_STATS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_EXPENSES_SUCCESS:
      return {
        ...state,
        loading: false,
        expenses: action.payload.data,
        pagination: action.payload.pagination,
        error: null
      };

    case CREATE_EXPENSE_SUCCESS:
      return {
        ...state,
        loading: false,
        expenses: [action.payload, ...state.expenses],
        error: null
      };

    case UPDATE_EXPENSE_SUCCESS:
      return {
        ...state,
        loading: false,
        expenses: state.expenses.map(expense =>
          expense._id === action.payload._id ? action.payload : expense
        ),
        error: null
      };

    case DELETE_EXPENSE_SUCCESS:
      return {
        ...state,
        loading: false,
        expenses: state.expenses.filter(expense => expense._id !== action.payload),
        error: null
      };

    case GET_MILEAGE_STATS_SUCCESS:
      return {
        ...state,
        loading: false,
        mileageStats: action.payload,
        error: null
      };

    case GET_EXPENSES_FAILURE:
    case CREATE_EXPENSE_FAILURE:
    case UPDATE_EXPENSE_FAILURE:
    case DELETE_EXPENSE_FAILURE:
    case GET_MILEAGE_STATS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case CLEAR_EXPENSE_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Action Creators
const getExpensesRequest = () => ({ type: GET_EXPENSES_REQUEST });
const getExpensesSuccess = (data, pagination) => ({
  type: GET_EXPENSES_SUCCESS,
  payload: { data, pagination }
});
const getExpensesFailure = (error) => ({
  type: GET_EXPENSES_FAILURE,
  payload: error
});

const createExpenseRequest = () => ({ type: CREATE_EXPENSE_REQUEST });
const createExpenseSuccess = (expense) => ({
  type: CREATE_EXPENSE_SUCCESS,
  payload: expense
});
const createExpenseFailure = (error) => ({
  type: CREATE_EXPENSE_FAILURE,
  payload: error
});

const updateExpenseRequest = () => ({ type: UPDATE_EXPENSE_REQUEST });
const updateExpenseSuccess = (expense) => ({
  type: UPDATE_EXPENSE_SUCCESS,
  payload: expense
});
const updateExpenseFailure = (error) => ({
  type: UPDATE_EXPENSE_FAILURE,
  payload: error
});

const deleteExpenseRequest = () => ({ type: DELETE_EXPENSE_REQUEST });
const deleteExpenseSuccess = (expenseId) => ({
  type: DELETE_EXPENSE_SUCCESS,
  payload: expenseId
});
const deleteExpenseFailure = (error) => ({
  type: DELETE_EXPENSE_FAILURE,
  payload: error
});

const getMileageStatsRequest = () => ({ type: GET_MILEAGE_STATS_REQUEST });
const getMileageStatsSuccess = (stats) => ({
  type: GET_MILEAGE_STATS_SUCCESS,
  payload: stats
});
const getMileageStatsFailure = (error) => ({
  type: GET_MILEAGE_STATS_FAILURE,
  payload: error
});

export const clearExpenseError = () => ({ type: CLEAR_EXPENSE_ERROR });

// Thunks
export const fetchExpenses = (filters = {}) => async (dispatch) => {
  try {
    console.log('Redux fetchExpenses action called with:', filters);
    dispatch(getExpensesRequest());
    const response = await expensesAPI.getExpenses(filters);
    console.log('API response for fetchExpenses:', response);
    dispatch(getExpensesSuccess(response.data || response, response.pagination));
    return response;
  } catch (error) {
    console.error('Redux fetchExpenses error:', error);
    const errorMessage = error.message || 'Failed to fetch expenses';
    dispatch(getExpensesFailure(errorMessage));
    throw error;
  }
};

export const createExpense = (expenseData) => async (dispatch) => {
  try {
    console.log('Redux createExpense action called with:', expenseData);
    dispatch(createExpenseRequest());
    const response = await expensesAPI.createExpense(expenseData);
    console.log('API response for createExpense:', response);
    dispatch(createExpenseSuccess(response.data || response));
    return response;
  } catch (error) {
    console.error('Redux createExpense error:', error);
    const errorMessage = error.message || 'Failed to create expense';
    dispatch(createExpenseFailure(errorMessage));
    throw error;
  }
};

export const updateExpense = (id, expenseData) => async (dispatch) => {
  try {
    dispatch(updateExpenseRequest());
    const response = await expensesAPI.updateExpense(id, expenseData);
    dispatch(updateExpenseSuccess(response.data || response));
    return response;
  } catch (error) {
    const errorMessage = error.message || 'Failed to update expense';
    dispatch(updateExpenseFailure(errorMessage));
    throw error;
  }
};

export const deleteExpense = (id) => async (dispatch) => {
  try {
    dispatch(deleteExpenseRequest());
    await expensesAPI.deleteExpense(id);
    dispatch(deleteExpenseSuccess(id));
  } catch (error) {
    const errorMessage = error.message || 'Failed to delete expense';
    dispatch(deleteExpenseFailure(errorMessage));
    throw error;
  }
};

export const fetchMileageStats = (vehicleId) => async (dispatch) => {
  try {
    dispatch(getMileageStatsRequest());
    const response = await expensesAPI.getMileageStats(vehicleId);
    console.log('API response for fetchMileageStats:', response);
    dispatch(getMileageStatsSuccess(response.data || response));
    return response;
  } catch (error) {
    console.error('Redux fetchMileageStats error:', error);
    const errorMessage = error.message || 'Failed to fetch mileage stats';
    dispatch(getMileageStatsFailure(errorMessage));
    throw error;
  }
};

// Selectors
export const selectExpenses = (state) => state.expense.expenses;
export const selectExpensesLoading = (state) => state.expense.loading;
export const selectExpenseError = (state) => state.expense.error;
export const selectExpensePagination = (state) => state.expense.pagination;
export const selectMileageStats = (state) => state.expense.mileageStats;