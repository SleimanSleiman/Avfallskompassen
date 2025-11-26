import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../lib/Auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false); 
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setLoading(true);

    try {
      const res = await login(username, password, rememberMe); 
      if (res.success) {
        setMsg(res.message || 'Inloggning lyckades');
        // Navigate to dashboard after successful login
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(res.message || 'Inloggningen misslyckades');
      }
    } catch (err: any) {
      setError(err.message || 'Något gick fel.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <h1 className="h1">Logga in</h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-700">
            Välkommen till NSR planeringsverktyg! Logga in för att fortsätta.
          </p>

          <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,520px),1fr]">
            <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-6 md:p-8 shadow-soft">
              <div className="space-y-6">
                {msg && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {msg}
                  </div>
                )}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm font-medium">
                    Användarnamn
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    className="mt-2 block w-full rounded-xl2 border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ditt användarnamn"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium">
                      Lösenord
                    </label>
                    <button 
                      type="button" 
                      className="text-sm text-nsr-teal hover:underline" 
                      onClick={() => setShowPw(v => !v)}
                    >
                      {showPw ? 'Dölj' : 'Visa'} lösenord
                    </button>
                  </div>
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="mt-2 block w-full rounded-xl2 border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      className="rounded text-nsr-teal focus:ring-nsr-teal" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                    />
                    Kom ihåg mig
                  </label>
                  <a className="text-sm text-nsr-teal hover:underline" href="#">
                    Glömt lösenord?
                  </a>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn-primary disabled:opacity-60"
                  >
                    {loading ? 'Loggar in…' : 'Logga in'}
                  </button>
                  
                  <Link to="/register" className="btn-secondary text-center">
                    Skapa konto
                  </Link>
                </div>
              </div>
            </form>

            <aside className="hidden md:block">
              <div className="rounded-2xl bg-nsr-sky p-8 h-full">
                <h2 className="text-xl font-semibold">Design & Planeringsverktyg</h2>
                <p className="mt-3 text-gray-700">
                  Placera, ta bort, ändra och byt kärl i ett miljörum och se hur det i realtid påverkar kostnaderna.
                </p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-nsr-teal rounded-full"></div>
                    <span className="text-sm">Hantera abonnemang</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-nsr-teal rounded-full"></div>
                    <span className="text-sm">Designa miljörum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-nsr-teal rounded-full"></div>
                    <span className="text-sm">Se kostnader i realtid</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}