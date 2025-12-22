import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PropertyPage from './pages/PropertyPage';
import StatisticsPage from './pages/StatisticsPage';
import StatisticsOverviewPage from './pages/StatisticsOverviewPage';
import NotificationCenter from './components/NotificationCenter';
import { currentUser } from './lib/Auth';
import PlanningTool from './pages/PlanningTool/PlanningTool';
import AdminPage from './pages/AdminPage';
import AdminDataPage from './pages/AdminDataPage';
import AllWasteroomPage from "./pages/AllWasteroomPage";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { startInactivityTimer, stopInactivityTimer } from "./lib/InactivityTimer";
import { UnsavedChangesProvider } from './context/UnsavedChangesContext';
import { ActivityList } from './components/ActivityList';
import { getUsersLatestActivities } from './lib/Activity';
import type { Activity } from './lib/Activity';
import { setInactivityLogout } from "./lib/TimerLogoutReason";

function Dashboard() {
  const user = currentUser();
  const isAdmin = String(user?.role || '').toUpperCase().includes('ADMIN');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInactivityLogout(false);
  }, []);


  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching activities...");
        const data = await getUsersLatestActivities(20);
        console.log("Activities response:", data);
        setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch activities", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16">
        {/* Header Section */}
        <div className="mb-12 bg-[#f1f6f7] rounded-2xl p-8">
          <h1 className="h1 rubriktext">Välkommen till NSR Planeringsverktyg!</h1>
          <p className="mt-4 text-xl ingress text-gray-700">
            Du är inloggad som <span className="font-black text-nsr-teal">{user?.username}</span>
          </p>
          <p className="mt-2 text-lg brodtext text-gray-600">
            {isAdmin
              ? "Här kan du som administratör hantera fastigheter, planera, uppdatera och välja vilka miljörum som ska vara aktiva – samtidigt som du får full kostnadskontroll."
              : "Här kan du hantera dina fastigheter, planera miljörum och optimera kostnader."}
          </p>
          {isAdmin && (
            <a
              href="/admin"
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-soft transition"
              style={{ backgroundColor: "#e8c222", color: "#111827" }}
            >
              Gå till adminpanelen
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>

        {/* Quick Actions Grid */}
        {!isAdmin && (
          <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-nsr-accent/10 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-nsr-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-nsr-ink">Mina fastigheter</h3>
            </div>
            <p className="brodtext text-gray-600 mb-4">
              Hantera och övervaka dina fastigheter, se kostnader och hantera abonnemang.
            </p>
            <a href="/properties" className="btn-primary w-full text-center">
              Hantera fastigheter
            </a>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-nsr-teal/10 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-nsr-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-nsr-ink">Planeringsverktyg</h3>
            </div>
            <p className="brodtext text-gray-600 mb-4">
              Designa miljörum, placera kärl och se kostnader i realtid.
            </p>
            <a href="/planningTool" className="btn-secondary w-full text-center">
              Öppna planeringsverktyg
            </a>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-nsr-ink">Rapporter & Statistik</h3>
            </div>
            <p className="brodtext text-gray-600 mb-4">
              Se detaljerade rapporter om kostnader, sortering och miljöpåverkan.
            </p>
            <a href="/statistics" className="btn-secondary w-full text-center">
                Se din statistik
            </a>
          </div>
          </div>

          <NotificationCenter />
          </>
        )}

        {/* Recent Activity Section */}
        <ActivityList activities={activities} loading={loading} error={error} />
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
    const location = useLocation();

    useEffect(() => {
      const isInPlanningTool = location.pathname.startsWith("/planningTool");

      if (isInPlanningTool) {
        stopInactivityTimer();
      } else {
        startInactivityTimer();
      }
    }, [location.pathname]);
    
  return (
    <UnsavedChangesProvider>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                currentUser() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/properties" element={
              <ProtectedRoute>
                <PropertyPage />
              </ProtectedRoute>
            } />
            <Route path="/planningTool" element={
              <ProtectedRoute>
                <PlanningTool />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/data" element={
              <ProtectedRoute>
                <AdminDataPage />
              </ProtectedRoute>
            } />
              <Route path="/statistics" element={
                  <ProtectedRoute>
                      <StatisticsOverviewPage/>
                  </ProtectedRoute>
               }/>
            <Route path="/statistics/:propertyId" element={
              <ProtectedRoute>
                <StatisticsPage />
              </ProtectedRoute>
            } />
            <Route
            path="/allWasteroom/:propertyId"
            element={
              <ProtectedRoute>
                <AllWasteroomPage />
              </ProtectedRoute>
            }
          />

          </Routes>
        </div>
        <Footer />
      </div>
    </UnsavedChangesProvider>
  );
}
