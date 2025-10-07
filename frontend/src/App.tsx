import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import PlanningTool from './pages/PlanningToolTestChangeForm';

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="h1">Välkommen!</h1>
      <p className="mt-3 text-lg text-gray-700">Du är inloggad.</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/planningTool" element={<PlanningTool />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}