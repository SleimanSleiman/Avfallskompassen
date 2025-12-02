import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Property } from '../../../lib/Property';
import type { WasteRoom } from '../../../lib/WasteRoom';
import { getMyPropertiesWithWasteRooms } from '../../../lib/Property';
import { MapPin, Home, Users } from 'lucide-react';
import type { ContainerInRoom } from '../Types';
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

  const selectWasteRoomCandidate = useCallback((property: Property) => {
    const rooms = property.wasteRooms ?? [];
    if (!rooms.length) return null;
    const active = rooms.find((room) => room.isActive);
    return active ?? rooms[rooms.length - 1];
  }, []);

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

  const prepareRoomState = useCallback(
    (property: Property): PreparedRoomState => {
      const existingRoom = selectWasteRoomCandidate(property);
      const containersForStorage =
        normalizeContainersForStorage(existingRoom?.containers);

      const storagePayload = existingRoom
        ? {
            ...existingRoom,
            property,
            propertyId: property.id,
            width: existingRoom.width ?? defaultRoomState.widthMeters,
            length: existingRoom.length ?? defaultRoomState.heightMeters,
            doors: existingRoom.doors ?? [],
            containers: containersForStorage,
            name: existingRoom.name ?? '',
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

      const roomState = existingRoom
        ? {
            id: existingRoom.wasteRoomId ?? existingRoom.id ?? undefined,
            name: existingRoom.name ?? '',
            x: existingRoom.x ?? defaultRoomState.x,
            y: existingRoom.y ?? defaultRoomState.y,
            width:
              (existingRoom.width ?? defaultRoomState.widthMeters) / SCALE,
            height:
              (existingRoom.length ?? defaultRoomState.heightMeters) / SCALE,
            doors: existingRoom.doors ?? [],
            containers: convertContainersToRoomState(existingRoom.containers),
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
    [
      convertContainersToRoomState,
      defaultRoomState,
      normalizeContainersForStorage,
      selectWasteRoomCandidate,
    ]
  );

  const handleSelectProperty = useCallback(
    (property: Property) => {
      if (!property?.id) return;
      const prepared = prepareRoomState(property);
      onSelect(prepared);
    },
    [onSelect, prepareRoomState]
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-nsr-ink">Välj fastighet</h2>
          <p className="text-sm text-gray-600">
            För att starta planeringen behöver du välja vilken fastighet
            miljörummet hör till.
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
              {filteredProperties.map((property) => (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => handleSelectProperty(property)}
                  className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-nsr-teal/60 hover:bg-nsr-teal/5 focus:outline-none focus:ring-2 focus:ring-nsr-teal"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-semibold text-nsr-ink">
                      {property.address}
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      {property.municipalityName ?? '—'}
                    </span>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
