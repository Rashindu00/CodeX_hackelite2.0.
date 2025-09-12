import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

// Import pages and components
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderPatients from './pages/provider/ProviderPatients';
import ProviderAppointments from './pages/provider/ProviderAppointments';
import ProviderConsultations from './pages/provider/ProviderConsultations';
import AppointmentBooking from './pages/patient/AppointmentBooking';
import VideoConsultation from './pages/patient/VideoConsultation';
import HealthRecords from './pages/patient/HealthRecords';
import SymptomChecker from './pages/patient/SymptomChecker';
import ProfileSettings from './pages/ProfileSettings';
import Messages from './pages/Messages';
import NotFoundPage from './pages/NotFoundPage';

// Import components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import store actions
import { checkAuthStatus } from './store/slices/authSlice';

// Import utils
import { initializeApp } from './utils/appInitializer';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector(state => state.auth);

  // Define public routes where navbar should be shown
  const publicRoutes = ['/', '/login', '/register', '/auth/login', '/auth/register'];
  const isNotFoundPage = !publicRoutes.includes(location.pathname) && 
                         !location.pathname.startsWith('/patient') && 
                         !location.pathname.startsWith('/provider') && 
                         !location.pathname.startsWith('/admin') && 
                         !location.pathname.startsWith('/profile') && 
                         !location.pathname.startsWith('/consultation') &&
                         !location.pathname.startsWith('/dashboard');
  const shouldShowNavbar = publicRoutes.includes(location.pathname) || isNotFoundPage;

  useEffect(() => {
    // Initialize app and check authentication
    const initApp = async () => {
      try {
        await initializeApp();
        dispatch(checkAuthStatus());
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initApp();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading MediConnect AI...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`App ${shouldShowNavbar ? 'min-h-screen bg-gray-50' : 'h-screen'}`}>
        <Helmet>
          <title>MediConnect AI - Telemedicine Platform</title>
          <meta name="description" content="AI-powered telemedicine platform bridging healthcare gaps through technology" />
        </Helmet>

        {/* Navigation - Only show on public pages */}
        {shouldShowNavbar && <Navbar />}

        {/* Main Content */}
        <main className={shouldShowNavbar ? "min-h-screen" : "h-screen"}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to={getDashboardRoute(user?.role)} replace /> : <LoginPage />} 
            />
            <Route 
              path="/auth/login" 
              element={isAuthenticated ? <Navigate to={getDashboardRoute(user?.role)} replace /> : <LoginPage />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to={getDashboardRoute(user?.role)} replace /> : <RegisterPage />} 
            />
            <Route 
              path="/auth/register" 
              element={isAuthenticated ? <Navigate to={getDashboardRoute(user?.role)} replace /> : <RegisterPage />} 
            />

            {/* Protected Patient Routes */}
            <Route 
              path="/patient" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/appointments" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <AppointmentBooking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/appointment-booking" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <AppointmentBooking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/video-consultation" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <VideoConsultation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/health-records" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <HealthRecords />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/symptom-checker" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <SymptomChecker />
                </ProtectedRoute>
              } 
            />

            {/* Protected Provider Routes */}
            <Route 
              path="/provider" 
              element={
                <ProtectedRoute requiredRole="provider">
                  <ProviderDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/provider/patients" 
              element={
                <ProtectedRoute requiredRole="provider">
                  <ProviderPatients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/provider/appointments" 
              element={
                <ProtectedRoute requiredRole="provider">
                  <ProviderAppointments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/provider/consultations" 
              element={
                <ProtectedRoute requiredRole="provider">
                  <ProviderConsultations />
                </ProtectedRoute>
              } 
            />

            {/* Protected Common Routes */}
            <Route 
              path="/consultation/:consultationId" 
              element={
                <ProtectedRoute>
                  <VideoConsultation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes (placeholder for future) */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Dashboard Redirect Route */}
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                  <Navigate to={getDashboardRoute(user?.role)} replace /> : 
                  <Navigate to="/login" replace />
              } 
            />
            
            {/* Alternative dashboard routes for compatibility */}
            <Route 
              path="/dashboard/patient" 
              element={<Navigate to="/patient" replace />} 
            />
            <Route 
              path="/dashboard/provider" 
              element={<Navigate to="/provider" replace />} 
            />
            <Route 
              path="/dashboard/admin" 
              element={<Navigate to="/admin" replace />} 
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Footer - Only show on public pages */}
        {shouldShowNavbar && <Footer />}
      </div>
    </ErrorBoundary>
  );
}

// Helper function to get dashboard route based on user role
function getDashboardRoute(role) {
  switch (role) {
    case 'patient':
      return '/patient';
    case 'provider':
      return '/provider';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}

export default App;
