import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppNavbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import TitleOnboarding from './pages/TitleOnboarding';
import JobTracker from './pages/JobTracker';
import CompanyTracker from './pages/CompanyTracker';
import JobSearch from './pages/JobSearch';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationDetail from './pages/ApplicationDetail';
import NotFound from './pages/NotFound';

// Redirect logged-in users away from /login and /register
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/trackers" replace />;
  }
  return children;
};

// Protected Layout with the original JobTrack top navigation
const ProtectedLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <div className="d-flex flex-column min-vh-100 bg-light">
        <AppNavbar />
        <main className="flex-grow-1">{children}</main>
        <footer className="bg-white border-top py-3 text-center text-muted small">
          <div className="container">
            <span>JobTrack &copy; {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Root Redirect to Job Tracker */}
          <Route path="/" element={<Navigate to="/trackers" replace />} />

          {/* Target Role Setup (What job title are you looking for?) */}
          <Route
            path="/home"
            element={
              <ProtectedLayout>
                <TitleOnboarding />
              </ProtectedLayout>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedLayout>
                <TitleOnboarding />
              </ProtectedLayout>
            }
          />

          {/* Job Tracker */}
          <Route
            path="/trackers"
            element={
              <ProtectedLayout>
                <JobTracker />
              </ProtectedLayout>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/trackers" replace />} />

          {/* Companies Tracker (No People tab!) */}
          <Route
            path="/trackers/companies"
            element={
              <ProtectedLayout>
                <CompanyTracker />
              </ProtectedLayout>
            }
          />

          {/* Live Job Search & Similar Companies */}
          <Route
            path="/job-search"
            element={
              <ProtectedLayout>
                <JobSearch />
              </ProtectedLayout>
            }
          />
          <Route path="/discover" element={<Navigate to="/job-search" replace />} />

          {/* Application CRUD Forms & Detail */}
          <Route
            path="/applications/new"
            element={
              <ProtectedLayout>
                <ApplicationForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/applications/:id"
            element={
              <ProtectedLayout>
                <ApplicationDetail />
              </ProtectedLayout>
            }
          />
          <Route
            path="/applications/:id/edit"
            element={
              <ProtectedLayout>
                <ApplicationForm />
              </ProtectedLayout>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
