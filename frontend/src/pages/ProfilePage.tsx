import { useState } from 'react';
import { changePassword, currentUser } from '../lib/Auth';

export default function ProfilePage() {
  const user = currentUser();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!oldPassword) {
      setError('Ange ditt nuvarande lösenord');
      return;
    }

    if (newPassword.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken långt');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('De nya lösenorden matchar inte');
      return;
    }

    if (newPassword === oldPassword) {
      setError('Det nya lösenordet måste skilja sig från ditt nuvarande');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      setSuccess(res.message || 'Lösenordet har uppdaterats');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Kunde inte uppdatera lösenordet just nu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="mb-8">
          <h1 className="h1">Min profil</h1>
          <p className="mt-2 text-lg text-gray-700">Hantera dina kontouppgifter och byt lösenord.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 md:p-8 shadow-soft space-y-6">
            <div className="space-y-4">
              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="oldPassword" className="block text-sm font-medium">
                    Nuvarande lösenord
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOld((v) => !v)}
                    className="text-sm text-nsr-teal hover:underline"
                  >
                    {showOld ? 'Dölj' : 'Visa'}
                  </button>
                </div>
                <input
                  id="oldPassword"
                  type={showOld ? 'text' : 'password'}
                  className="mt-2 block w-full rounded-xl2 border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="newPassword" className="block text-sm font-medium">
                    Nytt lösenord
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="text-sm text-nsr-teal hover:underline"
                  >
                    {showNew ? 'Dölj' : 'Visa'}
                  </button>
                </div>
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  className="mt-2 block w-full rounded-xl2 border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Minst 6 tecken och får inte vara samma som ditt nuvarande lösenord.</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Bekräfta nytt lösenord
                </label>
                <input
                  id="confirmPassword"
                  type={showNew ? 'text' : 'password'}
                  className="mt-2 block w-full rounded-xl2 border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="btn-primary w-full md:w-auto disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Uppdaterar…' : 'Uppdatera lösenord'}
              </button>
            </div>
          </form>

          <aside className="rounded-2xl border bg-white p-6 shadow-soft space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-nsr-ink">Kontouppgifter</h2>
              <dl className="mt-3 space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <dt className="font-medium">Användarnamn</dt>
                  <dd>{user?.username}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-medium">Roll</dt>
                  <dd>{user?.role}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-nsr-ink">Lösenordsregler</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>Minst 6 tecken långt.</li>
                <li>Får inte vara samma som ditt nuvarande lösenord.</li>
                <li>Rekommenderat: använd en blandning av bokstäver, siffror och symboler.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
