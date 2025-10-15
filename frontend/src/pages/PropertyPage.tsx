import { useState, useEffect } from 'react';
import { createProperty, getMyProperties, deleteProperty, updateProperty } from '../lib/property';
import type { Property } from '../lib/property';
import type { PropertyRequest } from '../lib/property';
import { currentUser } from '../lib/auth';
import RoomSizePrompt from '../components/RoomSizePrompt';

export default function PropertyPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const lockMap: Record<string, number> = {
      Standard: 1,
      Electronic: 2,
      SuperLock: 3
      };
  const lockMapReverse: Record<number, string> = Object.fromEntries(
      Object.entries(lockMap).map(([k, v]) => [v, k])
      );

  // Form state
  const [formData, setFormData] = useState<PropertyRequest>({
    address: '',
    numberOfApartments: 1,
    lockTypeId: 0,
    accessPathLength: 0
  });
  
  const user = currentUser();
  
  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, []);
  
  async function loadProperties() {
    try {
      const data = await getMyProperties();
      setProperties(data);
    } catch (err: any) {
      setError('Kunde inte ladda fastigheter: ' + err.message);
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setLoading(true);
    
    try {
      let response;
      if (editingId) {
        response = await updateProperty(editingId, formData);
      } else {
        response = await createProperty(formData);
      }

      if (response.success) {
        setMsg(editingId ? 'Fastighet uppdaterad!' : 'Fastighet skapad framgångsrikt!');
        // reset form
        setFormData({
          address: '',
          numberOfApartments: 1,
          lockTypeId: 1,
          accessPathLength: 0
        });
        setShowForm(false);
        setEditingId(null);
        // Reload the properties list
        await loadProperties();
      } else {
         setError(response.message || (editingId ? 'Kunde inte uppdatera fastighet' : 'Kunde inte skapa fastighet'));
      }
    } catch (err: any) {
      setError(err.message || 'Något gick fel');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleDelete(id: number, address: string) {
    if (!confirm(`Är du säker på att du vill ta bort fastigheten "${address}"?`)) {
      return;
    }
    
    try {
      const response = await deleteProperty(id);
      if (response.success) {
        setMsg('Fastighet borttagen');
        await loadProperties();
      } else {
        setError(response.message || 'Kunde inte ta bort fastighet');
      }
    } catch (err: any) {
      setError(err.message || 'Kunde inte ta bort fastighet');
    }
  }

  function handleEdit(p: Property) {
    setEditingId(p.id);
    setFormData({
      address: p.address,
      numberOfApartments: p.numberOfApartments,
      lockTypeId: lockMap[p.lockName ?? 'Standard'],
      accessPathLength: p.accessPathLength ?? 0
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function createWasteRoom(p: Property) {
    setSelectedProperty(p);
    setIsCreateRoomOpen(true);
  }
  
  function handleInputChange(field: keyof PropertyRequest, value: string | number) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }
  
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="h1">Mina Fastigheter</h1>
        <p className="mt-2 text-gray-600">
          Välkommen {user?.username}! Hantera dina fastigheter här.
        </p>
      </div>
      
      {/* Messages */}
      {msg && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {msg}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      
      {/* Add Property Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Avbryt' : '+ Lägg till fastighet'}
        </button>
      </div>
      
      {/* Property Form */}
      {showForm && (
        <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft">
          <h2 className="mb-6 text-xl font-semibold">Lägg till ny fastighet</h2>
          
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
                  placeholder="t.ex. Storgatan 123, Malmö"
                />
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
                <label htmlFor="lockType" className="block text-sm font-medium mb-2">
                  Typ av lås för miljörum *
                </label>
                <select
                  id="lockTypeId"
                  required
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
                  value={formData.lockTypeId}
                  onChange={(e) => handleInputChange('lockTypeId', parseInt(e.target.value))}
                >
                  <option value="0">Test</option>
                  <option value="1">Elektronisk</option>
                  <option value="2">Alien</option>
                  <option value="3">Epic lock</option>
                  <option value="4">Old lock</option>
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
                {loading ? 'Skapar...' : 'Skapa fastighet'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
          <h2 className="text-xl font-semibold">Dina fastigheter ({properties.length})</h2>
        </div>
        
        {properties.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-lg font-medium">Inga fastigheter ännu</p>
            <p className="mt-1">Klicka på "Lägg till fastighet" för att komma igång.</p>
          </div>
        ) : (
          <div className="divide-y">
            {properties.map((property) => (
              <div key={property.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {property.address}
                    </h3>
                    <div className="mt-2 grid gap-2 text-sm text-gray-600 md:grid-cols-3">
                      <div>
                        <span className="font-medium">Lägenheter:</span> {property.numberOfApartments}
                      </div>
                      <div>
                        <span className="font-medium">Lås:</span> {property.lockName ?? 'Ingen'}
                      </div>
                      <div>
                        <span className="font-medium">Dragväg:</span> {property.accessPathLength}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Skapad: {new Date(property.createdAt).toLocaleString('sv-SE')}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex gap-2">
                    <button
                    onClick={() => createWasteRoom(property)}
                      className="rounded-lg border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700 hover:bg-green-100"
                      >  
                      Skapa miljörum
                    </button>
                    <button
                      onClick={() => handleEdit(property)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100"
                    >
                      Redigera
                    </button>
                    <button
                      onClick={() => handleDelete(property.id, property.address)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

     {isCreateRoomOpen && (
        <RoomSizePrompt
        onConfirm={(length: number, width: number) => {
          localStorage.setItem(
            'trashRoomData',
            JSON.stringify({ length, width, property : selectedProperty})
          );

          setIsCreateRoomOpen(false); 
          window.location.href = '/planningTool';
        }}
        onCancel={() => setIsCreateRoomOpen(false)}
        />
      )}
    </main>
  );
}