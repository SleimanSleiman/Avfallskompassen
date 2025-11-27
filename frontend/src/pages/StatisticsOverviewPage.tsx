import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPropertiesSimple } from "../lib/Statistics";
import LoadingBar from "../components/LoadingBar";
import {
    getAnnualCost,
    getCollectionFee,
    getPropertiesSimple,
    getPropertyContainers
} from "../lib/Statistics";
import { getWasteRoomsByPropertyId, getSimpleWasteRoom } from "../lib/WasteRoom"; //TODO: Lägg till denna metoden.

interface Property {
    id: number;
    address: string;
    numberOfApartments?: number;
    lockName: string;
    lockPrice: number;
    accessPathLength: number;
    municipalityName: string;
}

export default function StatisticsOverviewPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roomToExport, setRoomToExport] = useState<any | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            try {
                const data = await getPropertiesSimple();
                setProperties(data);
            } catch (err: any) {
                setError(err.message || "Kunde inte ladda fastigheter");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    function viewStatistics(p: Property) {
        navigate(`/statistics/${p.id}`, {
            state: {
                propertyName: p.address,
                numberOfApartments: p.numberOfApartments,
                lockPrice: p.lockPrice,
            },
        });
    }

    async function exportPDF(p: Property) {
        try {
            const wasteRooms = await getWasteRoomsByPropertyId(p.id);
            if (!wasteRooms.length) throw new Error("Inget avfallsrum hittades");

            const wasteRoom = wasteRooms[0];

            const [containersData, annualCostData, collectionFeeData] = await Promise.all([ //TODO: Ändra så att TypeSimpleWasteRoom faktiskt stämmer.
                getSimpleWasteRoom(p.id),
                getAnnualCost(p.id),
                getCollectionFee(p.id)
            ]);

            const formattedContainers = containersData.map(c => ({
                ...c,
                containerName: c.containerName,
                size: c.size,
                quantity: c.quantity,
                emptyingFrequency: c.emptyingFrequency,
                cost: c.cost,
                imageTopViewUrl: c.imageTopViewUrl || "" // fallback
            }));

            const statistics = {
                containers: formattedContainers,
                annualCost: annualCostData,
                collectionFee: Number(collectionFeeData?.cost) || 0,
                numberOfApartments: p.numberOfApartments ?? 0
            };

            setRoomToExport({ //TODO: Säkerställ detta med olika DTO's senare. Så jäkla många olika.
                wasteRoom,
                doors: wasteRoom.doors || [],
                containers: (wasteRoom.containers || []).map(c => ({
                    ...c,
                    container: {
                        ...c.containerDTO,
                        imageTopViewUrl: c.containerDTO?.imageTopViewUrl || ""
                    },
                    x: c.x ?? 0,
                    y: c.y ?? 0,
                    width: c.containerDTO.width ?? 50,
                    height: c.containerDTO.height ?? 50,
                    rotation: c.angle ?? 0
                })),
                statistics
            });
        } catch (err: any) {
            console.error("Export failed", err);
            alert(err.message || "Export failed");
        }
    }

    if (loading) {
      return (
        <main className="mx-auto max-w-7xl px-4 py-8">
          <LoadingBar message="Laddar fastigheter..." />
        </main>
      );
    }

    if (error) {
        return (
            <main className="mx-auto max-w-7xl px-4 py-8">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-8">
            <h1 className="h1 mb-8">Statistik – Mina fastigheter</h1>

            <div className="rounded-2xl border bg-white shadow-soft p-6">
                {properties.length === 0 ? (
                    <p className="text-gray-500">Inga fastigheter hittades.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {properties.map(p => (
                            <div
                                key={p.id}
                                className="rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-base font-semibold text-gray-900 truncate">{p.address}</h3>

                                <div className="mt-2 text-sm text-gray-700">
                                    <div>
                                        <span className="text-gray-500">Lägenheter:</span>{" "}
                                        {p.numberOfApartments ?? "—"}
                                    </div>
                                    <div>
                                        <span className="text-gray-500"> Låstyp:</span> {p.lockName} m
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Dragväg:</span> {p.accessPathLength} m
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Kommun:</span> {p.municipalityName || "—"}
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        className="btn-secondary-sm"
                                        onClick={() => viewStatistics(p)}
                                    >
                                        Se statistik
                                    </button>

                                    <button
                                        className="inline-flex items-center justify-center rounded-xl2 px-3 py-1 text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        onClick={() => exportPDF(p)}
                                    >
                                        Exportera PDF
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
