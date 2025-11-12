import { useEffect, useState } from 'react';
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

  // Test container data
  const testContainers: ContainerData[] = [
    { type: 'Restavfall', size: 660, quantity: 3, collectionFrequency: 52 },
    { type: 'Papper', size: 370, quantity: 2, collectionFrequency: 26 },
    { type: 'Plast', size: 370, quantity: 2, collectionFrequency: 26 },
  ];

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
        <h2 className="text-xl font-semibold mb-4">Avfall & Kostnadsstatistik</h2>
        <table className="min-w-full border border-gray-200 text-sm text-gray-700">
          <thead className="bg-gray-100">
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
            {testContainers.map((container, idx) => {

              const wasteData = data?.wasteAmountComparisons?.find(w => w.wasteType === container.type);
              const diff = wasteData?.percentageDifference ?? 0;
              const diffColor =
                diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-600' : 'text-yellow-600';

              const annualVolume = container.size * container.quantity * container.collectionFrequency;
              const litersPerWeek = annualVolume / 52;

              const costPerYear = data?.costComparison?.propertyCost ?? 0;

              return (
                <tr key={idx} className="even:bg-gray-50">
                  <td className="px-3 py-2 border font-semibold">{container.type}</td>
                  <td className="px-3 py-2 border">{container.size}</td>
                  <td className="px-3 py-2 border">{container.quantity}</td>
                  <td className="px-3 py-2 border">{container.collectionFrequency}</td>
                  <td className="px-3 py-2 border">{annualVolume}</td>
                  <td className={`px-3 py-2 border font-semibold ${diffColor}`}>{diff.toFixed(2)}%</td>
                  <td className="px-3 py-2 border">{litersPerWeek.toFixed(1)}</td>
                  <td className="px-3 py-2 border font-semibold">{costPerYear}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <section className="mb-8 rounded-2xl border bg-white shadow-soft">
        <h2
          className="text-xl font-semibold p-6 cursor-pointer flex justify-between items-center"
          onClick={() => toggleSection('containers')}
        >
          Behållare
          <span>{openSections.containers ? '▲' : '▼'}</span>
        </h2>
        {openSections.containers && (
          <div className="space-y-2 text-gray-700 p-6 pt-0">
            {testContainers.map((container, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-gray-50">
                <p className="font-semibold">{container.type}</p>
                <p>
                  Storlek: <span className="font-semibold">{container.size} L</span><br/>
                  Antal: <span className="font-semibold">{container.quantity} st</span><br/>
                  Hämtas: <span className="font-semibold">{container.collectionFrequency} ggr/år</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}