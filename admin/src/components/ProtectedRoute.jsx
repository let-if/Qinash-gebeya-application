import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function ProtectedRoute(props) {
  const children = props.children;
  const fallback = props.fallback;
  const { admin, token, loading } = useAdminAuth();

  if (loading) {
    return React.createElement(
      'div',
      { className: 'flex h-screen items-center justify-center bg-[#F8FAF7]' },
      React.createElement('div', {
        className: 'h-8 w-8 animate-spin rounded-full border-4 border-[#0F7B4A] border-t-transparent',
      })
    );
  }

  if (!token || !admin) {
    return fallback || null;
  }

  return children;
}
