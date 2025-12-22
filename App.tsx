import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './auth-context';
import Layout from './Layout';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import SearchPage from './SearchPage';
import CommercesPage from './CommercesPage';
import CommerceDetailPage from './CommerceDetailPage';
import AgendaPage from './AgendaPage';
import EquipePage from './EquipePage';
import StatisticsPage from './StatisticsPage';
import SettingsPage from './SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8C3A]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8C3A]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <SearchPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/commerces"
        element={
          <ProtectedRoute>
            <Layout>
              <CommercesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/commerces/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <CommerceDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <Layout>
              <AgendaPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/equipe"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Layout>
                <EquipePage />
              </Layout>
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/statistiques"
        element={
          <ProtectedRoute>
            <Layout>
              <StatisticsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/parametres"
        element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#1a1a25',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
