import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Medicines = lazy(() => import('./pages/Medicines'));
const Employees = lazy(() => import('./pages/Employees'));
const Billing = lazy(() => import('./pages/Billing'));
const Bills = lazy(() => import('./pages/Bills'));
const PrintBill = lazy(() => import('./pages/PrintBill'));

const Spinner = (
  <Box sx={{ display: 'grid', placeItems: 'center', height: '60vh' }}><CircularProgress /></Box>
);

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <Box sx={{ display: 'grid', placeItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { user, loading } = useAuth();
  return (
    <Suspense fallback={Spinner}>
    <Routes>
      <Route path="/" element={!loading && user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/print-bill/:id" element={<Protected><PrintBill /></Protected>} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/bills" element={<Bills />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
