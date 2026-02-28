import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
import { Dashboard } from './pages/dashboard/Dashboard';
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { PatientLogin } from './pages/patient/PatientLogin';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { Patients } from './pages/Patients';
import Exams from './pages/Exams';
import Invoices from './pages/Invoices';
import { Payments } from './pages/Payments';
import PatientReports from './pages/PatientReports';
import Users from './pages/Users';
import Settings from './pages/Settings';

function App() {
  return (
    <ToastProvider>
    <ConfirmProvider>
    <AuthProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          {/* Route de connexion personnel */}
          <Route path="/login" element={<LoginForm />} />
          
          {/* Routes du portail patient */}
          <Route path="/patient" element={<PatientLogin />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          
          {/* Routes protégées du personnel médical */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Dashboard principal */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Patients */}
            <Route path="patients" element={
              <ProtectedRoute permission="patients">
                <Patients />
              </ProtectedRoute>
            } />
            
            {/* Examens */}
            <Route path="exams" element={
              <ProtectedRoute permission="exams">
                <Exams />
              </ProtectedRoute>
            } />
            
            {/* Factures */}
            <Route path="invoices" element={
              <ProtectedRoute permission="invoices">
                <Invoices />
              </ProtectedRoute>
            } />
            
            {/* Paiements */}
            <Route path="payments" element={
              <ProtectedRoute permission="payments">
                <Payments />
              </ProtectedRoute>
            } />
            
            {/* Comptes Rendus */}
            <Route path="reports" element={
              <ProtectedRoute permission="reports">
                <PatientReports />
              </ProtectedRoute>
            } />
            
            {/* Rendez-vous */}
            <Route path="appointments" element={
              <ProtectedRoute permission="appointments">
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Gestion des Rendez-vous</h1>
                  <p className="text-neutral-600">Module en développement...</p>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Utilisateurs */}
            <Route path="users" element={
              <ProtectedRoute permission="users">
                <Users />
              </ProtectedRoute>
            } />
            
            {/* Paramètres */}
            <Route path="settings" element={<Settings />} />
            
            {/* Redirection par défaut */}
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
