import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { currentUser, logout } from '../lib/auth';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const user = currentUser();

  function handleLogout() {
    logout();
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
              {user ? (
                <>
                  <NavLink to="/dashboard" className={({ isActive }) => `nav-link hover:text-white transition-colors ${isActive ? 'nav-link-active' : ''}`}>Dashboard</NavLink>
                  <NavLink to="/properties" className={({ isActive }) => `nav-link hover:text-white transition-colors ${isActive ? 'nav-link-active' : ''}`}>Mina fastigheter</NavLink>
                  <NavLink to="/planningTool" className={({ isActive }) => `nav-link hover:text-white transition-colors ${isActive ? 'nav-link-active' : ''}`}>Planeringsverktyg</NavLink>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Hej {user.username}!</span>
                    <button
                      onClick={handleLogout}
                      className="rounded-xl2 bg-nsr-accent px-4 py-2 text-sm text-white hover:bg-nsr-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nsr-accent transition-colors"
                    >
                      Logga ut
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <NavLink to="#" className="nav-link hover:text-white transition-colors">Abonnemang</NavLink>
                  <NavLink to="#" className="nav-link hover:text-white transition-colors">Information</NavLink>
                  <div className="relative">
                    <input className="h-9 w-64 rounded-full border-0 bg-white/95 pl-4 pr-10 text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-nsr-teal" placeholder="Vad letar du efter?" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="7" strokeWidth="2"/><path d="m20 20-3-3" strokeWidth="2"/>
                      </svg>
                    </span>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
      <div className="h-3 w-full bg-nsr-tealDark" />
      {open && (
        <div className="md:hidden bg-white border-b">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3 font-black">
            {user ? (
              <>
                <NavLink to="/dashboard" className="text-nsr-ink">Dashboard</NavLink>
                <NavLink to="/properties" className="text-nsr-ink">Mina fastigheter</NavLink>
                <NavLink to="/planningTool" className="text-nsr-ink">Planeringsverktyg</NavLink>
                <button onClick={handleLogout} className="text-left text-nsr-ink">Logga ut</button>
              </>
            ) : (
              <>
                <NavLink to="#" className="text-nsr-ink">Abonnemang</NavLink>
                <NavLink to="#" className="text-nsr-ink">Information</NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}