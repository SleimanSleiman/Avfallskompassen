import { useEffect, useState } from 'react';
import React from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";
import { useParams, useLocation, Link } from 'react-router-dom';
import { getCollectionFee, getAnnualCost, getPropertyContainers, type AnnualCostDTO } from '../lib/Statistics';
import { useComparison } from './PlanningTool/hooks/useComparison';
import { getLockTypeForProperty} from "../lib/Statistics";
import LoadingBar from '../components/LoadingBar';

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

interface LockType {
    id: number;
    name: string;
    cost: number;
}

type ComparisonScaleProps = {
  title: string;
  value: number | null | undefined;
  average: number | null | undefined;
  min?: number | null | undefined;
  max?: number | null | undefined;
  unit?: string;
  subtitle?: string;
  comparisonCount?: number | null;
  formatValue?: (v: number) => string;
};

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return value == null ? null : Number(value);
}

function ComparisonScale({
  title,
  value,
  average,
  min,
  max,
  unit = '',
  subtitle,
  comparisonCount,
  formatValue = (v) => v.toLocaleString('sv-SE', { maximumFractionDigits: 1 }),
}: ComparisonScaleProps) {
  const validValue = typeof value === 'number' ? value : null;
  const validAverage = typeof average === 'number' ? average : null;

  if (validValue == null || validAverage == null) {
    return (
      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
        <h3 className="text-base font-black text-nsr-ink">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        <p className="text-sm text-gray-500 mt-4">Ingen jämförelsedata tillgänglig.</p>
      </div>
    );
  }

  let localMin = typeof min === 'number' ? min : Math.min(validValue, validAverage);
  let localMax = typeof max === 'number' ? max : Math.max(validValue, validAverage);

  if (localMax - localMin === 0) {
    const padding = Math.max(1, localMax * 0.1);
    localMin -= padding;
    localMax += padding;
  }

  const range = localMax - localMin || 1;
  const position = ((validValue - localMin) / range) * 100;
  const avgPosition = ((validAverage - localMin) / range) * 100;
  const diffPercent = validAverage === 0 ? 0 : ((validValue - validAverage) / validAverage) * 100;

  let comparisonText = 'I nivå med genomsnittet';
  let comparisonColor = 'text-amber-600';
  let barColor = 'bg-gradient-to-r from-yellow-200 to-yellow-300';
  let markerBg = '#d97706';
  let markerShadow = 'rgba(217, 119, 6, 0.35)';

  if (diffPercent > 5) {
    comparisonText = `${Math.abs(diffPercent).toFixed(1)}% över genomsnittet`;
    comparisonColor = 'text-nsr-teal';
    barColor = 'bg-gradient-to-r from-nsr-teal/40 to-nsr-teal/70';
    markerBg = '#007788';
    markerShadow = 'rgba(0, 119, 136, 0.35)';
  } else if (diffPercent < -5) {
    comparisonText = `${Math.abs(diffPercent).toFixed(1)}% under genomsnittet`;
    comparisonColor = 'text-red-500';
    barColor = 'bg-gradient-to-r from-red-200 to-red-300';
    markerBg = '#ef4444';
    markerShadow = 'rgba(239, 68, 68, 0.4)';
  }

  return (
    <div className="space-y-4 p-4 rounded-xl bg-nsr-teal/5 border border-nsr-teal/20">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-nsr-ink">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <span className={`text-sm font-black ${comparisonColor}`}>{comparisonText}</span>
      </div>

      <div className="relative">
        <div className="relative h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full overflow-hidden shadow-inner">
          <div
            className={`absolute top-0 left-0 h-full ${barColor} transition-all duration-500`}
            style={{ width: `${Math.max(0, Math.min(100, position))}%` }}
          />
          <div
            className="absolute top-0 bottom-0 flex flex-col items-center transition-all duration-500 z-10"
            style={{ left: `${Math.max(0, Math.min(100, avgPosition))}%` }}
          >
            <div className="w-0.5 h-full bg-gray-500" />
            <span className="text-[10px] font-bold text-gray-600 whitespace-nowrap bg-white px-2 py-0.5 rounded shadow mt-1 border border-gray-200">
              Medel
            </span>
          </div>
          <div
            className="absolute -top-1 w-4 h-4 rounded-full border-2 border-white"
            style={{
              left: `calc(${Math.max(0, Math.min(100, position))}% - 8px)`,
              backgroundColor: markerBg,
              boxShadow: `0 6px 14px ${markerShadow}`,
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Färgskalan visar var din fastighet hamnar i förhållande till liknande fastigheter.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs text-gray-700">
        <div className="rounded-lg bg-white/80 border border-nsr-teal/15 px-3 py-2">
          <p className="text-[11px] font-semibold text-gray-600">Min</p>
          <p className="text-sm font-black text-nsr-ink">{formatValue(localMin)} {unit}</p>
        </div>
        <div className="rounded-lg bg-white/80 border border-nsr-teal/15 px-3 py-2 text-center">
          <p className="text-[11px] font-semibold text-gray-600">Medel</p>
          <p className="text-sm font-black text-nsr-ink">{formatValue(validAverage)} {unit}</p>
        </div>
        <div className="rounded-lg bg-white/80 border border-nsr-teal/15 px-3 py-2 text-right">
          <p className="text-[11px] font-semibold text-gray-600">Max</p>
          <p className="text-sm font-black text-nsr-ink">{formatValue(localMax)} {unit}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <span className="text-2xl font-black text-nsr-ink">
          {formatValue(validValue)} {unit}
        </span>
        {typeof comparisonCount === 'number' && comparisonCount > 0 && (
          <span className="text-xs text-gray-500">
            Jämförd mot {comparisonCount} fastigheter
          </span>
        )}
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const location = useLocation();
  const { state } = location as { state?: { propertyName: string; numberOfApartments?: number;} };
  const propertyName = state?.propertyName || '';
  const numberOfApartments = state?.numberOfApartments ?? 0;
  const propertyIdNumber = propertyId ? Number(propertyId) : null;

  const [loading, setLoading] = useState(true);
  const [collectionFee, setCollectionFee] = useState<CollectionFee | null>(null);
  const [lockType, setLockType] = useState<LockType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [containers, setContainers] = useState<ContainerData[]>([]);
  const [data, setData] = useState<{
    annualCost: AnnualCostDTO
  } | null>(null);
  const [openWasteGroups, setOpenWasteGroups] = useState<Record<string, boolean>>({});
  const {
    data: comparison,
    loading: comparisonLoading,
    error: comparisonError,
  } = useComparison(propertyIdNumber);

  const groupedContainers = containers.reduce((acc, container) => {
    if (!acc[container.fractionType]) acc[container.fractionType] = [];
    acc[container.fractionType].push(container);
    return acc;
  }, {} as Record<string, ContainerData[]>);
  const containerSummaries = Object.entries(groupedContainers).map(([type, list]) => {
    const totalVolume = list.reduce((sum, c) => sum + c.size * c.quantity, 0);
    const totalQuantity = list.reduce((sum, c) => sum + c.quantity, 0);
    const totalAnnualVolume = list.reduce((sum, c) => sum + c.size * c.quantity * c.emptyingFrequency, 0);
    const litersPerWeekPerApartment = numberOfApartments > 0 ? totalAnnualVolume / 52 / numberOfApartments : 0;
    const costPerYear = list.reduce((sum, c) => {
      const containerCost = Number(c.cost) || 0;
      const qty = Number(c.quantity) || 0;
      const freq = Number(c.emptyingFrequency) || 0;
      const collection = Number(collectionFee?.cost) || 0;

      const unitPricePerEmptying = qty * collection * freq;
      const annualForThisContainerType = unitPricePerEmptying + containerCost * qty;

      return sum + annualForThisContainerType;
    }, 0);

    const indicator =
      litersPerWeekPerApartment > 45
        ? {
            dot: "bg-red-500",
            badgeBg: "bg-red-50",
            badgeText: "text-red-700",
            badgeRing: "ring-red-200",
            label: "Hög nivå",
          }
        : litersPerWeekPerApartment > 30
          ? {
              dot: "bg-yellow-400",
              badgeBg: "bg-amber-50",
              badgeText: "text-amber-700",
              badgeRing: "ring-amber-200",
              label: "Medel nivå",
            }
          : {
              dot: "bg-green-500",
              badgeBg: "bg-emerald-50",
              badgeText: "text-emerald-700",
              badgeRing: "ring-emerald-200",
              label: "Låg nivå",
            };

    return {
      type,
      containers: list,
      totalVolume,
      totalQuantity,
      totalAnnualVolume,
      litersPerWeekPerApartment,
      costPerYear,
      indicator,
    };
  });

    const totalAnnualCollectionFee = containerSummaries.reduce((sum, summary) => {
        return sum + summary.containers.reduce((containerSum, container) => {
            const qty = Number(container.quantity) || 0;
            const freq = Number(container.emptyingFrequency) || 0;
            const collection = Number(collectionFee?.cost) || 0;
            return containerSum + (qty * collection * freq);
        }, 0);
    }, 0);

    const totalAnnualLockCost = lockType ? containerSummaries.reduce((sum, summary) => {
        return sum + summary.containers.reduce((containerSum, container) => {
            const qty = Number(container.quantity) || 0;
            const freq = Number(container.emptyingFrequency) || 0;
            const lockCost = Number(lockType.cost) || 0;
            return containerSum + (qty * lockCost * freq);
        }, 0);
    }, 0) : 0;

    useEffect(() => {
        if (!propertyIdNumber) return;

        async function loadStatistics() {

            try {
                const [containersData, annualCostData, collectionFeeData, lockTypeData] = await Promise.all([
                    getPropertyContainers(propertyIdNumber!),
                    getAnnualCost(propertyIdNumber!),
                    getCollectionFee(propertyIdNumber!),
                    getLockTypeForProperty(propertyIdNumber!),
                ]);

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

                setCollectionFee({
                    cost: Number(collectionFeeData?.cost) || 0,
                });

                setLockType({
                    id: lockTypeData.id,
                    name: lockTypeData.name,
                    cost: lockTypeData.cost,
                });

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
    }, [propertyIdNumber]);

  const toggleWasteGroup = (type: string) =>
    setOpenWasteGroups((prev) => ({ ...prev, [type]: !prev[type] }));

  if (loading) return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <LoadingBar message="Laddar statistik..." />
    </main>
  );
  if (error) return <main className="mx-auto max-w-7xl px-4 py-8"><div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div></main>;
  if (!data) return <main className="mx-auto max-w-7xl px-4 py-8"><p className="text-gray-600">Ingen statistik hittades.</p></main>;

  const propertyDisplayName = propertyName || `#${propertyId}`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft flex flex-col sm:justify-between gap-4">
        <div>
          <h1 className="h1 mb-2">Rapporter & Statistik</h1>
          <p className="mt-2 text-gray-600">Här visas statistik och jämförelser för fastigheten {propertyDisplayName}.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Link to="/statistics" className="btn-secondary text-sm self-end">← Tillbaka till fastigheter</Link>
        </div>
      </div>

        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-black text-nsr-ink">Dragvägskostnad</h3>
                        <p className="text-xs text-gray-500 mt-1">Per hämtning och kärl</p>
                    </div>
                    <div className="rounded-full bg-nsr-teal/10 p-3">
                        <svg className="w-6 h-6 text-nsr-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                        <span className="text-sm text-gray-600">Pris per hämtning:</span>
                        <span className="text-2xl font-black text-nsr-ink">{collectionFee?.cost.toLocaleString() || 0} kr</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-baseline justify-between">
                            <span className="text-sm font-semibold text-gray-700">Total årskostnad:</span>
                            <span className="text-xl font-black text-nsr-teal">{totalAnnualCollectionFee.toLocaleString()} kr</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Baserat på alla kärl och hämtningsfrekvenser</p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-black text-nsr-ink">Lås</h3>
                        <p className="text-xs text-gray-500 mt-1">{lockType?.name || 'Inget lås valt'}</p>
                    </div>
                    <div className="rounded-full bg-amber-500/10 p-3">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                        <span className="text-sm text-gray-600">Pris per hämtning:</span>
                        <span className="text-2xl font-black text-nsr-ink">{lockType?.cost.toLocaleString() || 0} kr</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-baseline justify-between">
                            <span className="text-sm font-semibold text-gray-700">Total årskostnad:</span>
                            <span className="text-xl font-black text-amber-600">{totalAnnualLockCost.toLocaleString()} kr</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Baserat på alla kärl och hämtningsfrekvenser</p>
                    </div>
                </div>
            </div>
        </section>

      <section className="mb-8 rounded-2xl border bg-white p-6 shadow-soft overflow-x-auto">
        <div className="mb-4 space-y-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-nsr-teal/10 px-3 py-1 text-xs font-semibold text-nsr-teal">
            Avfall & Kostnadsstatistik
          </span>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-black text-nsr-ink">Volymer och kostnader</h2>
            <p className="text-gray-500 text-sm">
              Antal lägenheter: <span className="font-semibold text-gray-800">{numberOfApartments}</span>
            </p>
          </div>
        </div>

        <table className="hidden sm:table min-w-full border border-gray-200 text-sm text-gray-700">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-3 py-2 border">Fraktion</th>
              <th className="px-3 py-2 border text-right">Totala volym (L)</th>
              <th className="px-3 py-2 border text-right">Totalt antal kärl</th>
              <th className="px-3 py-2 border text-right">Årsvolym (L)</th>
                <th className="px-3 py-2 border text-right">Liter per lägenhet/vecka</th>
              <th className="px-3 py-2 border text-right">Årskostnad (kr)</th>
            </tr>
          </thead>
          <tbody>
            {containerSummaries.map((summary) => {
              return (
                <React.Fragment key={summary.type}>
                  <tr
                    onClick={() => toggleWasteGroup(summary.type)}
                    className="cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <td className="px-3 py-3 border font-semibold">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${summary.indicator.badgeBg} ${summary.indicator.badgeText} ${summary.indicator.badgeRing}`}
                            title={`${summary.litersPerWeekPerApartment.toFixed(1)} L/week/apartment`}
                          >
                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${summary.indicator.dot}`} />
                            {summary.indicator.label}
                          </span>
                          <span className="text-gray-900 text-sm">{summary.type}</span>
                        </div>
                        {openWasteGroups[summary.type] ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                      </div>
                    </td>
                    <td className="px-3 py-2 border font-semibold text-right tabular-nums">{summary.totalVolume.toLocaleString()}</td>
                    <td className="px-3 py-2 border font-semibold text-right tabular-nums">{summary.totalQuantity.toLocaleString()}</td>
                    <td className="px-3 py-2 border font-semibold text-right tabular-nums">{summary.totalAnnualVolume.toLocaleString()}</td>
                      <td className="px-3 py-2 border font-semibold text-right tabular-nums">{Number(summary.litersPerWeekPerApartment.toFixed(1)).toLocaleString()}</td>
                    <td className="px-3 py-2 border font-semibold text-right tabular-nums">{summary.costPerYear.toLocaleString()}</td>
                  </tr>

                  {openWasteGroups[summary.type] && (
                    <tr>
                      <td colSpan={5} className="p-0 border-0">
                        <div className="p-4 bg-white border-t border-gray-200">
                          <table className="w-full border border-gray-300 text-sm text-gray-700">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 border text-right">Volym (L)</th>
                                <th className="px-3 py-2 border text-right">Antal kärl</th>
                                <th className="px-3 py-2 border text-right">Hämtfrekvens (ggr/år)</th>
                                <th className="px-3 py-2 border text-right">Årsvolym (L)</th>
                                <th className="px-3 py-2 border text-right">Kostnad/år (kr)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {summary.containers.map((container, idx) => {
                                const annualVolume = container.size * container.quantity * container.emptyingFrequency;
                                  const containerCost = Number(container.cost) || 0;
                                  const qty = Number(container.quantity) || 0;
                                  const freq = Number(container.emptyingFrequency) || 0;
                                  const lock = Number(collectionFee?.cost) || 0;

                                  const unitPricePerEmptying = (qty * lock) * freq;
                                  const annualCost = unitPricePerEmptying + (qty * containerCost);
                                return (
                                  <tr key={idx} className="bg-white text-gray-600">
                                    <td className="px-3 py-2 border text-right tabular-nums">{container.size.toLocaleString()}</td>
                                    <td className="px-3 py-2 border text-right tabular-nums">{container.quantity.toLocaleString()}</td>
                                    <td className="px-3 py-2 border text-right tabular-nums">{container.emptyingFrequency.toLocaleString()}</td>
                                    <td className="px-3 py-2 border text-right tabular-nums">{annualVolume.toLocaleString()}</td>
                                    <td className="px-3 py-2 border text-right tabular-nums">{annualCost.toLocaleString()}</td>
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

        <div className="sm:hidden space-y-4">
          {containerSummaries.map((summary) => (
            <div key={summary.type} className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => toggleWasteGroup(summary.type)}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${summary.indicator.badgeBg} ${summary.indicator.badgeText} ${summary.indicator.badgeRing}`}
                      title={`${summary.litersPerWeekPerApartment.toFixed(1)} L/week/apartment`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full ${summary.indicator.dot}`} />
                      {summary.indicator.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{summary.type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <span><strong className="text-gray-800">Volym:</strong> {summary.totalVolume.toLocaleString()} L</span>
                    <span><strong className="text-gray-800">Kärl:</strong> {summary.totalQuantity.toLocaleString()}</span>
                    <span><strong className="text-gray-800">Årsvolym:</strong> {summary.totalAnnualVolume.toLocaleString()} L</span>
                    <span><strong className="text-gray-800">Årskostnad:</strong> {summary.costPerYear.toLocaleString()} kr</span>
                  </div>
                </div>
                {openWasteGroups[summary.type] ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>

              {openWasteGroups[summary.type] && (
                <div className="border-t border-gray-200 bg-white">
                  <div className="px-4 py-3 text-xs text-gray-600 grid grid-cols-2 gap-2">
                    <span><strong className="text-gray-800">L/lgh/v:</strong> {Number(summary.litersPerWeekPerApartment.toFixed(1)).toLocaleString()}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-t border-gray-200 text-xs text-gray-700">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 border text-right">Volym (L)</th>
                          <th className="px-3 py-2 border text-right">Antal kärl</th>
                          <th className="px-3 py-2 border text-right">Hämtfrekvens</th>
                          <th className="px-3 py-2 border text-right">Årsvolym (L)</th>
                          <th className="px-3 py-2 border text-right">Kostnad/år</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.containers.map((container, idx) => {
                          const annualVolume = container.size * container.quantity * container.emptyingFrequency;
                          const containerCost = Number(container.cost) || 0;
                          const qty = Number(container.quantity) || 0;
                          const freq = Number(container.emptyingFrequency) || 0;
                          const lock = Number(collectionFee?.cost) || 0;
                          const unitPricePerEmptying = qty * lock * freq;
                          const annualCost = unitPricePerEmptying + qty * containerCost;
                          return (
                            <tr key={idx} className="bg-white">
                              <td className="px-3 py-2 border text-right tabular-nums">{container.size.toLocaleString()}</td>
                              <td className="px-3 py-2 border text-right tabular-nums">{container.quantity.toLocaleString()}</td>
                              <td className="px-3 py-2 border text-right tabular-nums">{container.emptyingFrequency.toLocaleString()}</td>
                              <td className="px-3 py-2 border text-right tabular-nums">{annualVolume.toLocaleString()}</td>
                              <td className="px-3 py-2 border text-right tabular-nums">{annualCost.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        {comparisonError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 shadow-soft">
            {comparisonError}
          </div>
        )}

        {comparisonLoading && (
          <div className="rounded-2xl border bg-white p-6 text-center shadow-soft">
            <p className="text-gray-600">Laddar jämförelsedata…</p>
          </div>
        )}

        {comparison && (
          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-2 mb-4">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-nsr-teal/10 px-3 py-1 text-xs font-semibold text-nsr-teal">
                  Jämförelseöversikt
                </span>
                <h2 className="text-2xl font-black text-nsr-ink">Liknande fastigheter</h2>
                <p className="text-sm text-gray-600">
                  Fastighet: {comparison.address} • {comparison.numberOfApartments} lägenheter • {comparison.propertyType}
                </p>
                <p className="text-xs text-gray-500">
                  Baserad på fastigheter med liknande antal lägenheter (±5) i samma kommun.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <ComparisonScale
                  title="Kostnader"
                  value={toNumber(comparison.costComparison?.propertyCost)}
                  average={toNumber(comparison.costComparison?.averageCost)}
                  min={toNumber(comparison.costComparison?.minCost)}
                  max={toNumber(comparison.costComparison?.maxCost)}
                  unit="kr/år"
                  comparisonCount={comparison.costComparison?.comparisonGroupSize ?? null}
                  formatValue={(v) => v.toLocaleString('sv-SE', { maximumFractionDigits: 0 })}
                />

                <ComparisonScale
                  title="Kärlstorlek"
                  value={toNumber(comparison.containerSizeComparison?.propertyTotalVolume)}
                  average={toNumber(comparison.containerSizeComparison?.averageVolume)}
                  unit="L"
                  subtitle={
                    comparison.containerSizeComparison?.comparison
                      ? `Dina kärl är ${comparison.containerSizeComparison.comparison} än snittet`
                      : undefined
                  }
                  comparisonCount={comparison.containerSizeComparison?.comparisonGroupSize ?? null}
                />
              </div>
            </div>

            {!!comparison.wasteAmountComparisons?.length && (
              <div className="rounded-2xl border bg-white p-6 shadow-soft">
                <h3 className="text-lg font-black text-nsr-ink mb-4">Avfallsmängder per fraktion</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {comparison.wasteAmountComparisons.map((waste, index) => (
                    <ComparisonScale
                      key={`${waste.wasteType || 'waste'}-${index}`}
                      title={waste.wasteType || 'Avfall'}
                      value={toNumber(waste.propertyWasteAmount)}
                      average={toNumber(waste.averageWasteAmount)}
                      min={toNumber(waste.minWasteAmount)}
                      max={toNumber(waste.maxWasteAmount)}
                      unit="kg/år"
                      comparisonCount={waste.comparisonGroupSize ?? null}
                    />
                  ))}
                </div>
              </div>
            )}

            {!!comparison.frequencyComparisons?.length && (
              <div className="rounded-2xl border bg-white p-6 shadow-soft">
                <h3 className="text-lg font-black text-nsr-ink mb-4">Hämtningsfrekvens</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {comparison.frequencyComparisons.map((freq, index) => (
                    <ComparisonScale
                      key={`${freq.wasteType || 'freq'}-${index}`}
                      title={freq.wasteType || 'Avfall'}
                      value={toNumber(freq.propertyFrequency)}
                      average={toNumber(freq.averageFrequency)}
                      unit="gånger/år"
                      comparisonCount={freq.comparisonGroupSize ?? null}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
