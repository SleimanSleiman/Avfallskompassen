import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty, deleteProperty, updateProperty,getMunicipalities, getLockTypes, getMyPropertiesWithWasteRooms } from '../lib/Property';
import type { Municipality, Property, PropertyRequest } from '../lib/Property';
import { currentUser } from '../lib/Auth';
import RoomSizePrompt from '../components/prompts/RoomSizePrompt';
import ConfirmModal from '../components/ConfirmModal';
import { deleteWasteRoom } from '../lib/WasteRoomRequest';
import Message from '../components/ShowStatus';
import LoadingBar from '../components/LoadingBar';
import PlanVersionDropdown from '../components/PlanVersionDropdown';
import type { WasteRoom } from '../lib/WasteRoom';

export default function PropertyPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [lockTypes, setLockTypes] = useState<LockType[]>([]);
    const [query, setQuery] = useState('');
    const [sortBy, setSortBy] = useState<'created'|'address'|'apartmentsAsc'|'apartmentsDesc'>('created');
    const [pendingDelete, setPendingDelete] = useState<{ id: number; address: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const lockMap: Record<string, number> = {
        Standard: 1,
        Electronic: 2,
        SuperLock: 3
    };

    //Form state
    const [formData, setFormData] = useState<PropertyRequest>({
        address: '',
        numberOfApartments: 1,
        lockTypeId: 0,
        accessPathLength: 0,
        municipalityId: 0
    });

    const navigate = useNavigate();

    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);

    const user = currentUser();

    function getMunicipalityName(id?: number) {
        if (!id) return '—';
        const m = municipalities.find((x) => x.id === id);
        return m?.name ?? '—';
    }

    //Load properties on component mount
    useEffect(() => {
        loadProperties();
        loadMunicipalities();
        loadLockTypes();
    }, []);

    async function loadMunicipalities() {
        try {
            const data = await getMunicipalities();
            setMunicipalities(data);
        } catch (err: any) {
            setError('Kunde inte ladda kommuner: ' + err.message);
        }
    }

    async function loadProperties() {
        try {
            setLoadingProperties(true);
            const data = await getMyPropertiesWithWasteRooms();
            console.log(data);
            setProperties(data);
        } catch (err: any) {
            setError('Kunde inte ladda fastigheter: ' + err.message);
        } finally {
            setLoadingProperties(false);
        }
    }

    async function loadLockTypes() {
        try {
            const data = await getLockTypes();
            setLockTypes(data);
        } catch (err: any) {
            setError("Kunde inte ladda låstyper: " + err.message);
        }
    }

    const savedProperty = localStorage.getItem('selectedPropertyId');
    const propertyId = savedProperty && savedProperty !== 'undefined' && savedProperty !== 'null'
        ? Number(savedProperty)
        : null;
    
    const filteredProperties = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = properties.filter(p =>
            !q || p.address.toLowerCase().includes(q) || getMunicipalityName(p.municipalityId).toLowerCase().includes(q)
        );
        switch (sortBy) {
            case 'address':
                list = [...list].sort((a,b) => a.address.localeCompare(b.address));
                break;
            case 'apartmentsAsc':
                list = [...list].sort((a,b) => (a.numberOfApartments || 0) - (b.numberOfApartments || 0));
                break;
            case 'apartmentsDesc':
                list = [...list].sort((a,b) => (b.numberOfApartments || 0) - (a.numberOfApartments || 0));
                break;
            default:
                list = [...list].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return list;
    }, [properties, query, sortBy, municipalities]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);
        setError(null);
        setLoading(true);

        if (!formData.municipalityId || formData.municipalityId === 0) {
            setLoading(false);
            setError('Du måste välja kommun');
            return;
        }

        try {
            let response;
            if (editingId) {
                response = await updateProperty(editingId, formData);
            } else {
                response = await createProperty(formData);
            }

            if (response.success) {
                setMsg(editingId ? 'Fastighet uppdaterad!' : 'Fastighet skapad framgångsrikt!');
                setError(null);
                // reset form
                setFormData({
                    address: '',
                    numberOfApartments: 1,
                    lockTypeId: 1,
                    accessPathLength: 0,
                    municipalityId : 0
                });
                setShowForm(false);
                setEditingId(null);
                // Reload the properties list
                await loadProperties();
            } else {
                setError(response.message || (editingId ? 'Kunde inte uppdatera fastighet' : 'Kunde inte skapa fastighet'));
                setMsg(null);
            }
        } catch (err: any) {
            setError(err.message || 'Något gick fel');
        } finally {
            setLoading(false);
        }
    }

    function requestDelete(id: number, address: string) {
        setPendingDelete({ id, address });
    }

    async function confirmDelete() {
        if (!pendingDelete) return;
        setDeleting(true);
        setMsg(null);
        setError(null);
        try {
            const response = await deleteProperty(pendingDelete.id);
            if (response.success) {
                setMsg('Fastighet borttagen');
                await loadProperties();
            } else {
                setError(response.message || 'Kunde inte ta bort fastighet');
            }
        } catch (err: any) {
            setError(err.message || 'Kunde inte ta bort fastighet');
        } finally {
            setDeleting(false);
            setPendingDelete(null);
        }
    }

    function handleEdit(p: Property) {
        setEditingId(p.id);
        setFormData({
            address: p.address,
            numberOfApartments: p.numberOfApartments,
            lockTypeId: p.lockTypeId,
            accessPathLength: p.accessPathLength ?? 0,
            municipalityId: p.municipalityId ?? 0
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function createWasteRoom(p: Property) {
        setSelectedProperty(p);
        setIsCreateRoomOpen(true);
    }

    function openRoomVersion(propertyData: Property, room: WasteRoom) {
        if (!propertyData?.id || !room) return;

        const normalizedContainers = (room.containers ?? []).map((c: any, index: number) => {
            const fallbackContainer = {
                id: c?.id ?? index + 1,
                name: c?.containerDTO?.name ?? 'Behållare',
                size: c?.containerDTO?.size ?? 0,
                width: c?.containerDTO?.width ?? 1,
                depth: c?.containerDTO?.depth ?? 1,
                height: c?.containerDTO?.height ?? 1,
                imageFrontViewUrl: c?.containerDTO?.imageFrontViewUrl ?? '',
                imageTopViewUrl: c?.containerDTO?.imageTopViewUrl ?? '/images/containers/defaultTopView.png',
                emptyingFrequencyPerYear: c?.containerDTO?.emptyingFrequencyPerYear ?? 0,
                cost: c?.containerDTO?.cost ?? 0,
            };

            return {
                ...c,
                containerDTO: c?.containerDTO ?? fallbackContainer,
            };
        });

        const normalizedRoom = {
            ...room,
            propertyId: propertyData.id,
            property: room.property ?? propertyData,
            wasteRoomId: room.wasteRoomId ?? room.id,
            containers: normalizedContainers,
            doors: room.doors ?? [],
        };

        localStorage.setItem('enviormentRoomData', JSON.stringify(normalizedRoom));
        localStorage.setItem('selectedPropertyId', String(propertyData.id));
        localStorage.setItem('selectedProperty', JSON.stringify({ propertyId: propertyData.id }));
        localStorage.setItem('selectedPropertyAddress', propertyData.address);

        window.location.href = '/planningTool';
    }

    function handleInputChange(field: keyof PropertyRequest, value: string | number) {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }

async function onDeleteWasteRoom(propertyId: number, wasteRoomId: number) {
    try {
        await deleteWasteRoom(wasteRoomId);

        setProperties(prev => {
            return prev.map(p => {
                if (p.id !== propertyId) return p;
                const updatedRooms = (p.wasteRooms ?? []).filter(r => r.wasteRoomId !== wasteRoomId);
                return { ...p, wasteRooms: updatedRooms };
            });
        });
    } catch (err) {
        console.error('Could not delete waste room', err);
    }
}
  function viewStatistics(p: Property) {
    navigate(`/statistics/${p.id}`, {
      state: { propertyName: p.address,
          numberOfApartments: p.numberOfApartments}
    });
  }

  useEffect(() => {
  async function checkManual() {
    const user = currentUser();
    if (!user?.username || !user?.token) return;

    const res = await fetch(`/api/user/${user.username}/has-seen-manual`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${user.token}`,
        "Content-Type": "application/json"
      }
    });

    if (res.ok) {
      const hasSeen = await res.json();
      localStorage.setItem("hasSeenPlanningToolManual", hasSeen ? "true" : "false");
    }
  }

  checkManual();
}, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <ConfirmModal
        open={!!pendingDelete}
        title="Bekräfta borttagning"
        message={pendingDelete ? `Är du säker på att du vill ta bort fastigheten "${pendingDelete.address}"?` : ''}
        confirmLabel="Ta bort"
        cancelLabel="Avbryt"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft">
        <div className="mb-3">
          <h1 className="h1">Mina Fastigheter</h1>
          <p className="mt-2 text-gray-600">
            Välkommen {user?.username}! Hantera dina fastigheter här.
          </p>
        </div>
        <div className="mb-0 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full gap-3 md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="Sök på adress eller kommun"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border-gray-300 shadow-sm pl-10 pr-3 py-2 focus:border-nsr-teal focus:ring-nsr-teal"
              />
              <svg className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd"/></svg>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
            >
            <option value="created">Senaste</option>
            <option value="address">Adress A–Ö</option>
            <option value="apartmentsAsc">Stigande antal</option>
            <option value="apartmentsDesc">Fallande antal</option>
            </select>
          </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="w-full md:w-auto flex items-center justify-between p-3 rounded-xl2 border border-nsr-teal bg-white text-nsr-teal hover:bg-gray-50 transition text-left"
                    >
                        <span className="font-medium">{showForm ? 'Avbryt' : 'Lägg till fastighet'}</span>
                        {!showForm && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Messages */}
            <Message message={msg} type="success" />
            <Message message={error} type="error" />

            {/* Property Form */}
            {showForm && (
                <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft">
                    <h2 className="mb-6 text-xl font-semibold">
                        {editingId ? 'Redigera fastighet' : 'Lägg till ny fastighet'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium mb-2">
                                    Adress *
                                </label>
                                <input
                                    id="address"
                                    type="text"
                                    required
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder="t.ex. Storgatan 123"
                                />
                            </div>

              <div>
                <label htmlFor="municipalityId" className="block text-sm font-medium mb-2">
                  Kommun *
                </label>
                <select
                  id="municipalityId"
                  required
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                  value={formData.municipalityId}
                  onChange={(e) => handleInputChange('municipalityId', parseInt(e.target.value))}
                >
                  <option value={0}>Välj kommun</option>
                      {municipalities.map((m) => (
                        <option
                          key={m.id}
                          value={m.id}
                          disabled={m.name.toLowerCase() !== 'helsingborg'}
                        >
                          {m.name}
                        </option>
                      ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="apartments" className="block text-sm font-medium mb-2">
                  Antal lägenheter *
                </label>
                <input
                  id="apartments"
                  type="number"
                  required
                  min="1"
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                  value={formData.numberOfApartments}
                  onChange={(e) => handleInputChange('numberOfApartments', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <label htmlFor="lockTypeId" className="block text-sm font-medium mb-2">
                  Typ av lås för miljörum *
                </label>
                <select
                  id="lockTypeId"
                  required
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                  value={formData.lockTypeId}
                  onChange={(e) => handleInputChange('lockTypeId', parseInt(e.target.value))}
                >
                  <option value={0}> Välj låstyp</option>
                  {lockTypes.map((lt) => (
                      <option key={lt.id} value={lt.id}>
                      {lt.name}
                      </option>
                      ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="accessPath" className="block text-sm font-medium mb-2">
                  Dragvägslängd (meter) *
                </label>
                <input
                  id="accessPath"
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                  value={formData.accessPathLength}
                  onChange={(e) => handleInputChange('accessPathLength', parseFloat(e.target.value))}
                  placeholder="0.0"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-60"
              >
                  {loading 
                      ? editingId ? 'Uppdaterar...' : 'Skapar...'
                      : editingId ? 'Uppdatera fastighet' : 'Skapa fastighet'
                  }
              </button>
              <button
                type="button"
                onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      address: '',
                      numberOfApartments: 1,
                      lockTypeId: 1,
                      accessPathLength: 0,
                      municipalityId: municipalities.length > 0 ? municipalities[0].id : 0
                    });
                  }}
                className="btn-secondary"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Properties List */}
      <div className="rounded-2xl border bg-white shadow-soft">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Dina fastigheter ({filteredProperties.length})</h2>
        </div>
        
       <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                           {loadingProperties ? (
                               <div className="col-span-full py-12">
                                   <LoadingBar message="Laddar fastigheter..." />
                               </div>
                           ) : filteredProperties.length === 0 ? (
                               <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-gray-500">
                                   <div className="mb-4">
                                       <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                       </svg>
                                   </div>
                                   <p className="text-lg font-medium">Inga fastigheter ännu</p>
                                   <p className="mt-1">Klicka på "Lägg till fastighet" för att komma igång.</p>
                               </div>
                           ) : (
                               filteredProperties.map((property) => (
                                  <div key={property.id} className="rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-gray-900">{property.address}</h3>
                    <div className="mt-2 grid gap-y-1 text-sm text-gray-700">
                      <div><span className="text-gray-500">Kommun:</span> {getMunicipalityName(property.municipalityId)}</div>
                      <div><span className="text-gray-500">Lägenheter:</span> {property.numberOfApartments}</div>
                      <div><span className="text-gray-500">Lås:</span> {property.lockName ?? 'Ingen'}</div>
                      <div><span className="text-gray-500">Dragväg:</span> {property.accessPathLength}</div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">Skapad: {new Date(property.createdAt).toLocaleDateString('sv-SE')}</div>
                      {/* ===== Waste Rooms Section ===== */}
                      <div className="mt-3">
                        
                      </div>
                      {/* ===== End Waste Rooms Section ===== */}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="flex-shrink-0 basis-full sm:basis-auto">
                    <PlanVersionDropdown
                      rooms={property.wasteRooms}
                      propertyAddress={property.address}
                      onOpenVersion={(room) => openRoomVersion(property, room)}
                    />
                  </div>
                    <button
                        className="btn-secondary-sm"
                        onClick={() => {
                            localStorage.setItem("selectedPropertyAddress", property.address);
                            window.location.href = `/allWasteroom/${property.id}`;
                        }}
                    >
                        Visa alla miljörum
                    </button>
                  <button className="btn-secondary-sm" onClick={() => createWasteRoom(property)}>Skapa miljörum</button>
                  <button className="btn-secondary-sm" onClick={() => handleEdit(property)}>Redigera</button>
                  <button
                    className="btn-secondary-sm"
                    type="button"
                    onClick={() => viewStatistics(property)}
                  >
                    Se rapport
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-xl2 px-3 py-1 text-sm font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                    onClick={() => requestDelete(property.id, property.address)}
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            ))
        )}
          </div>
      </div>

      {isCreateRoomOpen && (
        <RoomSizePrompt
          onConfirm={(name: string, length: number, width: number) => {
            localStorage.setItem(
              'enviormentRoomData',
              JSON.stringify({ name, height: length, width: width })
            );
            localStorage.setItem('selectedProperty', JSON.stringify({ propertyId: selectedProperty?.id }));
            localStorage.setItem('selectedPropertyId', String(selectedProperty?.id));

            setIsCreateRoomOpen(false);
            window.location.href = '/planningTool';
          }}
          onCancel={() => setIsCreateRoomOpen(false)}
        />
      )}
    </main>
  );
} 
