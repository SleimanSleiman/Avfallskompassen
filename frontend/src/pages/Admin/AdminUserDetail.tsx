import { useState, useMemo } from 'react';
import type { AdminUser } from '../AdminPage';
import AdminPlanningEditor from './AdminPlanningEditor';

// Mock data types
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

// Mock data 
const getMockProperties = (userId: number): AdminProperty[] => {
  const baseProperties: AdminProperty[] = [
    {
      id: userId * 10 + 1,
      userId,
      address: 'Storgatan 123',
      numberOfApartments: 12,
      municipalityName: 'Helsingborg',
      lockName: 'Standard',
      accessPathLength: 5.5,
      createdAt: '2024-01-20T10:00:00Z',
    },
    {
      id: userId * 10 + 2,
      userId,
      address: 'Kungsgatan 45',
      numberOfApartments: 8,
      municipalityName: 'Helsingborg',
      lockName: 'Electronic',
      accessPathLength: 3.2,
      createdAt: '2024-02-15T14:30:00Z',
    },
    {
      id: userId * 10 + 3,
      userId,
      address: 'Drottninggatan 78',
      numberOfApartments: 20,
      municipalityName: 'Höganäs',
      lockName: 'SuperLock',
      accessPathLength: 8.0,
      createdAt: '2024-03-10T09:15:00Z',
    },
  ];
  return baseProperties.slice(0, Math.min(3, userId % 3 + 1));
};

const getMockRoomPlans = (propertyId: number, userId: number): RoomPlan[] => {
  return [
    {
      id: propertyId * 100 + 1,
      propertyId,
      userId,
      name: 'Miljörum 1',
      versions: [
        {
          versionNumber: 1,
          roomWidth: 10,
          roomHeight: 8,
          doors: [],
          containers: [],
          createdBy: 'user',
          createdAt: '2024-01-25T10:00:00Z',
        },
        {
          versionNumber: 2,
          roomWidth: 10,
          roomHeight: 8,
          doors: [],
          containers: [],
          createdBy: 'admin',
          adminUsername: 'admin.smith',
          createdAt: '2024-02-10T14:30:00Z',
          versionName: 'Optimerad layout',
        },
        {
          versionNumber: 3,
          roomWidth: 11,
          roomHeight: 8,
          doors: [],
          containers: [],
          createdBy: 'admin',
          adminUsername: 'admin.erl',
          createdAt: '2024-03-05T09:00:00Z',
          versionName: 'Extra kärl',
        },
        {
          versionNumber: 4,
          roomWidth: 11,
          roomHeight: 8.5,
          doors: [],
          containers: [],
          createdBy: 'user',
          createdAt: '2024-03-18T16:20:00Z',
        },
        {
          versionNumber: 5,
          roomWidth: 12,
          roomHeight: 8.5,
          doors: [],
          containers: [],
          createdBy: 'admin',
          adminUsername: 'admin.karin',
          createdAt: '2024-04-02T11:45:00Z',
          versionName: 'Breddad passage',
        },
        {
          versionNumber: 6,
          roomWidth: 12,
          roomHeight: 9,
          doors: [],
          containers: [],
          createdBy: 'admin',
          adminUsername: 'admin.smith',
          createdAt: '2024-04-22T08:10:00Z',
          versionName: 'Aktiv lösning',
        },
      ],
      createdAt: '2024-01-25T10:00:00Z',
      updatedAt: '2024-02-10T14:30:00Z',
      activeVersionNumber: 6,
    },
    {
      id: propertyId * 100 + 2,
      propertyId,
      userId,
      name: 'Miljörum 2',
      versions: [
        {
          versionNumber: 1,
          roomWidth: 12,
          roomHeight: 10,
          doors: [],
          containers: [],
          createdBy: 'user',
          createdAt: '2024-02-20T11:00:00Z',
        },
        {
          versionNumber: 2,
          roomWidth: 12,
          roomHeight: 10.5,
          doors: [],
          containers: [],
          createdBy: 'admin',
          adminUsername: 'admin.louise',
          createdAt: '2024-03-12T13:30:00Z',
          versionName: 'Sopsug test',
        },
        {
          versionNumber: 3,
          roomWidth: 12.5,
          roomHeight: 10.5,
          doors: [],
          containers: [],
          createdBy: 'admin',
          adminUsername: 'admin.smith',
          createdAt: '2024-04-01T08:45:00Z',
        },
        {
          versionNumber: 4,
          roomWidth: 13,
          roomHeight: 10.5,
          doors: [],
          containers: [],
          createdBy: 'user',
          createdAt: '2024-04-18T17:05:00Z',
        },
        {
          versionNumber: 5,
          roomWidth: 13,
          roomHeight: 11,
          doors: [],
          containers: [],
          createdBy: 'admin',
          adminUsername: 'admin.karin',
          createdAt: '2024-05-03T09:15:00Z',
        },
        {
          versionNumber: 6,
          roomWidth: 13.5,
          roomHeight: 11,
          doors: [],
          containers: [],
          createdBy: 'admin',
          adminUsername: 'admin.louise',
          createdAt: '2024-05-24T15:25:00Z',
          versionName: 'Slutlig lösning',
        },
      ],
      createdAt: '2024-02-20T11:00:00Z',
      updatedAt: '2024-02-20T11:00:00Z',
      activeVersionNumber: 6,
    },
  ];
};

type AdminUserDetailProps = {
  user: AdminUser;
  onBack: () => void;
};

export default function AdminUserDetail({ user, onBack }: AdminUserDetailProps) {
  const [selectedPlan, setSelectedPlan] = useState<RoomPlan | null>(null);
  const [properties] = useState<AdminProperty[]>(() => getMockProperties(user.id));
  const [roomPlans, setRoomPlans] = useState<RoomPlan[]>(() => {
    const allPlans: RoomPlan[] = [];
    properties.forEach((prop) => {
      allPlans.push(...getMockRoomPlans(prop.id, user.id));
    });
    return allPlans;
  });

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
                Registrerad: {new Date(user.createdAt).toLocaleDateString('sv-SE')}
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

