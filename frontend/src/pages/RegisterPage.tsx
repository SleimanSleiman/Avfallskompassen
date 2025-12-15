import { useState } from 'react';
import { register } from '../lib/Auth';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte');
      return;
    }

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken långt');
      return;
    }

    setLoading(true);
    try {
      const trimmedUsername = username.replace(/\s+$/, '');
      const res = await register(trimmedUsername, password);
      if (res.success) {
        setMsg(res.message || 'Kontot har skapats! Du är nu inloggad.');
        localStorage.removeItem("trashRoomData");
        localStorage.removeItem('enviormentRoomData');
        localStorage.removeItem('selectedProperty');
        localStorage.removeItem('selectedPropertyId');

        setTimeout(() => {
          navigate('/dashboard');
        }, 600);
        // Clear form on success
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(res.message || 'Registreringen misslyckades');
      }
    } catch (err: any) {
      setError(err.message || 'Något gick fel vid registreringen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <h1 className="h1">Skapa konto</h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-700">
            Välkommen till NSR planeringsverktyg! Skapa ditt konto för att komma igång.
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
                    minLength={3}
                    maxLength={50}
                    className="mt-2 block w-full rounded-xl2 border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Välj ett användarnamn (minst 3 tecken)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Användarnamnet måste vara mellan 3-50 tecken
                  </p>
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
                    autoComplete="new-password"
                    minLength={6}
                    className="mt-2 block w-full rounded-xl2 border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Lösenordet måste vara minst 6 tecken långt
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium">
                    Bekräfta lösenord
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    className="mt-2 block w-full rounded-xl2 border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <input 
                    type="checkbox" 
                    required
                    className="mt-1 rounded text-nsr-teal focus:ring-nsr-teal" 
                  />
                  <label className="text-sm text-gray-700">
                    Jag godkänner{' '}
                    <a href="#" className="text-nsr-teal hover:underline">
                      användarvillkoren
                    </a>{' '}
                    och{' '}
                    <a href="#" className="text-nsr-teal hover:underline">
                      integritetspolicyn
                    </a>
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn-primary disabled:opacity-60"
                  >
                    {loading ? 'Skapar konto…' : 'Skapa konto'}
                  </button>
                  
                  <div className="text-center">
                    <span className="text-sm text-gray-600">
                      Har du redan ett konto?{' '}
                      <Link to="/login" className="text-nsr-teal hover:underline">
                        Logga in här
                      </Link>
                    </span>
                  </div>
                </div>
              </div>
            </form>

            <aside className="hidden md:block">
              <div className="rounded-2xl bg-nsr-sky p-8 h-full">
                <h2 className="text-xl font-semibold">Kom igång direkt</h2>
                <p className="mt-3 text-gray-700">
                  Efter registrering får du direkt tillgång till alla planeringsverktyg och kan börja designa dina miljörum.
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