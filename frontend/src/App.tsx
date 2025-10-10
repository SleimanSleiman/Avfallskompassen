import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PropertyPage from './pages/PropertyPage';
import { currentUser } from './lib/auth';
import PlanningTool from './pages/PlanningTool';

function Dashboard() {
  const user = currentUser();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="h1">Välkommen!</h1>
      <p className="mt-3 text-lg text-gray-700">
        Du är inloggad som {user?.username}.
      </p>
      <div className="mt-6">
        <a href="/properties" className="btn-primary">
          Hantera fastigheter
        </a>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = currentUser();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/properties" element={
            <ProtectedRoute>
              <PropertyPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/planningTool" element={<PlanningTool />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}