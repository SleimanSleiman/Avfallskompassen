import { useState, useMemo, useEffect } from 'react';
import type { AdminUser } from '../AdminPage';
import AdminPlanningEditor from './AdminPlanningEditor';
import LoadingBar from '../../components/LoadingBar';
import { get, deleteRequest } from '../../lib/api';
import { getUsersPropertiesWithWasteRooms } from '../../lib/Property';
import { currentUser } from '../../lib/Auth';
import ConfirmModal from '../../components/ConfirmModal';
import { setWasteRoomActive } from '../../lib/WasteRoomRequest'

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
  x: number; // Room x position on canvas
  y: number; // Room y position on canvas
  doors: any[];
  containers: any[];
  otherObjects: any[];
  createdBy: 'user' | 'admin';
  adminUsername?: string; // Only set if createdBy === 'admin'
  createdAt: string;
  versionName?: string;
  wasteRoomId?: number; // Added for localStorage sync
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
  isDraft?: boolean;
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
  const [loadingPlansForPropertyId, setLoadingPlansForPropertyId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProperties, setExpandedProperties] = useState<Set<number>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ planId: number; versionNumber: number; wasteRoomId: number } | null>(null);
  const [versionCounts, setVersionCounts] = useState<Map<number, number>>(new Map());

  /**
   * Helper: hämta bara fastighets-summaries för en användare (utan rooms).
   */
  const fetchPropertySummaries = async (username: string) => {
    const userProps = await getUsersPropertySummaries(username);
    const mappedProps: AdminProperty[] = userProps.map((p) => ({
      id: Number(p.id),
      userId: user.id,
      address: p.address || '',
      numberOfApartments: p.numberOfApartments || 0,
      municipalityName: p.municipalityName || (p as any).municipality || '',
      lockName: (p as any).lockName || (p as any).lockTypeDto?.name || '',
      accessPathLength: p.accessPathLength || 0,
      createdAt: p.createdAt || new Date().toISOString(),
    }));
    // initial versionsCount per property kommer direkt från backend (PropertySummaryDTO.versionsCount)
    const initialCounts = new Map<number, number>();
    userProps.forEach((p: any) => {
      if (p.id != null && typeof p.versionsCount === 'number') {
        initialCounts.set(Number(p.id), p.versionsCount);
      }
    });
    setVersionCounts(initialCounts);
    return mappedProps;
  };

  /**
   * Helper: hämta alla wasterooms för en viss fastighet när den expanderas,
   * och bygg RoomPlan-objekt endast för den fastigheten.
   */
  const fetchPlansForProperty = async (prop: AdminProperty): Promise<RoomPlan[]> => {
  const rooms = await get<any[]>(`/api/properties/${prop.id}/wasterooms`);

    const roomsByName = new Map<string, any[]>();
    (rooms || []).forEach((r: any) => {
      const roomName = r.name || 'Miljörum';
      if (!roomsByName.has(roomName)) {
        roomsByName.set(roomName, []);
      }
      roomsByName.get(roomName)!.push(r);
    });

    const plans: RoomPlan[] = [];
    roomsByName.forEach((roomVersions, roomName) => {
      if (!roomVersions || roomVersions.length === 0) return;

      const versions: PlanVersion[] = roomVersions.map((v: any) => ({
        versionNumber: v.versionNumber || 1,
        roomWidth: v.width || v.roomWidth || 0,
        roomHeight: v.length || v.roomHeight || 0,
        x: v.x ?? 150,
        y: v.y ?? 150,
        doors: v.doors || [],
        containers: v.containers || [],
        createdBy: (v.createdBy || 'user') as 'user' | 'admin',
        adminUsername: v.adminUsername,
        createdAt: v.createdAt || new Date().toISOString(),
        versionName: v.versionName,
        wasteRoomId: v.wasteRoomId || v.id,
      }));

      const hasActiveVersion = allVersions.some((v: any) => v.isActive);
      const active =
        versions.find((v) => (roomVersions.find((rv: any) => rv.versionNumber === v.versionNumber)?.isActive)) ||
        versions[versions.length - 1];
      const activeVersionNumber = active?.versionNumber || versions[versions.length - 1].versionNumber;

      const planId = Number(prop.id) * 1000 + plans.length + 1;
      const plan: RoomPlan = {
        id: planId,
        propertyId: prop.id,
        userId: user.id,
        name: roomName,
        versions: versions.sort((a, b) => a.versionNumber - b.versionNumber),
        createdAt: prop.createdAt,
        updatedAt: active?.createdAt || new Date().toISOString(),
        activeVersionNumber,
        isDraft: !hasActiveVersion,
      };
      plans.push(plan);
    });

    // uppdatera versions-count för denna fastighet
    const totalVersions = plans.reduce(
      (sum, plan) => sum + (plan.versions?.length || 0),
      0
    );
    setVersionCounts((prev) => {
      const next = new Map(prev);
      next.set(prop.id, totalVersions);
      return next;
    });

    return plans;
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const mappedProps = await fetchPropertySummaries(user.username);
        if (!mounted) return;
        setProperties(mappedProps);
        setRoomPlans([]); // room plans laddas lazy per fastighet
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

  // Filter properties based on search query
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties;
    const query = searchQuery.toLowerCase();
    return properties.filter((prop) =>
      prop.address.toLowerCase().includes(query) ||
      prop.municipalityName.toLowerCase().includes(query) ||
      prop.lockName.toLowerCase().includes(query)
    );
  }, [properties, searchQuery]);

  const toggleProperty = async (propertyId: number) => {
    // Mark this property as loading its plans
    setLoadingPlansForPropertyId(propertyId);
    setExpandedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });

    // Lazy-load plans för denna fastighet om de inte redan finns
    const existingPlans = plansByProperty.get(propertyId) || [];
    if (!existingPlans.length) {
      try {
        const prop = properties.find((p) => p.id === propertyId);
        if (!prop) return;
        const newPlans = await fetchPlansForProperty(prop);
        setRoomPlans((prev) => [...prev.filter((p) => p.propertyId !== propertyId), ...newPlans]);
      } catch (e) {
        console.warn('Failed to load room plans for property', propertyId, e);
      } finally {
        setLoadingPlansForPropertyId(null);
      }
    } else {
      // No need to load, clear loading state
      setLoadingPlansForPropertyId(null);
    }
  };

  const handleEditPlan = (plan: RoomPlan, versionNumber?: number) => {
    const defaultVersion = versionNumber ?? plan.activeVersionNumber ?? plan.versions[plan.versions.length - 1].versionNumber;
    setSelectedPlan({ ...plan, selectedVersion: defaultVersion });
  };

  const handleBackToProperties = () => {
    setSelectedPlan(null);
  };

  const handleSetActiveVersion = async (planId: number, versionNumber: number, wasteRoomId?: number) => {
    if (!wasteRoomId) return;

    // Find the plan we are activating
    const plan = roomPlans.find((p) => p.id === planId);
    if (!plan) return;

    // Set clicked version active
    await setWasteRoomActive(wasteRoomId, true);

    // Set all other versions in the same plan as inactive
    const otherVersions = plan.versions.filter((v) => v.versionNumber !== versionNumber && v.wasteRoomId);
    await Promise.all(otherVersions.map((v) => setWasteRoomActive(v.wasteRoomId!, false)));

    // Update local state
    setRoomPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        return {
          ...p,
          isDraft: false,
          activeVersionNumber: versionNumber,
          versions: p.versions.map((v) => ({
            ...v,
            isActive: v.versionNumber === versionNumber,
          })),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    setSelectedPlan((prev) =>
      prev && prev.id === planId
        ? {
            ...prev,
            isDraft: false,
            activeVersionNumber: versionNumber,
            versions: prev.versions.map((v) => ({
              ...v,
              isActive: v.versionNumber === versionNumber,
            })),
          }
        : prev
    );
  };

  const handleDeleteVersion = async (planId: number, versionNumber: number, wasteRoomId: number) => {
    if (!wasteRoomId) {
      console.error('Cannot delete version: no wasteRoomId');
      return;
    }

    try {
      await deleteRequest(`/api/wasterooms/${wasteRoomId}`);
      
      // Reload room plans för just denna fastighet
      setLoading(true);
      const prop = properties.find((p) => p.id === planId / 1000 >> 0) || null;
      if (prop) {
        const newPlans = await fetchPlansForProperty(prop);
        setRoomPlans((prev) => [...prev.filter((p) => p.propertyId !== prop.id), ...newPlans]);
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete version', error);
      alert('Kunde inte ta bort versionen. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlanVersion = async (planId: number, planData: any, adminUsername: string) => {
    // After backend save, reload all room plans to get the latest versions
    setSelectedPlan(null);
    setLoading(true);

    try {
      const prop = properties.find((p) => p.id === planId / 1000 >> 0) || null;
      if (prop) {
        const newPlans = await fetchPlansForProperty(prop);
        setRoomPlans((prev) => [...prev.filter((p) => p.propertyId !== prop.id), ...newPlans]);
      }
    } catch (e) {
      console.error('Failed to reload data after save:', e);
    } finally {
      setLoading(false);
    }
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
      <main className="mx-auto w-full max-w-7xl px-4 py-8 overflow-x-hidden">
        <div className="rounded-2xl border bg-white p-6 shadow-soft text-center">
          <LoadingBar message="Laddar fastigheter och planeringar…" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 overflow-x-hidden">
      {/* Header */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
        <button
          onClick={onBack}
          className="mb-5 flex items-center gap-2 text-nsr-teal hover:text-nsr-tealDark transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Tillbaka till användarlista</span>
        </button>
        <div>
          <h1 className="text-2xl font-black text-nsr-ink mb-5">Användarinformation</h1>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-nsr-teal/15 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-nsr-teal/20">
              <span className="text-3xl text-nsr-teal font-black">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-black text-nsr-ink mb-1">{user.username}</p>
              {user.email && (
                <p className="text-base text-gray-700 font-medium mb-2">{user.email}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-semibold">Registrerad:</span>
                <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('sv-SE') : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white shadow-soft">
        <div className="border-b border-gray-200 px-6 py-5 bg-gray-50/50">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-black text-nsr-ink">
              Fastigheter
              <span className="ml-2 text-base font-semibold text-gray-600">
                ({properties.length})
              </span>
            </h2>
            {properties.length > 0 && (
              <div className="flex-1 max-w-md min-w-[250px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Sök fastigheter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-2 focus:ring-nsr-teal/20 pl-10 pr-4 py-2.5 text-sm font-medium"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-medium">Inga fastigheter</p>
            <p className="mt-1">Användaren har inga fastigheter registrerade ännu.</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-medium">Inga fastigheter matchar sökningen</p>
            <p className="mt-1">Försök med en annan sökterm.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProperties.map((property) => {
              const plans = plansByProperty.get(property.id) || [];
              const planCount = plans.length;
              const loadedTotalVersions = plans.reduce((sum, plan) => sum + (plan.versions?.length || 0), 0);
              const totalVersions = versionCounts.get(property.id) ?? loadedTotalVersions;
              const isExpanded = expandedProperties.has(property.id);
              return (
                <div key={property.id} className="border-b border-gray-200 last:border-b-0">
                  {/* Dropdown Header */}
                  <button
                    onClick={() => toggleProperty(property.id)}
                    className={`w-full p-4 sm:p-5 text-left transition-all ${
                      isExpanded 
                        ? 'bg-nsr-teal/5 border-l-4 border-l-nsr-teal' 
                        : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-black text-nsr-ink leading-tight break-words">
                            {property.address}
                          </h3>
                          <span className={`text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap ${
                            totalVersions > 0 
                              ? 'bg-nsr-teal/15 text-nsr-teal' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {totalVersions} {totalVersions === 1 ? 'version' : 'versioner'}
                          </span>
                        </div>
                        <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
                          <span className="font-medium text-gray-700">{property.municipalityName}</span>
                          <span className="text-gray-300 hidden sm:inline">•</span>
                          <span className="text-gray-600">{property.numberOfApartments} lägenheter</span>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0 transition-transform ${
                          isExpanded ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Dropdown Content */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 bg-gray-50/50">
                      {/* Property Details Card */}
                      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                        <h4 className="text-base font-bold text-nsr-ink mb-4 pb-2 border-b border-gray-200">
                          Fastighetsinformation
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Kommun
                            </div>
                            <div className="text-sm font-semibold text-nsr-ink">
                              {property.municipalityName}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Lägenheter
                            </div>
                            <div className="text-sm font-semibold text-nsr-ink">
                              {property.numberOfApartments}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Lås
                            </div>
                            <div className="text-sm font-semibold text-nsr-ink">
                              {property.lockName}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Dragväg
                            </div>
                            <div className="text-sm font-semibold text-nsr-ink">
                              {property.accessPathLength} m
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Skapad
                          </div>
                          <div className="text-sm text-gray-700">
                            {new Date(property.createdAt).toLocaleDateString('sv-SE')}
                          </div>
                        </div>
                      </div>

                      {/* Room Plans for this property */}
                      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 pb-3 border-b border-gray-200">
                          <h4 className="text-base font-bold text-nsr-ink">
                            Miljörums-planeringar
                          </h4>
                          <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full w-fit">
                            {planCount} {planCount === 1 ? 'planering' : 'planeringar'}
                          </span>
                        </div>

                        {/* Loading state för just denna fastighets planeringar */}
                        {loadingPlansForPropertyId === property.id ? (
                          <div className="space-y-4">
                            <div className="rounded-lg border-2 border-gray-200 bg-gray-50/50 p-3 sm:p-5">
                              <div className="mb-3 h-4 w-40 rounded-full bg-gray-200 animate-pulse" />
                              <div className="mb-3 h-3 w-24 rounded-full bg-gray-100 animate-pulse" />
                              <div className="mb-4 h-16 rounded-lg bg-gray-100 animate-pulse" />
                              <div className="h-20 rounded-lg bg-gray-100 animate-pulse" />
                            </div>
                          </div>
                        ) : planCount === 0 ? (
                          <div className="py-8 text-center">
                            <p className="text-sm text-gray-500 font-medium">
                              Inga planeringar för denna fastighet
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {plans.map((plan) => {
                              // Safety check: ensure plan has versions
                              if (!plan.versions || plan.versions.length === 0) {
                                console.warn('Plan has no versions:', plan);
                                return null;
                              }

                              const activeVersion = plan.versions.find((v) => v.versionNumber === plan.activeVersionNumber) || plan.versions[plan.versions.length - 1];
                              const hasMultipleVersions = plan.versions.length > 1;
                              return (
                                <div
                                  key={plan.id}
                                  className="rounded-lg border-2 border-gray-200 bg-gray-50/50 p-3 sm:p-5 hover:border-nsr-teal/30 transition-colors"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                                        <h5 className="text-base font-bold text-nsr-ink break-words">
                                          {plan.name}
                                        </h5>
                                        {hasMultipleVersions && (
                                          <span className="text-xs font-semibold bg-nsr-teal/15 text-nsr-teal px-2.5 py-1 rounded-full whitespace-nowrap">
                                            {plan.versions.length} versioner
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Active Version Info */}
                                      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                          {plan.isDraft ? "Utkast – ingen aktiv version" : "Aktiv version"}
                                        </div>
                                        {!plan.isDraft && (
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 flex-wrap">
                                              <span className="text-sm font-bold text-nsr-ink">
                                                {activeVersion.roomWidth}m × {activeVersion.roomHeight}m
                                              </span>
                                              <span className="hidden sm:inline text-gray-300">•</span>
                                              <span className="text-sm font-medium text-gray-700">
                                                Version {activeVersion.versionNumber}
                                              </span>
                                              <span className="hidden sm:inline text-gray-300">•</span>
                                              <span className="text-xs text-gray-600 break-words">
                                                Uppdaterad:{" "}
                                                {new Date(plan.updatedAt).toLocaleDateString("sv-SE")}
                                              </span>
                                            </div>
                                          )}
                                      </div>

                                      {/* Version History */}
                                      {plan.versions.length > 0 && (
                                        <div>
                                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Alla versioner
                                          </div>
                                          <div className="space-y-2">
                                            {plan.versions.map((version) => {
                                              const isActive = version.versionNumber === plan.activeVersionNumber;
                                              return (
                                                <div
                                                  key={version.versionNumber}
                                                  className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 rounded-lg ${
                                                    isActive ? 'bg-nsr-teal/5 border border-nsr-teal/20' : 'bg-white border border-gray-200'
                                                  }`}
                                                >
                                                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                    <div
                                                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                                        version.createdBy === 'admin'
                                                          ? 'bg-nsr-accent'
                                                          : 'bg-nsr-teal'
                                                      }`}
                                                    />
                                                    <button
                                                      onClick={() => handleEditPlan(plan, version.versionNumber)}
                                                      className="text-left text-sm font-semibold text-nsr-teal hover:text-nsr-tealDark hover:underline transition-colors flex-1 min-w-0 break-words"
                                                    >
                                                      Version {version.versionNumber}
                                                      {version.versionName && (
                                                        <span className="text-gray-600 font-normal"> - {version.versionName}</span>
                                                      )}
                                                    </button>
                                                  </div>
                                                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                                    {isActive ? (
                                                      <span className="text-xs font-semibold bg-nsr-teal/20 text-nsr-teal px-2.5 py-1 rounded-full whitespace-nowrap">
                                                        Aktiv
                                                      </span>
                                                    ) : (
                                                      <button
                                                        onClick={() => handleSetActiveVersion(plan.id, version.versionNumber, version.wasteRoomId)}
                                                        className="text-xs font-semibold text-nsr-accent hover:text-nsr-accent/80 hover:underline whitespace-nowrap"
                                                      >
                                                        Gör aktiv
                                                      </button>
                                                    )}
                                                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-600 flex-wrap">
                                                      <span className={`font-semibold ${
                                                        version.createdBy === 'admin' ? 'text-nsr-accent' : 'text-nsr-teal'
                                                      }`}>
                                                        {version.createdBy === 'admin' ? 'Admin' : 'Användare'}
                                                        {version.adminUsername && version.createdBy === 'admin' && (
                                                          <span className="text-gray-500 font-normal"> ({version.adminUsername})</span>
                                                        )}
                                                      </span>
                                                      <span className="text-gray-300 hidden sm:inline">•</span>
                                                      <span className="text-gray-600 break-words">
                                                        {new Date(version.createdAt).toLocaleDateString('sv-SE')}
                                                      </span>
                                                    </div>
                                                    {currentUser()?.role === 'ADMIN' && version.wasteRoomId && !isActive && (
                                                      <button
                                                        onClick={() => setDeleteConfirm({ planId: plan.id, versionNumber: version.versionNumber, wasteRoomId: version.wasteRoomId! })}
                                                        className="flex-shrink-0 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Ta bort version"
                                                      >
                                                        <svg
                                                          className="w-4 h-4"
                                                          fill="none"
                                                          stroke="currentColor"
                                                          viewBox="0 0 24 24"
                                                          xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                          <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                          />
                                                        </svg>
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleEditPlan(plan)}
                                      className="btn-secondary-sm flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0"
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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmModal
          open={true}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteVersion(deleteConfirm.planId, deleteConfirm.versionNumber, deleteConfirm.wasteRoomId)}
          title="Ta bort version"
          message={`Är du säker på att du vill ta bort Version ${deleteConfirm.versionNumber}? Denna åtgärd kan inte ångras.`}
          confirmLabel="Ta bort"
          cancelLabel="Avbryt"
        />
      )}
    </main>
  );
}
