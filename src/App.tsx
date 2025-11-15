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
import { Toaster } from './components/ui/sonner';
import { getDB, getAllRequests, addRequest } from './lib/newDb';
import { generateMockRequests } from './lib/newMockData';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await getDB();
        const existingRequests = await getAllRequests();
        
        // Add mock data only if database is empty
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
        <Route path="/" element={<Dashboard />} />
        <Route path="/requests" element={<NewRequestList />} />
        <Route path="/create" element={<NewRequestForm />} />
        <Route path="/request/:id" element={<NewRequestDetail />} />
        <Route path="/approvals" element={<NewApprovals />} />
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
