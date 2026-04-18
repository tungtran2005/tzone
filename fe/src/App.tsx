import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
// import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrandsPage from './pages/BrandsPage';
import BrandDetailPage from './pages/BrandDetailPage';
import DeviceDetailPage from './pages/DeviceDetailPage';
import ComparePage from './pages/ComparePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import BrandManagePage from './pages/admin/BrandManagePage';
import DeviceManagePage from './pages/admin/DeviceManagePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#f1f5f9' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
            },
          }}
        />

        <Routes>
          {/* Public routes with main layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/brands/:id" element={<BrandDetailPage />} />
            <Route path="/devices/:id" element={<DeviceDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
          </Route>

        {/* Admin routes with admin layout */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/brands" element={<BrandManagePage />} />
          <Route path="/admin/devices" element={<DeviceManagePage />} />
        </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
