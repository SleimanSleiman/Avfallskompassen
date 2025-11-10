import { useState, useMemo, useEffect } from 'react';
import AdminUserDetail from './Admin/AdminUserDetail';
import { get } from '../lib/api';

// Data types
export type AdminUser = {
  id: number;
  username: string;
  email?: string;
  createdAt?: string | null;
  propertiesCount: number;
  plansCount: number;
};

type BackendUser = { id: number; username: string; role?: string };
type PropertyDTO = { id: number; createdByUsername?: string };

export type AdminProperty = {
  id: number;
  userId: number;
  address: string;
  numberOfApartments: number;
  municipalityName: string;
  lockName: string;
  accessPathLength: number;
  createdAt: string;
};

export type RoomPlan = {
  id: number;
  propertyId: number;
  userId: number;
  name: string;
  roomWidth: number;
  roomHeight: number;
  createdAt: string;
  updatedAt: string;
  version: number;
  activeVersionNumber: number;
};

// Component state will hold live data fetched from backend
const EMPTY_USERS: AdminUser[] = [];

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<AdminUser[]>(EMPTY_USERS);
  const [properties, setProperties] = useState<PropertyDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const backendUsers = await get<BackendUser[]>('/api/admin/users');
        const props = await get<PropertyDTO[]>('/api/properties');

        // Map properties to their creators
        const propertiesByUser = new Map<string, PropertyDTO[]>();
        props.forEach((p) => {
          const username = p.createdByUsername || '';
          if (!propertiesByUser.has(username)) propertiesByUser.set(username, []);
          propertiesByUser.get(username)!.push(p);
        });

        // For each property, fetch wasterooms and accumulate plans count per user
        const plansCountByUser = new Map<string, number>();
        await Promise.all(
          props.map(async (p) => {
            try {
              const rooms = await get<any[]>(`/api/properties/${p.id}/wasterooms`);
              const username = p.createdByUsername || '';
              plansCountByUser.set(username, (plansCountByUser.get(username) || 0) + (rooms?.length || 0));
            } catch (e) {
              // if fetch fails for a property, ignore and continue
              console.warn('Failed to fetch wasterooms for property', p.id, e);
            }
          })
        );

        const mapped: AdminUser[] = backendUsers.map((bu) => ({
          id: bu.id,
          username: bu.username,
          email: undefined,
          createdAt: null,
          propertiesCount: (propertiesByUser.get(bu.username) || []).length,
          plansCount: plansCountByUser.get(bu.username) || 0,
        }));

        setUsers(mapped);
        setProperties(props);
      } catch (e) {
        console.error('Failed to load admin data', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((u) => u.username.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  }, [searchQuery, users]);

  const handleUserSelect = (user: AdminUser) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <AdminUserDetail
        user={selectedUser}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-6 shadow-soft text-center">Laddar användardata…</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft">
        <div className="mb-3">
          <h1 className="h1 rubriktext">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 brodtext">
            Hantera användare, fastigheter och miljörums-planeringar
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 brodtext">Totalt antal användare</p>
              <p className="mt-2 text-3xl font-black text-nsr-ink">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-nsr-teal/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-nsr-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 brodtext">Totalt antal fastigheter</p>
              <p className="mt-2 text-3xl font-black text-nsr-ink">
                {properties.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-nsr-accent/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-nsr-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 brodtext">Totalt antal planeringar</p>
              <p className="mt-2 text-3xl font-black text-nsr-ink">
                {users.reduce((sum, u) => sum + u.plansCount, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* User Search */}
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-xl font-black text-nsr-ink">Sök efter användare</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Sök på användarnamn eller e-post..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-gray-300 shadow-sm pl-10 pr-3 py-3 focus:border-nsr-teal focus:ring-nsr-teal"
          />
          <svg
            className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Users List */}
      <div className="rounded-2xl border bg-white shadow-soft">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-black text-nsr-ink">
            Användare ({filteredUsers.length})
          </h2>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">Inga användare hittades</p>
            <p className="mt-1">Försök med en annan sökterm.</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-nsr-teal/10 rounded-full flex items-center justify-center">
                        <span className="text-nsr-teal font-black">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-nsr-ink">{user.username}</h3>
                        {user.email && (
                          <p className="text-sm text-gray-600 brodtext">{user.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-black text-nsr-ink">{user.propertiesCount}</p>
                      <p className="text-gray-600 brodtext">Fastigheter</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-nsr-ink">{user.plansCount}</p>
                      <p className="text-gray-600 brodtext">Planeringar</p>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('sv-SE') : '-'}
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

