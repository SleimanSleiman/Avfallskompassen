import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { currentUser, logout } from '../lib/Auth';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import ConfirmModal from './ConfirmModal';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(currentUser());
  const isAdmin = String(user?.role || '').toUpperCase().includes('ADMIN');
  const location = useLocation();
  const hideMenu = ["/login", "/register"].includes(location.pathname);
  const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges();
  const [pendingLogout, setPendingLogout] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  useEffect(() => {
    setUser(currentUser());

    const handleStorageChange = () => {
      setUser(currentUser());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  function handleLogout() {
    if (hasUnsavedChanges) {
      setPendingLogout(true);
    } else {
      logout();
      setUser(null);
      setHasUnsavedChanges(false);
      window.location.href = '/login';
    }
  }

  function handleConfirmLogout() {
    setPendingLogout(false);
    logout();
    setUser(null);
    setHasUnsavedChanges(false);
    window.location.href = '/login';
  }

  function handleCancelLogout() {
    setPendingLogout(false);
  }

  function handleNavigation(path: string) {
    if (hasUnsavedChanges && location.pathname.includes('/planningTool')) {
      setPendingNavigation(path);
    } else {
      window.location.href = path;
    }
  }

  function handleConfirmNavigation() {
    if (pendingNavigation) {
      setHasUnsavedChanges(false);
      window.location.href = pendingNavigation;
    }
  }

  function handleCancelNavigation() {
    setPendingNavigation(null);
  }

  function resetPlanningToolState() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('enviormentRoomData');
    localStorage.removeItem('trashRoomData');
    localStorage.removeItem('selectedProperty');
    localStorage.removeItem('selectedPropertyId');
    setHasUnsavedChanges(false);
  }

  return (
    <header className="w-full shadow-sm">
      <div className="bg-nsr-teal">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-14 items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-white font-semibold">
              <img
                src="\src\assets\avfallskompassen_logo.png"
                alt="Avfallskompassen logo"
                className="h-12 w-12 object-contain"
              />
              <img
                src="\src\assets\nsr_white.svg"
                alt="NSR logo"
                className="h-8 w-auto"
              />
            </Link>

            {!hideMenu && (
            <button className="md:hidden text-white" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            )}

            {!hideMenu && (
            <nav className="hidden md:flex items-center gap-6 text-white font-black text-lg">
              {isAdmin ? (
                <>
                  <NavLink to="/admin" className={({ isActive }) => `nav-link hover:text-white transition-colors ${isActive ? 'nav-link-active' : ''}`}>Admin</NavLink>
                  <div className="flex items-center gap-3">
                    {user && <span className="text-sm">Hej {user.username}!</span>}
                    <button
                      onClick={handleLogout}
                      className="rounded-xl2 bg-nsr-accent px-4 py-2 text-sm text-[#121212] hover:bg-nsr-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nsr-accent transition-colors"
                    >
                      Logga ut
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('/dashboard');
                    }}
                    className={`nav-link hover:text-white transition-colors ${location.pathname === '/dashboard' ? 'nav-link-active' : ''}`}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('/statistics');
                    }}
                    className={`nav-link hover:text-white transition-colors ${location.pathname === '/statistics' ? 'nav-link-active' : ''}`}
                  >
                    Statistik
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('/properties');
                    }}
                    className={`nav-link hover:text-white transition-colors ${location.pathname === '/properties' ? 'nav-link-active' : ''}`}
                  >
                    Mina fastigheter
                  </button>
                  <NavLink
                    to="/planningTool"
                    onClick={resetPlanningToolState}
                    className={({ isActive }) => `nav-link hover:text-white transition-colors ${isActive ? 'nav-link-active' : ''}`}
                  >
                    Planeringsverktyg
                  </NavLink>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('/reports');
                    }}
                    className={`nav-link hover:text-white transition-colors ${location.pathname === '/reports' ? 'nav-link-active' : ''}`}
                  >
                    Rapporter
                  </button>
                  <div className="flex items-center gap-3">
                    {user && <span className="text-sm">Hej {user.username}!</span>}
                    {user ? (
                      <button
                        onClick={handleLogout}
                        className="rounded-xl2 bg-nsr-accent px-4 py-2 text-sm text-[#121212] hover:bg-nsr-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nsr-accent transition-colors"
                      >
                        Logga ut
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="rounded-xl2 bg-nsr-accent px-4 py-2 text-sm text-[#121212] hover:bg-nsr-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nsr-accent transition-colors"
                      >
                        Logga in
                      </Link>
                    )}
                  </div>
                </>
              )}
            </nav>
            )}
          </div>
        </div>
      </div>
      <div className="h-3 w-full bg-nsr-tealDark" />
      {open && !hideMenu && (
        <div className="md:hidden bg-white border-b">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3 font-black">
            {isAdmin ? (
              <>
                <NavLink to="/admin" className="text-nsr-ink">Admin</NavLink>
                <button onClick={handleLogout} className="text-left text-nsr-ink">Logga ut</button>
              </>
            ) : (
              <>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    handleNavigation('/dashboard');
                  }}
                  className="text-left text-nsr-ink"
                >
                  Dashboard
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    handleNavigation('/properties');
                  }}
                  className="text-left text-nsr-ink"
                >
                  Mina fastigheter
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    handleNavigation('/statistics');
                  }}
                  className="text-left text-nsr-ink"
                >
                  Statistik
                </button>
                <NavLink to="/planningTool" onClick={resetPlanningToolState} className="text-nsr-ink">Planeringsverktyg</NavLink>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    handleNavigation('/reports');
                  }}
                  className="text-left text-nsr-ink"
                >
                  Rapporter
                </button>
                {user ? (
                  <button onClick={handleLogout} className="text-left text-nsr-ink">Logga ut</button>
                ) : (
                  <Link to="/login" className="text-left text-nsr-ink">Logga in</Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}

      {/* Confirmation modal for unsaved changes when logging out */}
      {pendingLogout && (
        <ConfirmModal
          open={pendingLogout}
          title="Osparade ändringar"
          message="Du har osparade ändringar. Är du säker på att du vill logga ut?"
          confirmLabel="Logga ut utan att spara"
          cancelLabel="Avbryt"
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      )}

      {/* Confirmation modal for unsaved changes when navigating */}
      {pendingNavigation && (
        <ConfirmModal
          open={!!pendingNavigation}
          title="Osparade ändringar"
          message="Du har osparade ändringar. Är du säker på att du vill navigera bort från planeringsverktyget?"
          confirmLabel="Navigera utan att spara"
          cancelLabel="Avbryt"
          onConfirm={handleConfirmNavigation}
          onCancel={handleCancelNavigation}
        />
      )}
    </header>
  );
}
