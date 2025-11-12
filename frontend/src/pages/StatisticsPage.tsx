import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";
import { useParams, useLocation, Link } from 'react-router-dom';
import { currentUser } from '../lib/auth';
import ConfirmModal from '../components/ConfirmModal';
import {getPropertyComparison, getCostComparison, getAnnualCost} from '../lib/Statistics'

interface PropertyComparisonDTO {
  propertyId: number;
  propertyName?: string;
  costComparison?: any;
  containerSizeComparison?: any;
  wasteAmountComparisons?: any[];
}

interface ContainerData {
  type: string;
  size: number;
  quantity: number;
  collectionFrequency: number;
}

export default function StatisticsPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const location = useLocation();
  const {state} = location as {state?: {propertyName: string} };
  const propertyName = state?.propertyName || '';
  const numberOfApartments = state?.numberOfApartments ?? 0;

  const [data, setData] = useState<PropertyComparisonDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   const [comparison, setComparison] = useState<any>(null);
   const [costComparison, setCostComparison] = useState<any>(null);
   const [annualCost, setAnnualCost] = useState<any>(null);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    cost: true,
    waste: true,
    containers: true,
  });

   const [openWasteGroups, setOpenWasteGroups] = useState<Record<string, boolean>>({});

  // Test container data
  const testContainers: ContainerData[] = [
    { type: 'Restavfall', size: 660, quantity: 3, collectionFrequency: 52 },
    { type: "Restavfall", size: 190, quantity: 5, collectionFrequency: 52 },
    { type: 'Papper', size: 370, quantity: 2, collectionFrequency: 26 },
    { type: 'Plast', size: 370, quantity: 2, collectionFrequency: 26 },
  ];

    const groupedContainers = testContainers.reduce((acc, container) => {
      if (!acc[container.type]) acc[container.type] = [];
      acc[container.type].push(container);
      return acc;
    }, {} as Record<string, ContainerData[]>);

  useEffect(() => {
    if (!propertyId) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const user = currentUser();
        const token = user?.token;
        console.log(token);
        const res = await fetch(`/api/properties/${propertyId}/comparison`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(`Server returned ${res.status}: ${msg}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Kunde inte hämta statistik');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [propertyId]);

    const toggleWasteGroup = (type: string) =>
      setOpenWasteGroups((prev) => ({ ...prev, [type]: !prev[type] }));

  if (loading) return <main className="mx-auto max-w-7xl px-4 py-8"><p className="text-gray-600">Laddar statistik...</p></main>;
  if (error) return <main className="mx-auto max-w-7xl px-4 py-8"><div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div></main>;
  if (!data) return <main className="mx-auto max-w-7xl px-4 py-8"><p className="text-gray-600">Ingen statistik hittades.</p></main>;

  const propertyDisplayName = propertyName || data.propertyName || `#${data.propertyId}`;
  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft flex flex-col sm:justify-between gap-4">
        <div>
          <h1 className="h1 mb-2">
            Statistik<span className="font-black text-nsr-ink"></span>
          </h1>
          <p className="mt-2 text-gray-600">
            Här visas statistik för fastigheten {propertyDisplayName}!.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Link to="/properties" className="btn-secondary text-sm self-end">← Tillbaka till fastigheter</Link>
        </div>
      </div>

      <section className="mb-8 rounded-2xl border bg-white p-6 shadow-soft overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">
          Avfall & Kostnadsstatistik
        </h2>
        <p className="text-gray-500 mb-4">
            Antal lägenheter: <span className="font-medium text-gray-700">{numberOfApartments}</span>
        </p>
        <table className="min-w-full border border-gray-200 text-sm text-gray-700">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-3 py-2 border">Fraktion</th>
              <th className="px-3 py-2 border">Volym (L)</th>
              <th className="px-3 py-2 border">Antal Kärl</th>
              <th className="px-3 py-2 border">Hämtfrekvens (ggr/år)</th>
              <th className="px-3 py-2 border">Årsvolym (L)</th>
              <th className="px-3 py-2 border">Procent</th>
              <th className="px-3 py-2 border">Liter per lgh/vecka</th>
              <th className="px-3 py-2 border">Kostnad/år (kr)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedContainers).map(([type, containers]) => {
              const wasteData = data?.wasteAmountComparisons?.find(
                (w) => w.wasteType === type
              );
              const diff = wasteData?.percentageDifference ?? 0;
              const diffColor =
                diff < 0
                  ? "text-green-600"
                  : diff > 0
                  ? "text-red-600"
                  : "text-yellow-600";

              const totalAnnualVolume = containers.reduce(
                (sum, c) => sum + c.size * c.quantity * c.collectionFrequency,
                0
              );
              const costPerYear = data?.costComparison?.propertyCost ?? 0;

              return (
                <>
                  <tr
                    key={type}
                    onClick={() => toggleWasteGroup(type)}
                    className="cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <td className="px-3 py-3 border font-semibold flex items-center gap-2">

                      {/*Här finns statusfärgen*/}

                      <span
                        className={`inline-block w-3 h-3 rounded-full ring-2 ring-offset-1 ${
                          diff < -10
                            ? "bg-green-500 ring-green-300"
                            : diff > 10
                            ? "bg-red-500 ring-red-300"
                            : "bg-yellow-400 ring-yellow-200"
                        }`}
                        title={
                          diff < -10
                            ? "Bra nivå"
                            : diff > 10
                            ? "Dålig nivå"
                            : "OK nivå"
                        }
                      ></span>

                      <span>{type}</span>

                      {openWasteGroups[type] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </td>
                    <td colSpan={3}></td>
                    <td className="px-3 py-2 border font-semibold">
                      {totalAnnualVolume.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-2 border font-semibold ${diffColor}`}
                    >
                      {diff.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 border">
                      {(totalAnnualVolume / 52).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 border font-semibold">
                      {costPerYear.toLocaleString()}
                    </td>
                  </tr>

                  {openWasteGroups[type] &&
                    containers.map((container, idx) => {
                      const annualVolume =
                        container.size *
                        container.quantity *
                        container.collectionFrequency;
                      const litersPerWeek = annualVolume / 52;

                      return (
                        <tr
                          key={`${type}-${idx}`}
                          className="bg-white text-gray-600 text-sm"
                        >

                          <td className="border px-3 py-2"></td>

                          <td className="px-6 py-2 border">{container.size.toLocaleString()} L</td>
                          <td className="px-3 py-2 border">{container.quantity.toLocaleString()}</td>
                          <td className="px-3 py-2 border">{container.collectionFrequency.toLocaleString()}</td>
                          <td className="px-3 py-2 border">{annualVolume.toLocaleString()}</td>
                          <td colSpan={2}></td>
                          <td className="px-3 py-2 border text-gray-700">{costPerYear.toLocaleString('sv-SE')}</td>
                        </tr>
                      );
                    })}
                </>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}