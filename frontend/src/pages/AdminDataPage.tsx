import { useState, useEffect } from 'react';
import { get, put } from '../lib/Api';
import LoadingBar from '../components/LoadingBar';
import { currentUser } from '../lib/Auth';

type LockType = {
  id: number;
  name: string;
  cost: number;
};

type ContainerPlan = {
  id: number;
  municipalityName: string;
  serviceTypeName: string;
  containerTypeName: string;
  containerSize: number;
  emptyingFrequencyPerYear: number;
  cost: number;
};

type CollectionFee = {
  id: number;
  municipalityName: string;
  cost: number;
};

type AdminData = {
  lockTypes: LockType[];
  containerPlans: ContainerPlan[];
  collectionFees: CollectionFee[];
};

export default function AdminDataPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ type: string; id: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = currentUser();
    if (!user) {
      setError('Du är inte inloggad. Vänligen logga in först.');
      setLoading(false);
      return;
    }
    
    const isAdmin = user?.role && user.role.toUpperCase().includes('ADMIN');
    if (!isAdmin) {
      setError(`Du har inte behörighet att komma åt denna sida. Din nuvarande roll är: "${user.role || 'USER'}". Endast administratörer (ADMIN) kan hantera priser och kostnader. Kontakta en administratör för att få din roll uppdaterad, eller uppdatera din roll direkt i databasen.`);
      setLoading(false);
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const adminData = await get<AdminData>('/api/admin/data');
      setData(adminData);
    } catch (e: unknown) {
        if(e instanceof Error) {
            console.error('Failed to load admin data', e);
            const errorMessage = e?.message || 'Okänt fel';
            if (errorMessage.includes('Forbidden') || errorMessage.includes('403')) {
                setError('Åtkomst nekad (403). Kontrollera att din användare har ADMIN-rollen i databasen. Du kan behöva logga ut och logga in igen efter att rollen har uppdaterats.');
            } else {
                setError(`Kunde inte ladda data: ${errorMessage}. Kontrollera att backend-servern körs.`);
            }
        }
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (type: string, id: number, currentCost: number) => {
    setEditing({ type, id });
    setEditValue(currentCost.toString());
    setError(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue('');
    setError(null);
  };

  const saveEdit = async () => {
    if (!editing || !editValue) return;

    const cost = parseFloat(editValue);
    if (isNaN(cost) || cost < 0) {
      setError('Ogiltigt värde. Ange ett positivt tal.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      let endpoint = '';
      if (editing.type === 'lockType') {
        endpoint = `/api/admin/data/lock-types/${editing.id}`;
      } else if (editing.type === 'containerPlan') {
        endpoint = `/api/admin/data/container-plans/${editing.id}`;
      } else if (editing.type === 'collectionFee') {
        endpoint = `/api/admin/data/collection-fees/${editing.id}`;
      }

      await put(endpoint, { cost });
      
      // Reload data to get updated values
      await loadData();
      setEditing(null);
      setEditValue('');
    } catch (e) {
      console.error('Failed to save', e);
      setError('Kunde inte spara ändringen. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 overflow-x-hidden">
        <div className="rounded-2xl border bg-white p-6 shadow-soft text-center">
          <LoadingBar message="Laddar data…" />
        </div>
      </main>
    );
  }

  if (!data && !loading) {
    const user = currentUser();
    const isAdmin = user?.role && user.role.toUpperCase().includes('ADMIN');
    
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 overflow-x-hidden">
        <div className="rounded-2xl border bg-white p-6 shadow-soft">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold mb-2">Fel:</p>
              <p className="text-red-700 whitespace-pre-line">{error}</p>
            </div>
          )}
          {!error && (
            <>
              <p className="text-red-600 mb-4">Kunde inte ladda data.</p>
              <button onClick={loadData} className="btn-primary">
                Försök igen
              </button>
            </>
          )}
          {!isAdmin && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-semibold mb-2">Hur fixar jag detta?</p>
              <p className="text-yellow-700 text-sm mb-2">
                För att få tillgång till denna sida behöver din användare ha ADMIN-rollen i databasen.
              </p>
              <p className="text-yellow-700 text-sm">
                Uppdatera din roll i databasen med: <code className="bg-yellow-100 px-2 py-1 rounded">UPDATE users SET role = 'ADMIN' WHERE username = '{user?.username}';</code>
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                Efter uppdateringen, logga ut och logga in igen för att få en ny token med rätt roll.
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }
  if(!data) {
      return null;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 overflow-x-hidden">
      {/* Header */}
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft">
        <a
          href="/admin"
          className="mb-5 inline-flex items-center gap-2 text-nsr-teal hover:text-nsr-tealDark transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Tillbaka till Admin Dashboard</span>
        </a>
        <div className="mb-3">
          <h1 className="h1 rubriktext">Hantera Kostnader</h1>
          <p className="mt-2 text-gray-600 brodtext">
            Uppdatera priser för låstyper, kärl och dragvägsavgifter.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Lock Types Section */}
      <div className="mb-8 rounded-2xl border bg-white shadow-soft">
        <div className="border-b px-6 py-4 bg-gray-50/50">
          <h2 className="text-xl font-black text-nsr-ink">
            Låstyper ({data.lockTypes.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Namn
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Kostnad
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Åtgärd
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.lockTypes.map((lockType) => (
                <tr key={lockType.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-nsr-ink">{lockType.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editing?.type === 'lockType' && editing.id === lockType.id ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-32 rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-nsr-teal focus:ring-nsr-teal"
                        disabled={saving}
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(lockType.cost)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {editing?.type === 'lockType' && editing.id === lockType.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="px-3 py-1.5 text-sm font-semibold text-white bg-nsr-teal rounded-lg hover:bg-nsr-tealDark disabled:opacity-50"
                        >
                          {saving ? 'Sparar...' : 'Spara'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                        >
                          Avbryt
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit('lockType', lockType.id, lockType.cost)}
                        className="px-3 py-1.5 text-sm font-semibold text-nsr-teal hover:text-nsr-tealDark"
                      >
                        Redigera
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Container Plans Section */}
      <div className="mb-8 rounded-2xl border bg-white shadow-soft">
        <div className="border-b px-6 py-4 bg-gray-50/50">
          <h2 className="text-xl font-black text-nsr-ink">
            Kärl ({data.containerPlans.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Kommun
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Abonnemangstyp
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Storlek
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tömningar/år
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Kostnad
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Åtgärd
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.containerPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-nsr-ink">{plan.municipalityName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{plan.serviceTypeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{plan.containerTypeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{plan.emptyingFrequencyPerYear}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editing?.type === 'containerPlan' && editing.id === plan.id ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-32 rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-nsr-teal focus:ring-nsr-teal"
                        disabled={saving}
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(plan.cost)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {editing?.type === 'containerPlan' && editing.id === plan.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="px-3 py-1.5 text-sm font-semibold text-white bg-nsr-teal rounded-lg hover:bg-nsr-tealDark disabled:opacity-50"
                        >
                          {saving ? 'Sparar...' : 'Spara'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                        >
                          Avbryt
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit('containerPlan', plan.id, plan.cost)}
                        className="px-3 py-1.5 text-sm font-semibold text-nsr-teal hover:text-nsr-tealDark"
                      >
                        Redigera
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collection Fees Section */}
      <div className="mb-8 rounded-2xl border bg-white shadow-soft">
        <div className="border-b px-6 py-4 bg-gray-50/50">
          <h2 className="text-xl font-black text-nsr-ink">
            Dragvägsavgifter ({data.collectionFees.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Kommun
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Kostnad per segment
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Åtgärd
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.collectionFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-nsr-ink">{fee.municipalityName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editing?.type === 'collectionFee' && editing.id === fee.id ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-32 rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-nsr-teal focus:ring-nsr-teal"
                        disabled={saving}
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(fee.cost)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {editing?.type === 'collectionFee' && editing.id === fee.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="px-3 py-1.5 text-sm font-semibold text-white bg-nsr-teal rounded-lg hover:bg-nsr-tealDark disabled:opacity-50"
                        >
                          {saving ? 'Sparar...' : 'Spara'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                        >
                          Avbryt
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit('collectionFee', fee.id, fee.cost)}
                        className="px-3 py-1.5 text-sm font-semibold text-nsr-teal hover:text-nsr-tealDark"
                      >
                        Redigera
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

