import { useParams } from "react-router-dom";
import { getWasteRoomsByPropertyId } from "../lib/WasteRoom";
import type { WasteRoom } from "../lib/WasteRoom";
import { deleteWasteRoom, setWasteRoomActive } from "../lib/WasteRoomRequest";
import { useEffect, useState } from "react";
import RoomSizePrompt from "../components/prompts/RoomSizePrompt";
import greybox from "../assets/greybox.png";
import Message from "../components/ShowStatus";
import ConfirmModal from "../components/ConfirmModal";
import PlanVersionDropdown from '../components/PlanVersionDropdown';

export default function AllaMiljoRumPage() {
    const { propertyId } = useParams();
    const [rooms, setRooms] = useState<WasteRoom[][]>([]);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const propertyAddress = localStorage.getItem("selectedPropertyAddress");
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<WasteRoom | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);
        
    /* ──────────────── Messages ──────────────── */
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        async function load() {
            if (!propertyId) return;
            setLoading(true);

            try {
                const data = await getWasteRoomsByPropertyId(Number(propertyId));

                // Group rooms by wasteRoomId so all versions of the same room are together
                const groupedRooms = Object.values(
                  data.reduce<Record<string, WasteRoom[]>>((acc, room) => {
                    const key = room.name ?? `room-${room.id}`;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(room);
                    return acc;
                  }, {})
                );

                const sortedGroupedRooms = groupedRooms.map(versions =>
                  versions.sort((a, b) => (b.versionNumber ?? 0) - (a.versionNumber ?? 0))
                );

                setRooms(sortedGroupedRooms);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [propertyId]);

    function editRoom(room: WasteRoom) {
        const fullRoomData = {
            ...room,
            wasteRoomId: room.wasteRoomId ?? room.id,
            containers: (room.containers ?? []).map((c: any) => ({
                ...c,
                containerType: c.containerType ?? {
                    imageTopViewUrl: "",
                    width: 1,
                    depth: 1,
                },
            })),
            doors: room.doors ?? [],
            otherObjects: room.otherObjects ?? [],
        };

        localStorage.setItem("enviormentRoomData", JSON.stringify(fullRoomData));
        localStorage.setItem("selectedPropertyId", String(propertyId));
        localStorage.setItem("selectedProperty", JSON.stringify({ propertyId }));

        window.location.href = "/planningTool";
    }

    function requestRemoveRoom(room: WasteRoom) {
        setRoomToDelete(room);
        setShowConfirm(true);
    }

    async function removeRoom(room: WasteRoom) {
        if (!room) return;

        setLoadingDelete(true);

        try {
            await deleteWasteRoom(room.wasteRoomId ?? room.id);

            // Remove locally from state
            setRooms((prev) =>
                prev.filter((roomVersions) => {
                    const baseRoom = roomVersions[0];
                    return (baseRoom.wasteRoomId ?? baseRoom.id) !==
                           (room.wasteRoomId ?? room.id);
                })
            );
        } catch (err) {
            setMsg("")
            setError("");
            setTimeout(() => setError("Det gick inte att ta bort rummet"), 10);
        } finally {
            setLoadingDelete(false);
            setShowConfirm(false);
            setRoomToDelete(null);
        }
    }

    async function toggleDraft(roomVersions: WasteRoom[]) {
      if (!roomVersions.length) return;

      const activeVersion = roomVersions.find(r => r.isActive);
      const latestVersion = [...roomVersions].sort(
        (a, b) => (b.versionNumber ?? 0) - (a.versionNumber ?? 0)
      )[0];

      try {
        if (activeVersion) {
          await setWasteRoomActive(
            activeVersion.wasteRoomId ?? activeVersion.id,
            false
          );

          setRooms(prev =>
            prev.map(group =>
              group === roomVersions
                ? group.map(r => ({ ...r, isActive: false }))
                : group
            )
          );
        } else {
          await setWasteRoomActive(
            latestVersion.wasteRoomId ?? latestVersion.id,
            true
          );

          setRooms(prev =>
            prev.map(group =>
              group === roomVersions
                ? group.map(r => ({
                    ...r,
                    isActive: r === latestVersion
                  }))
                : group
            )
          );
        }
      } catch {
        setError("Kunde inte uppdatera utkast-status");
      }
    }

    const filteredRooms = rooms.filter((roomVersions) => {
        const room = roomVersions.find(r => r.isActive) ?? roomVersions[0];
        return room.name
            ?.toLowerCase()
            .includes(search.toLowerCase());
    });

    return (
        
        <main className="mx-auto max-w-5xl py-10">   
                    
            <div className="mb-6 inline-flex items-center gap-2 text-nsr-teal hover:underline cursor-pointer font-medium"
                onClick={() => window.location.href = "/properties"}> ← Tillbaka till Mina fastigheter
            </div>

            {/* Feedback messages */}
            <div className="stage-content-wrapper">
                {msg && <Message message={msg} type="success" />}
                {error && <Message message={error} type="error" />}
            </div>

            <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft">

                <div className="mb-6">
                    <h1 className="text-4xl font-bold">Miljörum för {propertyAddress ?? "fastighet"}</h1>
                    <p className="mt-2 text-gray-600">
                        Här kan du hantera, redigera och skapa nya miljörum för denna fastighet.
                    </p>
                    <p className="mt-2 text-gray-600">
                        Om du vill skapa miljörum som inte ska ingå i din slutgiltiga statistik, sätt dem som
                        "Utkast".
                    </p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    {/* Sökfält */}
                    <div className="relative flex-1 md:w-80">
                        <input
                            type="text"
                            placeholder="Sök miljörum..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border-gray-300 shadow-sm pl-10 pr-3 py-2 focus:border-nsr-teal focus:ring-nsr-teal"
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
                        className="inline-flex items-center gap-2 rounded-xl border border-nsr-teal text-nsr-teal px-4 py-2 text-sm font-medium bg-white hover:bg-gray-50 transition w-full md:w-auto"
                        onClick={() => setIsCreateRoomOpen(true)}
                    >
                        <span className="text-lg leading-none">+</span>
                        Lägg till miljörum
                    </button>
                </div>

            </div>

            <div className="mt-4">

                {loading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-nsr-teal mb-4" />
                        <p className="text-gray-600">Laddar miljörum...</p>
                    </div>)
                }

                {!loading && rooms.length === 0 ? (
                    <p className="text-gray-500">Inga miljörum tillgängliga.</p>
                ) : (

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                        {filteredRooms.map((roomVersions) => {
                            const room = roomVersions.find(r => r.isActive) ?? roomVersions[0];
                            return (
                            <div key={room.id} className="rounded-xl border bg-white p-5 shadow-soft flex flex-col">
                                <img
                                    //src={`http://localhost:8081${room.thumbnailUrl}`}
                                    src={room.thumbnailUrl || greybox}
                                    alt="Miljörum bild"
                                    className="w-full h-40 object-cover rounded-lg mb-3"
                                />


                                <h2 className="font-semibold">
                                    {room.name && room.name.trim() !== ""
                                        ? room.name
                                        : `Null`}
                                </h2>
                                <p>Längd: {room.length}</p>
                                <p>Bredd: {room.width}</p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-nsr-teal focus:ring-nsr-teal"
                                        checked={!roomVersions.some(r => r.isActive)}
                                        onChange={() => toggleDraft(roomVersions)}
                                    />
                                    Sätt som utkast
                                </label>
                                <div className="flex-shrink-0 basis-full sm:basis-auto">
                                    <PlanVersionDropdown
                                      rooms={roomVersions}
                                      propertyAddress={propertyAddress ?? ""}
                                      onOpenVersion={(r) => editRoom(r)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="btn-secondary-sm"
                                        onClick={() => editRoom(room)}
                                    >
                                        Redigera
                                    </button>

                                    <button
                                        className="inline-flex items-center justify-center rounded-xl2 px-3 py-1 text-sm font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                                        disabled={deleting === room.id}
                                        onClick={() => requestRemoveRoom(room)}
                                    >
                                        {deleting === room.id ? "Tar bort..." : "Ta bort"}
                                    </button>
                                </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isCreateRoomOpen && (
                <RoomSizePrompt
                    onConfirm={(name: string, length: number, width: number) => {
                        localStorage.setItem(
                            "enviormentRoomData",
                            JSON.stringify({ name, height: length, width: width })
                        );
                        localStorage.setItem("selectedPropertyId", String(propertyId));
                        localStorage.setItem("selectedProperty", JSON.stringify({ propertyId }));

                        setIsCreateRoomOpen(false);
                        window.location.href = "/planningTool";
                    }}
                    onCancel={() => setIsCreateRoomOpen(false)}
                />
            )}

            <ConfirmModal
                open={showConfirm}
                title="Ta bort miljörum"
                message="Är du säker på att du vill ta bort detta miljörum?"
                confirmLabel="Ta bort"
                cancelLabel="Avbryt"
                loading={loadingDelete}
                onCancel={() => {
                    setShowConfirm(false);
                    setRoomToDelete(null);
                }}
                onConfirm={() => removeRoom(roomToDelete!)}
            />

        </main>
    );
}