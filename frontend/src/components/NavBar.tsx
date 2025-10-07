import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full shadow-sm">
      <div className="bg-nsr-teal">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-white font-semibold">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20">e</span>
              <span className="tracking-wide">NSR</span>
            </Link>

            <button className="md:hidden text-white" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            <nav className="hidden md:flex items-center gap-6 text-white/90">
              <NavLink to="#" className="hover:text-white">Abonnemang</NavLink>
              <NavLink to="#" className="hover:text-white">Mitt konto</NavLink>
              <NavLink to="#" className="hover:text-white">Mina avfallsrum</NavLink>
              <NavLink to="/planningTool" className="hover:text-white">Planeringsverktyg</NavLink>
              <div className="relative">
                <input className="h-9 w-64 rounded-full border-0 bg-white/95 pl-4 pr-10 text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-nsr-teal" placeholder="Vad letar du efter?" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="7" strokeWidth="2"/><path d="m20 20-3-3" strokeWidth="2"/>
                  </svg>
                </span>
              </div>
            </nav>
          </div>
        </div>
      </div>
      <div className="h-3 w-full bg-nsr-tealDark" />
      {open && (
        <div className="md:hidden bg-white border-b">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3">
            <NavLink to="#" className="text-nsr-ink">Abonnemang</NavLink>
            <NavLink to="#" className="text-nsr-ink">Mitt konto</NavLink>
            <NavLink to="#" className="text-nsr-ink">Mina avfallsrum</NavLink>
            <NavLink to="/planningTool" className="text-nsr-ink">Planeringsverktyg</NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}