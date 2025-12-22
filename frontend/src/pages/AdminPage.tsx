import { useState, useMemo, useEffect } from 'react';
import AdminUserDetail from './Admin/AdminUserDetail';
import { getUserStats } from '../lib/Property';
import LoadingBar from '../components/LoadingBar';

// Data types
export type AdminUser = {
  id: number;
  username: string;
  role: "USER" | "ADMIN";
  email?: string;
  createdAt?: string | null;
  propertiesCount: number;
  plansCount: number;
};

type UserStats = {
  userId: number;
  username: string;
  role: string;
  createdAt: string;
  propertiesCount: number;
  wasteRoomsCount: number;
};

type BackendUser = {
  id: number;
  username: string;
  role: "USER" | "ADMIN";
  createdAt?: string;
  propertiesCount: number;
  wasteRoomsCount: number;
};

type PropertyDTO = { 
  id: number; 
  createdByUsername?: string;
  address?: string;
  municipalityName?: string;
};

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
  const [loading, setLoading] = useState(true);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [userStats, setUserStats] = useState<UserStats[]>([]);


  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const userStats = await getUserStats();
        console.log(userStats);

        let numOfProperties = 0;
        for(const row of userStats) {
          numOfProperties += row.propertiesCount;
        }
        setPropertiesCount(numOfProperties);

        const mapped: AdminUser[] = userStats.map((user) => ({
          id: user.userId ?? user.id ?? 0,
          username: user.username ?? "",
          role: user.role as "USER" | "ADMIN",
          createdAt: user.createdAt || null,
          propertiesCount: user.propertiesCount ?? 0,
          plansCount: user.wasteRoomsCount ?? 0,
        }));

        setUsers(mapped);
      } catch (e) {
        console.error('Failed to load admin data', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter users by username/email when searching
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => 
      u.username.toLowerCase().includes(q) || 
      (u.email || '').toLowerCase().includes(q)
    );
  }, [searchQuery, users]);

  // Filter properties by address or municipality when searching
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return users.filter((p) => {
      const address = (p.address || '').toLowerCase();
      const municipality = (p.municipalityName || '').toLowerCase();
      // Only include if address or municipality actually contains the search term
      return (address.length > 0 && address.includes(q)) || (municipality.length > 0 && municipality.includes(q));
    });
  }, [searchQuery, users]);

  // Group filtered properties by user
  const propertiesByUser = useMemo(() => {
    const map = new Map<string, PropertyDTO[]>();
    filteredProperties.forEach((prop) => {
      const username = prop.createdByUsername || '';
      if (username) {
        if (!map.has(username)) map.set(username, []);
        map.get(username)!.push(prop);
      }
    });
    return map;
  }, [filteredProperties]);

  // Get users that have matching properties
  const usersWithMatchingProperties = useMemo(() => {
    if (!searchQuery.trim() || propertiesByUser.size === 0) return [];
    return users.filter((u) => propertiesByUser.has(u.username));
  }, [searchQuery, users, propertiesByUser]);

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
      <main className="mx-auto w-full max-w-7xl px-4 py-8 overflow-x-hidden">
        <div className="rounded-2xl border bg-white p-6 shadow-soft text-center">
          <LoadingBar message="Laddar användardata…" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 overflow-x-hidden">
      {/* Header */}
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft">
        <div className="mb-3">
          <h1 className="h1 rubriktext">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 brodtext">
            Hantera användare, fastigheter och miljörums-planeringar
          </p>
        </div>
        <div className="mt-4">
          <a
            href="/admin/data"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-soft transition"
            style={{ backgroundColor: "#e8c222", color: "#111827" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Hantera Priser och Kostnader
          </a>
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
                {propertiesCount}
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
      <div className="mb-8 rounded-2xl border bg-white p-4 sm:p-6 shadow-soft">
        <h2 className="mb-4 text-lg sm:text-xl font-black text-nsr-ink">Sök efter användare eller fastigheter</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Sök på användarnamn"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-gray-300 shadow-sm pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base focus:border-nsr-teal focus:ring-nsr-teal"
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

      {/* Property Search Results - Only shown when searching for properties */}
      {searchQuery.trim() && usersWithMatchingProperties.length > 0 && (
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white shadow-soft">
          <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50">
            <h2 className="text-lg sm:text-xl font-black text-nsr-ink break-words">
              Sökresultat - Fastigheter ({usersWithMatchingProperties.length} {usersWithMatchingProperties.length === 1 ? 'användare' : 'användare'})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {usersWithMatchingProperties.map((user) => {
              // Only get the filtered properties that match the search
              const userProperties = propertiesByUser.get(user.username) || [];
              return (
                <div key={user.id} className="p-4 sm:p-6">
                  {/* User Header */}
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-nsr-ink mb-1">Användare</h3>
                    <div
                      className="p-3 sm:p-4 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100/50 transition-colors cursor-pointer"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-nsr-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-nsr-teal font-black">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm sm:text-base font-bold text-nsr-ink break-words">{user.username}</h4>
                            {user.email && (
                              <p className="text-xs sm:text-sm text-gray-600 break-words">{user.email}</p>
                            )}
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
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

                  {/* Properties Section - Only matching properties */}
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-nsr-ink mb-3">
                      Fastigheter ({userProperties.length} {userProperties.length === 1 ? 'match' : 'match'})
                    </h4>
                    <div className="space-y-2">
                      {userProperties.map((property) => (
                        <div
                          key={property.id}
                          className="p-3 rounded-lg border border-gray-200 bg-white hover:border-nsr-teal/30 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm sm:text-base text-nsr-ink break-words">{property.address || 'Okänd adress'}</p>
                              {property.municipalityName && (
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 break-words">{property.municipalityName}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Users List - Only shown when not searching or when searching for users (not properties) */}
      {(!searchQuery.trim() || (filteredUsers.length > 0 && usersWithMatchingProperties.length === 0)) && (
        <div className="rounded-2xl border bg-white shadow-soft">
          <div className="border-b px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-lg sm:text-xl font-black text-nsr-ink">
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
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-nsr-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-nsr-teal font-black">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-black text-nsr-ink break-words">{user.username}</h3>
                          {user.email && (
                            <p className="text-xs sm:text-sm text-gray-600 brodtext break-words">{user.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-6 text-sm flex-wrap">
                      <div className="text-center">
                        <p className="font-black text-nsr-ink">{user.propertiesCount}</p>
                        <p className="text-gray-600 brodtext text-xs sm:text-sm">Fastigheter</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-nsr-ink">{user.plansCount}</p>
                        <p className="text-gray-600 brodtext text-xs sm:text-sm">Planeringar</p>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('sv-SE') : '-'}
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0 ml-auto sm:ml-0"
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
      )}
    </main>
  );
}