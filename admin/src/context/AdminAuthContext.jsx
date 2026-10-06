// import React, { createContext, useContext, useState, useEffect } from 'react';
// import api from '../api/client';

// const AdminAuthContext = createContext(null);

// export function AdminAuthProvider(props) {
//   const children = props.children;
//   const [admin, setAdmin] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem('admin_token'));
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const savedUser = localStorage.getItem('admin_user');
//     if (token && savedUser) {
//       try {
//         setAdmin(JSON.parse(savedUser));
//       } catch (e) {
//         logout();
//       }
//     }
//     setLoading(false);
//   }, [token]);

//   const login = async (phoneOrEmail, password) => {
//     const res = await api.post('/auth/login', {
//       phone: phoneOrEmail,
//       password,
//     });

//     const data = res.data;
//     const receivedToken = data.token || data.accessToken;
//     const user = data.user;

//     if (user && user.role && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
//       throw new Error('Access denied. Administrator privileges required.');
//     }

//     localStorage.setItem('admin_token', receivedToken);
//     localStorage.setItem('admin_user', JSON.stringify(user));
//     setToken(receivedToken);
//     setAdmin(user);
//     return user;
//   };

//   const logout = () => {
//     localStorage.removeItem('admin_token');
//     localStorage.removeItem('admin_user');
//     setToken(null);
//     setAdmin(null);
//   };

//   return React.createElement(
//     AdminAuthContext.Provider,
//     { value: { admin, token, login, logout, loading } },
//     children
//   );
// }

// export function useAdminAuth() {
//   return useContext(AdminAuthContext);
// }

import React, { createContext, useContext, useState, useEffect } from 'react';
// Imports your configured Axios instance
import api from '../api/client';

export const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setAdmin(null);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('admin_user');
    if (token && savedUser) {
      try {
        setAdmin(JSON.parse(savedUser));
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (phoneOrEmail, password) => {
    // Send both phoneNumber and phone so whatever key the backend expects is satisfied
    const res = await api.post('/auth/login', {
      phone: phoneOrEmail,
      phoneNumber: phoneOrEmail,
      password,
    });

    const data = res.data;
    const receivedToken = data.token || data.accessToken;
    const user = data.user || data.admin;

    if (user && user.role && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      throw new Error('ፍቃድ አልተሰጠዎትም፤ የአስተዳዳሪ መለያ ያስፈልጋል (Administrator privileges required)');
    }

    if (receivedToken) {
      localStorage.setItem('admin_token', receivedToken);
      setToken(receivedToken);
    }
    if (user) {
      localStorage.setItem('admin_user', JSON.stringify(user));
      setAdmin(user);
    }

    return user;
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthProvider;