import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import api from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false
      };
    
    case AUTH_ACTIONS.SET_TOKEN:
      localStorage.setItem('token', action.payload);
      return { ...state, token: action.payload };
    
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  // Fetch user data if token exists
  const { data: userData, error, isLoading } = useQuery(
    ['user', state.token],
    () => api.get('/auth/me'),
    {
      enabled: !!state.token,
      retry: false,
      onSuccess: (data) => {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: data.data.user });
      },
      onError: () => {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    }
  );

  // Set loading state
  useEffect(() => {
    if (!state.token) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.token]);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, token } = response.data.data;
      
      dispatch({ type: AUTH_ACTIONS.SET_TOKEN, payload: token });
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data.data;
      
      dispatch({ type: AUTH_ACTIONS.SET_TOKEN, payload: token });
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  // Update user function
  const updateUser = (updates) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updates });
  };

  // Verify email function
  const verifyEmail = async (token) => {
    try {
      await api.post('/auth/verify-email', { token });
      updateUser({ emailVerified: true });
      toast.success('Email verified successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Verify phone function
  const verifyPhone = async (phoneNumber, code) => {
    try {
      await api.post('/auth/verify-phone', { phoneNumber, code });
      updateUser({ phoneVerified: true });
      toast.success('Phone number verified successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Phone verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Resend verification function
  const resendVerification = async () => {
    try {
      const response = await api.post('/auth/resend-verification');
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend verification';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading || isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    verifyEmail,
    verifyPhone,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
