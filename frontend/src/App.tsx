import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext.tsx';
import Login from './pages/Login.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import EmployeeDashboard from './pages/EmployeeDashboard.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/employee'} /> : <Login />} 
        />
        <Route 
          path="/admin/*" 
          element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/employee/*" 
          element={user?.role === 'EMPLOYEE' ? <EmployeeDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/employee') : '/login'} />} 
        />
      </Routes>
    </Box>
  );
}

export default App;

