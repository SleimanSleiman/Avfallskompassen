import { useEffect, useMemo, useRef, useState } from 'react';
import type { WasteRoom } from '../lib/WasteRoom';

type PlanVersionDropdownProps = {
  rooms?: WasteRoom[];
  propertyAddress: string;
  onOpenVersion: (room: WasteRoom) => void;
};

type RoomGroup = {
  name: string;
  versions: WasteRoom[];
  activeVersion?: WasteRoom;
  activeIdentifier?: number;
};

const FALLBACK_ROOM_NAME = 'Miljörum';

function formatDimension(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return value.toLocaleString('sv-SE', { maximumFractionDigits: 1 });
}

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('sv-SE');
}

export default function PlanVersionDropdown({
  rooms,
  propertyAddress,
  onOpenVersion,
}: PlanVersionDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const groupedRooms = useMemo<RoomGroup[]>(() => {
    if (!rooms || rooms.length === 0) return [];

    const map = new Map<string, WasteRoom[]>();
    rooms.forEach((room) => {
      const key = room.name?.trim() || FALLBACK_ROOM_NAME;
      const existing = map.get(key) ?? [];
      existing.push(room);
      map.set(key, existing);
    });

    return Array.from(map.entries()).map(([name, versions]) => {
      const sorted = [...versions].sort(
        (a, b) => (a.versionNumber ?? 0) - (b.versionNumber ?? 0)
      );
      const activeVersion =
        sorted.find((version) => version.isActive) ?? sorted.at(-1);
      const activeIdentifier =
        activeVersion?.wasteRoomId ?? activeVersion?.versionNumber;
      return {
        name,
        versions: sorted,
        activeVersion,
        activeIdentifier,
      };
    });
  }, [rooms]);

  const hasRooms = groupedRooms.length > 0;

  if (!hasRooms) {
    return (
      <button
        className="btn-secondary-sm cursor-not-allowed opacity-60"
        type="button"
        disabled
      >
        Inga planeringar
      </button>
    );
  }

  return (
    <div className="w-full sm:w-auto" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="btn-secondary-sm inline-flex w-full items-center justify-center gap-2 sm:w-auto sm:justify-center"
      >
        <span>Planversioner</span>
        <svg
          className={`h-4 w-4 transition-transform ${
            open ? 'rotate-180' : ''
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
      </button>

      {open && (
        <div className="mt-3 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 text-left shadow-sm sm:p-4">
          <div className="max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
          <div className="mb-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Fastighet
            </p>
            <p className="text-sm font-semibold text-nsr-ink">
              {propertyAddress}
            </p>
          </div>

          <div className="space-y-3">
            {groupedRooms.map(({ name, versions, activeVersion, activeIdentifier }) => {
              const activeVersionDate = activeVersion
                ? formatDate(activeVersion.updatedAt ?? activeVersion.createdAt)
                : null;
              return (
              <div
                key={name}
                className="rounded-xl border border-gray-100 bg-gray-50/80 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {name}
                  </div>
                  <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                    {versions.length}{' '}
                    {versions.length === 1 ? 'version' : 'versioner'}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {versions.map((version, index) => {
                    const versionDate = formatDate(
                      version.updatedAt ?? version.createdAt
                    );
                    const versionKey =
                      version.wasteRoomId ??
                      `${name}-${version.versionNumber ?? index}`;
                    const createdByAdmin = version.createdBy === 'admin';
                    const isActiveVersion =
                      activeIdentifier !== undefined &&
                      activeIdentifier !== null &&
                      (version.wasteRoomId ?? version.versionNumber) ===
                        activeIdentifier;
                    return (
                    <div
                      key={versionKey}
                      className={`rounded-lg border px-2 py-1.5 text-xs ${
                        isActiveVersion
                          ? 'border-nsr-teal/50 bg-nsr-teal/5'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                              createdByAdmin ? 'bg-nsr-accent' : 'bg-nsr-teal'
                            }`}
                            aria-hidden="true"
                          />
                          <button
                            type="button"
                            onClick={() => onOpenVersion(version)}
                            className="text-left text-sm font-semibold text-nsr-teal hover:text-nsr-tealDark hover:underline transition-colors flex-1 min-w-0 break-words"
                          >
                            Version {version.versionNumber ?? '—'}
                            {version.versionName && (
                              <span className="text-gray-600 font-normal">
                                {' '}
                                - {version.versionName}
                              </span>
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          {isActiveVersion && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-nsr-teal bg-nsr-teal/15 px-2 py-0.5 rounded-full whitespace-nowrap">
                              Aktiv
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenVersion(version)}
                            className="text-[11px] font-semibold text-nsr-accent hover:text-nsr-accent/80 hover:underline whitespace-nowrap"
                          >
                            Öppna
                          </button>
                        </div>
                      </div>
                      {version.thumbnailUrl && (
                        <div className="mt-2 w-30 h-40 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={version.thumbnailUrl}
                            alt={`Thumbnail version ${version.versionNumber}`}
                            className="w-auto h-full object-cover scale-110"
                          />
                        </div>
                      )}

                      <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px] text-gray-600">
                        <span className="font-medium text-gray-700">
                          {formatDimension(version.width)}m ×{' '}
                          {formatDimension(version.length)}m
                        </span>
                        {version.versionName && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">
                              {version.versionName}
                            </span>
                          </>
                        )}
                        {versionDate && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>{versionDate}</span>
                          </>
                        )}
                        {version.createdBy && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span
                              className={`font-semibold ${
                                createdByAdmin ? 'text-nsr-accent' : 'text-nsr-teal'
                              }`}
                            >
                              {createdByAdmin
                                ? `Admin${
                                    version.adminUsername
                                      ? ` (${version.adminUsername})`
                                      : ''
                                  }`
                                : 'Användare'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
              );
            })}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
