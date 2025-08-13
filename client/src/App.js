import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Offers from './pages/Offers';
import Payouts from './pages/Payouts';
import Referrals from './pages/Referrals';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Admin from './pages/admin/Admin';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <main className="pt-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } />
            <Route path="/register" element={
              <ProtectedRoute requireAuth={false}>
                <Register />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/offers" element={
              <ProtectedRoute>
                <Offers />
              </ProtectedRoute>
            } />
            <Route path="/payouts" element={
              <ProtectedRoute>
                <Payouts />
              </ProtectedRoute>
            } />
            <Route path="/referrals" element={
              <ProtectedRoute>
                <Referrals />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Main App
function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppContent />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
