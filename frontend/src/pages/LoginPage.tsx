import { useState } from 'react';

type LoginResponse = { token?: string; error?: string };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Adjust the URL to your Spring endpoint. Vite dev proxy can route /api -> 8080
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // for cookie sessions
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as LoginResponse;
      if (!res.ok) throw new Error(data.error || 'Inloggningen misslyckades');

      // If backend returns a JWT in body, store it (optional).
      if (data.token) localStorage.setItem('auth_token', data.token);

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Något gick fel.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      {/* Hero header area that mirrors your mock */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <h1 className="h1">Logga in</h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-700">
            Välkommen till NSR planeringsverktyg! Logga in för att fortsätta.
          </p>

          <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,520px),1fr]">
            {/* Login Card */}
            <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-6 md:p-8 shadow-soft">
              <div className="space-y-6">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium">E-postadress</label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="username"
                    className="mt-2 block w-full rounded-xl2 border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="du@exempel.se"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium">Lösenord</label>
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
                    <input type="checkbox" className="rounded text-nsr-teal focus:ring-nsr-teal" />
                    Kom ihåg mig
                  </label>
                  <a className="text-sm text-nsr-teal hover:underline" href="/forgot-password">Glömt lösenord?</a>
                </div>

                <div className="flex flex-col gap-3">
                  <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
                    {loading ? 'Loggar in…' : 'Logga in'}
                  </button>
                  <a href="/register" className="btn-secondary text-center">Skapa konto</a>
                </div>
              </div>
            </form>

            {/* Right side: info/illustration to echo the mock */}
            <aside className="hidden md:block">
              <div className="rounded-2xl bg-nsr-sky p-8 h-full">
                <h2 className="text-xl font-semibold">Design & Planeringsverktyg</h2>
                <p className="mt-3 text-gray-700">
                  Placera, ta bort, ändra och byt kärl i ett avfallsrum och se hur det i realtid påverkar kostnaderna.
                </p>

                <div className="mt-8">
                  <svg viewBox="0 0 800 140" className="w-full h-28" aria-hidden>
                    <path d="M0 120h800v20H0z" fill="#003F44"/>
                    <path d="M0 120c40-20 80-30 120-10 60 30 140-60 200-20 70 45 120-10 180 0s100 40 160 10 120 10 140 20H0z" fill="#007A84" />
                  </svg>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}