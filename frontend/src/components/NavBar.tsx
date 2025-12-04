import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { currentUser, logout } from '../lib/Auth';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import ConfirmModal from './ConfirmModal';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(currentUser());
  const isAdmin = String(user?.role || '').toUpperCase().includes('ADMIN');
  const location = useLocation();
  const navigate = useNavigate();
  const hideMenu = ["/login", "/register"].includes(location.pathname);
  
  const { hasUnsavedChanges, setHasUnsavedChanges, setShowCloseWarning, showCloseWarning, isNavigatingRef } = useUnsavedChanges();
  const pendingNavigationRef = useRef<(() => void) | null>(null);

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
      pendingNavigationRef.current = () => {
        logout();
        setUser(null);
        window.location.href = '/login';
      };
      setShowCloseWarning(true);
      return;
    }
    
    logout();
    setUser(null);
    window.location.href = '/login';
  }

  function handleNavigation(to: string) {
    if (hasUnsavedChanges) {
      pendingNavigationRef.current = () => {
        navigate(to);
      };
      setShowCloseWarning(true);
      return;
    }
    
    navigate(to);
  }

  return (
    <header className="w-full shadow-sm">
      <ConfirmModal
        open={showCloseWarning}
        title="Osparade ändringar"
        message="Du har gjort ändringar som inte är sparade. Är du säker på att du vill lämna utan att spara?"
        confirmLabel="Lämna utan att spara"
        cancelLabel="Avbryt"
        onConfirm={() => {
          setShowCloseWarning(false);
          setHasUnsavedChanges(false);
          isNavigatingRef.current = true;
          if (pendingNavigationRef.current) {
            const navFn = pendingNavigationRef.current;
            pendingNavigationRef.current = null;
            setTimeout(() => {
              navFn();
            }, 0);
          }
        }}
        onCancel={() => {
          setShowCloseWarning(false);
          pendingNavigationRef.current = null;
        }}
      />
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
                  <button 
                    onClick={() => handleNavigation("/admin")}
                    className={`nav-link hover:text-white transition-colors ${location.pathname === "/admin" ? 'nav-link-active' : ''}`}
                  >
                    Admin
                  </button>
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
                    onClick={() => handleNavigation("/dashboard")}
                    className={`nav-link hover:text-white transition-colors ${location.pathname === "/dashboard" ? 'nav-link-active' : ''}`}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => handleNavigation("/statistics")}
                    className={`nav-link hover:text-white transition-colors ${location.pathname === "/statistics" ? 'nav-link-active' : ''}`}
                  >
                    Statistik
                  </button>
                  <button 
                    onClick={() => handleNavigation("/properties")}
                    className={`nav-link hover:text-white transition-colors ${location.pathname === "/properties" ? 'nav-link-active' : ''}`}
                  >
                    Mina fastigheter
                  </button>
                  <button 
                    onClick={() => handleNavigation("/planningTool")}
                    className={`nav-link hover:text-white transition-colors ${location.pathname === "/planningTool" ? 'nav-link-active' : ''}`}
                  >
                    Planeringsverktyg
                  </button>
                  <button 
                    onClick={() => handleNavigation("/reports")}
                    className={`nav-link hover:text-white transition-colors ${location.pathname === "/reports" ? 'nav-link-active' : ''}`}
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
                <button 
                  onClick={() => handleNavigation("/admin")}
                  className="text-left text-nsr-ink"
                >
                  Admin
                </button>
                <button 
                  onClick={handleLogout} 
                  className="text-left text-nsr-ink"
                >
                  Logga ut
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleNavigation("/dashboard")}
                  className="text-left text-nsr-ink"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => handleNavigation("/properties")}
                  className="text-left text-nsr-ink"
                >
                  Mina fastigheter
                </button>
                <button 
                  onClick={() => handleNavigation("/statistics")}
                  className="text-left text-nsr-ink"
                >
                  Statistik
                </button>
                <button 
                  onClick={() => handleNavigation("/planningTool")}
                  className="text-left text-nsr-ink"
                >
                  Planeringsverktyg
                </button>
                <button 
                  onClick={() => handleNavigation("/reports")}
                  className="text-left text-nsr-ink"
                >
                  Rapporter
                </button>
                {user ? (
                  <button 
                    onClick={handleLogout} 
                    className="text-left text-nsr-ink"
                  >
                    Logga ut
                  </button>
                ) : (
                  <Link to="/login" className="text-left text-nsr-ink">Logga in</Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
