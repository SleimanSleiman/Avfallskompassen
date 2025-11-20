import { useEffect, useState } from 'react';
import React from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";
import { useParams, useLocation, Link } from 'react-router-dom';
import {getCollectionFee, getAnnualCost, getPropertyContainers, type AnnualCostDTO} from '../lib/Statistics'

//TODO: Ändra hårdkodade uträkningen av grön/gul/röd till riktiga värden som kan ändras via admin panel.
//TODO: Bryt ut delar och bygga komponenter av dem.

interface ContainerData {
  fractionType: string;
  containerName: string;
  size: number;
  quantity: number;
  emptyingFrequency: number;
  cost: number;
}

interface CollectionFee {
    cost: number;
}

export default function StatisticsPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const location = useLocation();
  const { state } = location as { state?: { propertyName: string; numberOfApartments?: number;} };
  const propertyName = state?.propertyName || '';
  const numberOfApartments = state?.numberOfApartments ?? 0;

  const [loading, setLoading] = useState(true);
  const [collectionFee, setCollectionFee] = useState<CollectionFee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [containers, setContainers] = useState<ContainerData[]>([]);
  const [data, setData] = useState<{
    annualCost: AnnualCostDTO
  } | null>(null);
  const [openWasteGroups, setOpenWasteGroups] = useState<Record<string, boolean>>({});

  const groupedContainers = containers.reduce((acc, container) => {
    if (!acc[container.fractionType]) acc[container.fractionType] = [];
    acc[container.fractionType].push(container);
    return acc;
  }, {} as Record<string, ContainerData[]>);

    useEffect(() => {
        if (!propertyId) return;

        async function loadStatistics() {
            try {
                const [containersData, annualCostData, collectionFeeData] = await Promise.all([
                    getPropertyContainers(Number(propertyId)),
                    getAnnualCost(Number(propertyId)),
                    getCollectionFee(Number(propertyId)),
                ]);

                console.log(propertyId);

                const formattedContainers = containersData.map((c) => ({
                    fractionType: c.fractionType,
                    containerName: c.containerName,
                    size: c.size,
                    quantity: c.quantity,
                    emptyingFrequency: c.emptyingFrequency,
                    cost: c.cost,
                }));

                setContainers(formattedContainers);

                setData({
                    annualCost: annualCostData,
                });

                console.debug("collectionFeeData", collectionFeeData);
                setCollectionFee({
                    cost: Number(collectionFeeData?.cost) || 0,
                });
                console.log(collectionFeeData.cost);

                setLoading(false);
            } catch (err: unknown) {
                console.error("Kunde inte hämta statistik", err);

                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Ett fel uppstod");
                }
                setLoading(false);
            }
        }

        loadStatistics();
    }, [propertyId]);

  const toggleWasteGroup = (type: string) =>
    setOpenWasteGroups((prev) => ({ ...prev, [type]: !prev[type] }));

  if (loading) return <main className="mx-auto max-w-7xl px-4 py-8"><p className="text-gray-600">Laddar statistik...</p></main>;
  if (error) return <main className="mx-auto max-w-7xl px-4 py-8"><div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div></main>;
  if (!data) return <main className="mx-auto max-w-7xl px-4 py-8"><p className="text-gray-600">Ingen statistik hittades.</p></main>;

  const propertyDisplayName = propertyName || `#${propertyId}`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft flex flex-col sm:justify-between gap-4">
        <div>
          <h1 className="h1 mb-2">Statistik</h1>
          <p className="mt-2 text-gray-600">Här visas statistik för fastigheten {propertyDisplayName}.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Link to="/statistics" className="btn-secondary text-sm self-end">← Tillbaka till fastigheter</Link>
        </div>
      </div>

      <section className="mb-8 rounded-2xl border bg-white p-6 shadow-soft overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Avfall & Kostnadsstatistik</h2>
        <p className="text-gray-500 mb-4">
          Antal lägenheter: <span className="font-medium text-gray-700">{numberOfApartments}</span>
        </p>

        <table className="min-w-full border border-gray-200 text-sm text-gray-700">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-3 py-2 border">Fraktion</th>
              <th className="px-3 py-2 border">Totala volym (L)</th>
              <th className="px-3 py-2 border">Totalt antal kärl</th>
              <th className="px-3 py-2 border">Årsvolym (L)</th>
                <th className="px-3 py-2 border">Liter per lägenhet/vecka</th>
              <th className="px-3 py-2 border">Årskostnad (kr)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedContainers).map(([type, containers]) => {
              const totalVolume = containers.reduce((sum, c) => sum + c.size * c.quantity, 0);
              const totalQuantity = containers.reduce((sum, c) => sum + c.quantity, 0);
              const totalAnnualVolume = containers.reduce((sum, c) => sum + c.size * c.quantity * c.emptyingFrequency, 0);
              const litersPerWeekPerApartment = numberOfApartments > 0 ? totalAnnualVolume / 52 / numberOfApartments : 0;
                const costPerYear = containers.reduce((sum, c) => {
                    const containerCost = Number(c.cost) || 0;
                    const qty = Number(c.quantity) || 0;
                    const freq = Number(c.emptyingFrequency) || 0;
                    const lock = Number(collectionFee?.cost) || 0;

                    const unitPricePerEmptying = (qty * lock) * freq;
                    const annualForThisContainerType = unitPricePerEmptying + (containerCost * qty);

                    return sum + annualForThisContainerType;
                }, 0);

              let indicatorColor = "bg-green-500 ring-green-300";
              if (litersPerWeekPerApartment > 45) {
                indicatorColor = "bg-red-500 ring-red-300";
              } else if (litersPerWeekPerApartment > 30) {
                indicatorColor = "bg-yellow-400 ring-yellow-200";
              }

              return (
                <React.Fragment key={type}>
                  <tr
                    onClick={() => toggleWasteGroup(type)}
                    className="cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <td className="px-3 py-3 border font-semibold flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full ring-2 ring-offset-1 ${indicatorColor}`}
                            title={`${litersPerWeekPerApartment.toFixed(1)} L/week/apartment`}></span>
                      {type}
                      {openWasteGroups[type] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </td>
                    <td className="px-3 py-2 border font-semibold">{totalVolume.toLocaleString()}</td>
                    <td className="px-3 py-2 border font-semibold">{totalQuantity.toLocaleString()}</td>
                    <td className="px-3 py-2 border font-semibold">{totalAnnualVolume.toLocaleString()}</td>
                      <td className="px-3 py-2 border font-semibold">{Number(litersPerWeekPerApartment.toFixed(1)).toLocaleString()}</td>
                    <td className="px-3 py-2 border font-semibold">{costPerYear.toLocaleString()}</td>
                  </tr>

                  {openWasteGroups[type] && (
                    <tr>
                      <td colSpan={5} className="p-0 border-0">
                        <div className="p-4 bg-gray-50">
                          <table className="w-full border border-gray-300 text-sm text-gray-700">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 border">Volym (L)</th>
                                <th className="px-3 py-2 border">Antal kärl</th>
                                <th className="px-3 py-2 border">Hämtfrekvens (ggr/år)</th>
                                <th className="px-3 py-2 border">Årsvolym (L)</th>
                                <th className="px-3 py-2 border">Kostnad/år (kr)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {containers.map((container, idx) => {
                                const annualVolume = container.size * container.quantity * container.emptyingFrequency;
                                  const containerCost = Number(container.cost) || 0;
                                  const qty = Number(container.quantity) || 0;
                                  const freq = Number(container.emptyingFrequency) || 0;
                                  const lock = Number(collectionFee?.cost) || 0;

                                  const unitPricePerEmptying = (qty * lock) * freq;
                                  const annualCost = unitPricePerEmptying + (qty * containerCost);
                                return (
                                  <tr key={idx} className="bg-white text-gray-600">
                                    <td className="px-3 py-2 border">{container.size.toLocaleString()}</td>
                                    <td className="px-3 py-2 border">{container.quantity.toLocaleString()}</td>
                                    <td className="px-3 py-2 border">{container.emptyingFrequency.toLocaleString()}</td>
                                    <td className="px-3 py-2 border">{annualVolume.toLocaleString()}</td>
                                    <td className="px-3 py-2 border">{annualCost.toLocaleString()}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}