import { useState, useMemo, useEffect } from 'react';
import type { AdminUser } from '../AdminPage';
import AdminPlanningEditor from './AdminPlanningEditor';
import { get } from '../../lib/api';
import { getPropertiesWithWasteRooms, getUsersPropertiesWithWasteRooms } from '../../lib/Property';

// Data types
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

export type PlanVersion = {
  versionNumber: number;
  roomWidth: number;
  roomHeight: number;
  doors: any[];
  containers: any[];
  createdBy: 'user' | 'admin';
  adminUsername?: string; // Only set if createdBy === 'admin'
  createdAt: string;
  versionName?: string;
};

export type RoomPlan = {
  id: number;
  propertyId: number;
  userId: number;
  name: string;
  versions: PlanVersion[]; // Array of versions, max 6
  createdAt: string;
  updatedAt: string;
  activeVersionNumber: number;
  selectedVersion?: number; // Optional: which version is currently being edited
};


type AdminUserDetailProps = {
  user: AdminUser;
  onBack: () => void;
};

export default function AdminUserDetail({ user, onBack }: AdminUserDetailProps) {
  const [selectedPlan, setSelectedPlan] = useState<RoomPlan | null>(null);
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [roomPlans, setRoomPlans] = useState<RoomPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // Fetch all properties (admin endpoint) and filter by creator username
        //const allProps = await get<any[]>('/api/properties');
        //const userProps = allProps.filter((p) => p.createdByUsername === user.username);

        console.log("This is the username - ", user.username);
        const userProps = await getUsersPropertiesWithWasteRooms(user.username);
        console.log(userProps);

        const mappedProps: AdminProperty[] = userProps.map((p) => ({
          id: Number(p.id),
          userId: user.id,
          address: p.address || '',
          numberOfApartments: p.numberOfApartments || 0,
          municipalityName: p.municipalityName || p.municipality || '',
          lockName: (p.lockTypeDto && p.lockTypeDto.name) || p.lockName || '',
          accessPathLength: p.accessPathLength || 0,
          createdAt: p.createdAt || new Date().toISOString(),
        }));

        // For each property, map waste rooms and build simple RoomPlan objects
        const plans: RoomPlan[] = [];
        await Promise.all(
          mappedProps.map(async (prop, idx) => {
            try {
               const originalProp = userProps[idx];
              const rooms = originalProp.wasteRooms || [];
              (rooms || []).forEach((r: any, idx: number) => {
                const planId = prop.id * 1000 + (idx + 1);
                const plan: RoomPlan = {
                  id: planId,
                  propertyId: prop.id,
                  userId: user.id,
                  name: r.name || `Miljörum ${idx + 1}`,
                  versions: [
                    {
                      versionNumber: 1,
                      roomWidth: r.length || r.roomWidth || 0,
                      roomHeight: r.width || r.roomHeight || 0,
                      doors: r.doors || [],
                      containers: r.containers || [],
                      createdBy: 'user',
                      createdAt: r.createdAt || new Date().toISOString(),
                    },
                  ],
                  createdAt: prop.createdAt,
                  updatedAt: new Date().toISOString(),
                  activeVersionNumber: 1,
                };
                plans.push(plan);
              });
            } catch (e) {
              console.warn('Failed to fetch wasterooms for property', prop.id, e);
            }
          })
        );

        if (!mounted) return;
        setProperties(mappedProps);
        setRoomPlans(plans);
      } catch (e) {
        console.error('Failed to load properties/room plans for admin detail', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [user]);

  const plansByProperty = useMemo(() => {
    const map = new Map<number, RoomPlan[]>();
    roomPlans.forEach((plan) => {
      const existing = map.get(plan.propertyId) || [];
      map.set(plan.propertyId, [...existing, plan]);
    });
    return map;
  }, [roomPlans]);

  const handleEditPlan = (plan: RoomPlan, versionNumber?: number) => {
    const defaultVersion = versionNumber ?? plan.activeVersionNumber ?? plan.versions[plan.versions.length - 1].versionNumber;
    setSelectedPlan({ ...plan, selectedVersion: defaultVersion });
  };

  const handleBackToProperties = () => {
    setSelectedPlan(null);
  };

  const handleSetActiveVersion = (planId: number, versionNumber: number) => {
    setRoomPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? { ...plan, activeVersionNumber: versionNumber, updatedAt: new Date().toISOString() }
          : plan
      )
    );
    setSelectedPlan((prev) =>
      prev && prev.id === planId
        ? { ...prev, activeVersionNumber: versionNumber }
        : prev
    );
  };

  const handleSavePlanVersion = (planId: number, planData: any, adminUsername: string) => {
    // In real implementation, this would save to backend
    setRoomPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;

        const currentVersions = plan.versions || [];
        const latestVersion = currentVersions[currentVersions.length - 1];
        const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

        // Create new version
        const newVersion: PlanVersion = {
          versionNumber: newVersionNumber,
          roomWidth: planData.roomWidth || latestVersion?.roomWidth || plan.versions[0].roomWidth,
          roomHeight: planData.roomHeight || latestVersion?.roomHeight || plan.versions[0].roomHeight,
          doors: planData.doors || latestVersion?.doors || [],
          containers: planData.containers || latestVersion?.containers || [],
          createdBy: 'admin',
          adminUsername: adminUsername,
          createdAt: new Date().toISOString(),
          versionName: planData.versionName,
        };

        let updatedVersions: PlanVersion[];
        
        if (currentVersions.length >= 6 && planData.versionToReplace) {
          // Replace the selected version
          updatedVersions = currentVersions
            .filter(v => v.versionNumber !== planData.versionToReplace)
            .concat(newVersion)
            .sort((a, b) => a.versionNumber - b.versionNumber); // Keep sorted by version number
        } else if (currentVersions.length >= 6) {
          // Fallback: remove oldest if no version specified (shouldn't happen with new UI)
          updatedVersions = [...currentVersions, newVersion].slice(-6);
        } else {
          // Just add the new version
          updatedVersions = [...currentVersions, newVersion];
        }

        const updatedPlan = {
          ...plan,
          versions: updatedVersions,
          activeVersionNumber: newVersionNumber,
          updatedAt: new Date().toISOString(),
        };

        return updatedPlan;
      })
    );
    setSelectedPlan(null);
  };

  if (selectedPlan) {
    return (
      <AdminPlanningEditor
        plan={selectedPlan}
        property={properties.find((p) => p.id === selectedPlan.propertyId)!}
        user={user}
        onSave={(planData, adminUsername) => handleSavePlanVersion(selectedPlan.id, planData, adminUsername)}
        onBack={handleBackToProperties}
      />
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-6 shadow-soft text-center">Laddar fastigheter och planeringar…</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-nsr-teal hover:text-nsr-tealDark transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Tillbaka till användarlista</span>
        </button>
        <div className="mb-3">
          <h1 className="h1 rubriktext">Användarinformation</h1>
              <div className="mt-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-nsr-teal/10 rounded-full flex items-center justify-center">
              <span className="text-2xl text-nsr-teal font-black">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xl font-black text-nsr-ink">{user.username}</p>
              {user.email && <p className="text-gray-600 brodtext">{user.email}</p>}
              <p className="mt-1 text-sm text-gray-500">
                Registrerad: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('sv-SE') : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="mb-8 rounded-2xl border bg-white shadow-soft">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-black text-nsr-ink">
            Fastigheter ({properties.length})
          </h2>
        </div>

        {properties.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-medium">Inga fastigheter</p>
            <p className="mt-1">Användaren har inga fastigheter registrerade ännu.</p>
          </div>
        ) : (
          <div className="divide-y">
            {properties.map((property) => {
              const plans = plansByProperty.get(property.id) || [];
              return (
                <div key={property.id} className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-nsr-ink">{property.address}</h3>
                    <div className="mt-2 grid gap-y-1 text-sm text-gray-700 sm:grid-cols-2">
                      <div>
                        <span className="text-gray-500">Kommun:</span> {property.municipalityName}
                      </div>
                      <div>
                        <span className="text-gray-500">Lägenheter:</span> {property.numberOfApartments}
                      </div>
                      <div>
                        <span className="text-gray-500">Lås:</span> {property.lockName}
                      </div>
                      <div>
                        <span className="text-gray-500">Dragväg:</span> {property.accessPathLength} m
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Skapad: {new Date(property.createdAt).toLocaleDateString('sv-SE')}
                    </div>
                  </div>

                  {/* Room Plans for this property */}
                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h4 className="mb-3 text-sm font-black text-nsr-ink">
                      Miljörums-planeringar ({plans.length})
                    </h4>
                    {plans.length === 0 ? (
                      <p className="text-sm text-gray-500">Inga planeringar för denna fastighet</p>
                    ) : (
                      <div className="space-y-3">
                        {plans.map((plan) => {
                          const activeVersion = plan.versions.find((v) => v.versionNumber === plan.activeVersionNumber) || plan.versions[plan.versions.length - 1];
                          const hasMultipleVersions = plan.versions.length > 1;
                          return (
                            <div
                              key={plan.id}
                              className="rounded-lg border border-gray-200 bg-white p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="font-medium text-nsr-ink">{plan.name}</p>
                                    {hasMultipleVersions && (
                                      <span className="text-xs bg-nsr-teal/10 text-nsr-teal px-2 py-0.5 rounded-full font-medium">
                                        {plan.versions.length} versioner
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-1.5">
                                    <p className="text-xs text-gray-600">
                                      Aktiv version: {activeVersion.roomWidth}m × {activeVersion.roomHeight}m • 
                                      Version {activeVersion.versionNumber} • 
                                      Uppdaterad: {new Date(plan.updatedAt).toLocaleDateString('sv-SE')}
                                    </p>
                                    {/* Version History */}
                                    <div className="mt-2 space-y-1">
                                      {plan.versions.map((version) => {
                                        const isActive = version.versionNumber === plan.activeVersionNumber;
                                        return (
                                          <div
                                            key={version.versionNumber}
                                            className="flex items-center gap-2 text-xs"
                                          >
                                            <div
                                              className={`w-2 h-2 rounded-full ${
                                                version.createdBy === 'admin'
                                                  ? 'bg-nsr-accent'
                                                  : 'bg-nsr-teal'
                                              }`}
                                            />
                                            <button
                                              onClick={() => handleEditPlan(plan, version.versionNumber)}
                                              className="text-left hover:underline text-nsr-teal font-medium hover:text-nsr-tealDark transition-colors"
                                            >
                                              Version {version.versionNumber}
                                              {version.versionName && ` - ${version.versionName}`}
                                            </button>
                                            {isActive ? (
                                              <span className="text-xs bg-nsr-teal/20 text-nsr-teal px-2 py-0.5 rounded-full font-medium">Aktiv</span>
                                            ) : (
                                              <button
                                                onClick={() => handleSetActiveVersion(plan.id, version.versionNumber)}
                                                className="text-xs text-nsr-accent hover:underline font-medium"
                                              >
                                                Gör aktiv
                                              </button>
                                            )}
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-500">
                                              {version.createdBy === 'admin' ? (
                                                <>
                                                  <span className="font-medium text-nsr-accent">Admin</span>
                                                  {version.adminUsername && (
                                                    <> ({version.adminUsername})</>
                                                  )}
                                                </>
                                              ) : (
                                                <span className="font-medium text-nsr-teal">Användare</span>
                                              )}
                                            </span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-500">
                                              {new Date(version.createdAt).toLocaleDateString('sv-SE')}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleEditPlan(plan)}
                                  className="btn-secondary-sm ml-4"
                                >
                                  Redigera
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

