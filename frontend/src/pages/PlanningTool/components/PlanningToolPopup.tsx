import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Property } from '../../../lib/Property';
import type { WasteRoom } from '../../../lib/WasteRoom';
import { getMyPropertiesWithWasteRooms } from '../../../lib/Property';
import { MapPin, Home, Users, ChevronDown, Plus, LayoutGrid } from 'lucide-react';
import type { ContainerInRoom, Door } from '../Types';
import { mmToPixels, SCALE } from '../Constants';

type WasteRoomContainer = NonNullable<WasteRoom['containers']>[number];

export type PreparedRoomState = {
  property: Property;
  propertyId: number;
  storagePayload: any;
  roomState: {
    id?: number;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    doors: any[];
    containers: ContainerInRoom[];
  };
};

type PlanningToolPopupProps = {
  defaultRoomState: {
    widthMeters: number;
    heightMeters: number;
    widthPx: number;
    heightPx: number;
    x: number;
    y: number;
  };
  onSelect: (prepared: PreparedRoomState) => void;
  onManageProperties: () => void;
};

export default function PlanningToolPopup({
  defaultRoomState,
  onSelect,
  onManageProperties,
}: PlanningToolPopupProps) {
  const [propertyOptions, setPropertyOptions] = useState<Property[]>([]);
  const [propertySearch, setPropertySearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPropertyId, setExpandedPropertyId] = useState<number | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyPropertiesWithWasteRooms();
      setPropertyOptions(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Kunde inte ladda fastigheter.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredProperties = useMemo(() => {
    const query = propertySearch.trim().toLowerCase();
    if (!query) return propertyOptions;
    return propertyOptions.filter((property) => {
      const address = property.address?.toLowerCase() ?? '';
      const municipality = property.municipalityName?.toLowerCase() ?? '';
      return address.includes(query) || municipality.includes(query);
    });
  }, [propertyOptions, propertySearch]);

  const buildFallbackContainerDTO = useCallback(
    (container: WasteRoomContainer | undefined, index: number) => {
      const dto = container?.containerDTO ?? {};
      return {
        id: dto.id ?? container?.id ?? index + 1,
        name: dto.name ?? 'Behållare',
        size: dto.size ?? 0,
        width: dto.width ?? 1000,
        depth: dto.depth ?? 1000,
        height: dto.height ?? 1000,
        imageFrontViewUrl: dto.imageFrontViewUrl ?? '',
        imageTopViewUrl:
          dto.imageTopViewUrl ?? '/images/containers/defaultTopView.png',
        emptyingFrequencyPerYear: dto.emptyingFrequencyPerYear ?? 0,
        cost: dto.cost ?? 0,
      };
    },
    []
  );

  const normalizeContainersForStorage = useCallback(
    (containers?: WasteRoom['containers']) => {
      if (!containers) return [];
      return containers.map((container, index) => {
        const containerDTO =
          container?.containerDTO ?? buildFallbackContainerDTO(container, index);
        return {
          ...container,
          containerDTO,
        };
      });
    },
    [buildFallbackContainerDTO]
  );

  const convertContainersToRoomState = useCallback(
    (containers?: WasteRoom['containers']): ContainerInRoom[] => {
      if (!containers) return [];
      return containers.map((container, index) => {
        const containerDTO =
          container?.containerDTO ?? buildFallbackContainerDTO(container, index);
        const widthMm = containerDTO.width ?? 1000;
        const depthMm = containerDTO.depth ?? 1000;
        return {
          id: container?.id ?? index + 1,
          container: containerDTO,
          x: container?.x ?? 0,
          y: container?.y ?? 0,
          width: mmToPixels(widthMm),
          height: mmToPixels(depthMm),
          rotation: container?.angle ?? 0,
        };
      });
    },
    [buildFallbackContainerDTO]
  );

  // Transform raw door data to proper Door format (matching useRoom hook logic)
  const convertDoorsToRoomState = useCallback(
    (doors?: WasteRoom['doors']): Door[] => {
      if (!doors || !Array.isArray(doors)) return [];
      return doors.map((d: any, i: number) => ({
        id: d?.id ?? Date.now() + i,
        x: d?.x ?? 0,
        y: d?.y ?? 0,
        width: d?.width ?? 1.2,
        wall: (d?.wall as Door['wall']) ?? 'bottom',
        rotation: d?.rotation ?? d?.angle ?? 0,
        // Match useRoom.ts default - existing saved doors default to 'inward' if not specified
        swingDirection: (d?.swingDirection as Door['swingDirection']) ?? 'inward',
      }));
    },
    []
  );

  const prepareRoomStateForWasteRoom = useCallback(
    (property: Property, wasteRoom: WasteRoom | null): PreparedRoomState => {
      const containersForStorage = wasteRoom
        ? normalizeContainersForStorage(wasteRoom.containers)
        : [];

      const storagePayload = wasteRoom
        ? {
            ...wasteRoom,
            property,
            propertyId: property.id,
            width: wasteRoom.width ?? defaultRoomState.widthMeters,
            length: wasteRoom.length ?? defaultRoomState.heightMeters,
            doors: wasteRoom.doors ?? [],
            containers: containersForStorage,
            name: wasteRoom.name ?? '',
          }
        : {
            property,
            propertyId: property.id,
            width: defaultRoomState.widthMeters,
            length: defaultRoomState.heightMeters,
            doors: [],
            containers: [],
            name: '',
          };

      const roomState = wasteRoom
        ? {
            id: wasteRoom.wasteRoomId ?? wasteRoom.id ?? undefined,
            name: wasteRoom.name ?? '',
            x: wasteRoom.x ?? defaultRoomState.x,
            y: wasteRoom.y ?? defaultRoomState.y,
            width: (wasteRoom.width ?? defaultRoomState.widthMeters) / SCALE,
            height: (wasteRoom.length ?? defaultRoomState.heightMeters) / SCALE,
            doors: convertDoorsToRoomState(wasteRoom.doors),
            containers: convertContainersToRoomState(wasteRoom.containers),
          }
        : {
            id: undefined,
            name: '',
            x: defaultRoomState.x,
            y: defaultRoomState.y,
            width: defaultRoomState.widthPx,
            height: defaultRoomState.heightPx,
            doors: [],
            containers: [],
          };

      return {
        property,
        propertyId: property.id,
        storagePayload,
        roomState,
      };
    },
    [convertContainersToRoomState, convertDoorsToRoomState, defaultRoomState, normalizeContainersForStorage]
  );

  const handleSelectWasteRoom = useCallback(
    (property: Property, wasteRoom: WasteRoom) => {
      if (!property?.id) return;
      const prepared = prepareRoomStateForWasteRoom(property, wasteRoom);
      onSelect(prepared);
    },
    [onSelect, prepareRoomStateForWasteRoom]
  );

  const handleCreateNewRoom = useCallback(
    (property: Property) => {
      if (!property?.id) return;
      const prepared = prepareRoomStateForWasteRoom(property, null);
      onSelect(prepared);
    },
    [onSelect, prepareRoomStateForWasteRoom]
  );

  const togglePropertyExpansion = useCallback((propertyId: number) => {
    setExpandedPropertyId((prev) => (prev === propertyId ? null : propertyId));
  }, []);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-nsr-ink">Välj fastighet och miljörum</h2>
          <p className="text-sm text-gray-600">
            Välj en fastighet för att se tillgängliga miljörum eller skapa ett nytt.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-2/3">
            <input
              type="text"
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              placeholder="Sök på adress eller kommun"
              className="w-full rounded-xl border border-gray-300 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-nsr-teal focus:outline-none focus:ring-2 focus:ring-nsr-teal"
            />
            <svg
              className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
          <button
            type="button"
            onClick={onManageProperties}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Hantera fastigheter
          </button>
        </div>

        <div className="mt-5 max-h-[55vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Laddar fastigheter…
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">Kunde inte ladda fastigheter.</p>
              <p className="mt-1">{error}</p>
              <button
                type="button"
                onClick={fetchProperties}
                className="mt-3 inline-flex rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                Försök igen
              </button>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
              Inga fastigheter matchar din sökning.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProperties.map((property) => {
                const wasteRooms = property.wasteRooms ?? [];
                const isExpanded = expandedPropertyId === property.id;
                const hasWasteRooms = wasteRooms.length > 0;

                return (
                  <div
                    key={property.id}
                    className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                  >
                    {/* Property Header */}
                    <button
                      type="button"
                      onClick={() => togglePropertyExpansion(property.id)}
                      className="w-full p-4 text-left transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-nsr-teal"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-nsr-ink truncate">
                              {property.address}
                            </span>
                            {hasWasteRooms && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-nsr-teal/10 px-2 py-0.5 text-xs font-medium text-nsr-teal">
                                <LayoutGrid className="h-3 w-3" />
                                {wasteRooms.length}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {property.municipalityName ?? '—'}
                          </span>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <Home className="h-4 w-4 text-nsr-teal" />
                          {property.numberOfApartments ?? '—'} lägenheter
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-nsr-teal" />
                          {property.accessPathLength ?? '—'} m dragväg
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-4 w-4 text-nsr-teal" />
                          {property.lockName ?? 'Ingen låstyp'}
                        </span>
                      </div>
                    </button>

                    {/* Expanded Content - Waste Rooms */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50/50 p-4">
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Välj miljörum
                          </h4>
                        </div>

                        <div className="space-y-2">
                          {/* Existing Waste Rooms */}
                          {wasteRooms.map((room) => (
                            <button
                              key={room.wasteRoomId ?? room.id}
                              type="button"
                              onClick={() => handleSelectWasteRoom(property, room)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white text-left transition hover:border-nsr-teal/60 hover:bg-nsr-teal/5 focus:outline-none focus:ring-2 focus:ring-nsr-teal"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-nsr-teal/10 flex items-center justify-center">
                                <LayoutGrid className="h-5 w-5 text-nsr-teal" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-nsr-ink truncate">
                                    {room.name && room.name.trim() !== ''
                                      ? room.name
                                      : `Miljörum ${room.wasteRoomId ?? room.id}`}
                                  </span>
                                  {room.isActive && (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                      Aktiv
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {room.width ?? '—'}m × {room.length ?? '—'}m
                                  {room.containers && room.containers.length > 0 && (
                                    <span className="ml-2">
                                      • {room.containers.length} behållare
                                    </span>
                                  )}
                                </p>
                              </div>
                              <svg
                                className="h-5 w-5 text-gray-400"
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
                            </button>
                          ))}

                          {/* Create New Room Button */}
                          <button
                            type="button"
                            onClick={() => handleCreateNewRoom(property)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-nsr-teal/40 bg-nsr-teal/5 text-left transition hover:border-nsr-teal hover:bg-nsr-teal/10 focus:outline-none focus:ring-2 focus:ring-nsr-teal"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-nsr-teal/20 flex items-center justify-center">
                              <Plus className="h-5 w-5 text-nsr-teal" />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-nsr-teal">
                                Skapa nytt miljörum
                              </span>
                              <p className="text-sm text-nsr-teal/70">
                                Börja med ett tomt miljörum
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
