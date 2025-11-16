import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { currentUser, logout } from '../lib/auth';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(currentUser());

  useEffect(() => {
    // Update user state when component mounts
    setUser(currentUser());

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = () => {
      setUser(currentUser());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab login/logout
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
    window.location.href = '/login';
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

            <button className="md:hidden text-white" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            <nav className="hidden md:flex items-center gap-6 text-white font-black text-lg">
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link hover:text-white transition-colors ${isActive ? 'nav-link-active' : ''}`}>Dashboard</NavLink>
              <NavLink to="/properties" className={({ isActive }) => `nav-link hover:text-white transition-colors ${isActive ? 'nav-link-active' : ''}`}>Mina fastigheter</NavLink>
              <NavLink to="/planningTool" className={({ isActive }) => `nav-link hover:text-white transition-colors ${isActive ? 'nav-link-active' : ''}`}>Planeringsverktyg</NavLink>
              <NavLink to="/reports" className={({ isActive }) => `nav-link hover:text-white transition-colors ${isActive ? 'nav-link-active' : ''}`}>Rapporter</NavLink>
              {user && (
                <NavLink to="/admin" className={({ isActive }) => `nav-link hover:text-white transition-colors ${isActive ? 'nav-link-active' : ''}`}>Admin</NavLink>
              )}
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
            </nav>
          </div>
        </div>
      </div>
      <div className="h-3 w-full bg-nsr-tealDark" />
      {open && (
        <div className="md:hidden bg-white border-b">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3 font-black">
            <NavLink to="/dashboard" className="text-nsr-ink">Dashboard</NavLink>
            <NavLink to="/properties" className="text-nsr-ink">Mina fastigheter</NavLink>
            <NavLink to="/planningTool" className="text-nsr-ink">Planeringsverktyg</NavLink>
            <NavLink to="/reports" className="text-nsr-ink">Rapporter</NavLink>
            {user && <NavLink to="/admin" className="text-nsr-ink">Admin</NavLink>}
            {user ? (
              <button onClick={handleLogout} className="text-left text-nsr-ink">Logga ut</button>
            ) : (
              <Link to="/login" className="text-left text-nsr-ink">Logga in</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}