import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { SystemOverview } from './pages/SystemOverview';
import { NewRequestForm } from './components/procurement/NewRequestForm';
import { NewRequestList } from './components/procurement/NewRequestList';
import { NewRequestDetail } from './components/procurement/NewRequestDetail';
import { NewApprovals } from './pages/NewApprovals';

// ✅ FIXED — Correct import for default export
import AdminDashboard from './pages/AdminDashboard';

import { Toaster } from './components/ui/sonner';
import { getDB, getAllRequests, addRequest } from './lib/newDb';
import { generateMockRequests } from './lib/newMockData';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';


const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await getDB();
        const existingRequests = await getAllRequests();
        
        if (existingRequests.length === 0) {
          const mockRequests = generateMockRequests();
          for (const request of mockRequests) {
            await addRequest(request);
          }
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initializeDB();
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <NewRequestList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'hod', 'admin']}>
              <NewRequestForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/request/:id"
          element={
            <ProtectedRoute>
              <NewRequestDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/approvals"
          element={
            <ProtectedRoute
              allowedRoles={[
                'hod',
                'so',
                'po',
                'principal',
                'payment_officer',
                'ao',
                'admin'
              ]}
            >
              <NewApprovals />
            </ProtectedRoute>
          }
        />

        {/* ✅ ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
              <ProtectedRoute roles={['Admin', 'Principal']}>
                <AdminDashboard />
              </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Layout>
  );
};


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast: 'rounded-2xl',
                title: 'text-sm',
                description: 'text-xs',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
