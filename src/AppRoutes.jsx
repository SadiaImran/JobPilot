import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import BaseLayout from './layouts/BaseLayout';
import JobApplicationAssistant from './pages/JobApplicationAssistant';
import EmailVerified from './pages/EmailVerified';

function PrivateRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

const AppRoutes = ({ isLoggedIn, setIsLoggedIn }) => (
  <Routes>
    <Route element={<BaseLayout isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/verified" element={<EmailVerified />} />
       <Route path="*" element={<Navigate to="/" />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute isLoggedIn={isLoggedIn}>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/application-assitant"
        element={
          <PrivateRoute isLoggedIn={isLoggedIn}>
            <JobApplicationAssistant />
          </PrivateRoute>
        }
      />
     
    </Route>
  </Routes>
);

export default AppRoutes;