import React from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function MainApp() {
  const { token, admin } = useAdminAuth();

  if (!token || !admin) {
    return React.createElement(Login, {
      onLoginSuccess: () => {},
    });
  }

  return React.createElement(
    ProtectedRoute,
    {
      fallback: React.createElement(Login, { onLoginSuccess: () => {} }),
    },
    React.createElement(Dashboard, null)
  );
}

export default function App() {
  return React.createElement(
    AdminAuthProvider,
    null,
    React.createElement(MainApp, null)
  );
}