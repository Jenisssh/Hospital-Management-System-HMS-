import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import { useTheme } from './theme/ThemeProvider.jsx';

import AppLayout from './layout/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Patients from './pages/Patients.jsx';
import Doctors from './pages/Doctors.jsx';
import Appointments from './pages/Appointments.jsx';
import Payments from './pages/Payments.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const { token } = useAuth();
  const { theme } = useTheme();

  return (
    <>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/patients"
            element={<ProtectedRoute roles={['admin']}><Patients /></ProtectedRoute>}
          />
          <Route
            path="/doctors"
            element={<ProtectedRoute roles={['admin']}><Doctors /></ProtectedRoute>}
          />
          <Route path="/appointments" element={<Appointments />} />
          <Route
            path="/payments"
            element={<ProtectedRoute roles={['admin', 'patient']}><Payments /></ProtectedRoute>}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
            color: theme === 'dark' ? '#F1F5F9' : '#0F172A',
            border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}`,
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: 'white' } },
          error: { iconTheme: { primary: '#EF4444', secondary: 'white' } },
        }}
      />
    </>
  );
}
