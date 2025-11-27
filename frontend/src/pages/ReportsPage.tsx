import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMyProperties, type Property } from '../lib/Property';
import { useComparison } from './PlanningTool/hooks/useComparison';

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
    <div className="space-y-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
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

      <div className="flex justify-between text-xs text-gray-600">
        <div>
          <span className="font-medium">Min</span>
          <p className="text-gray-500">{formatValue(localMin)} {unit}</p>
        </div>
        <div className="text-center">
          <span className="font-medium">Medel</span>
          <p className="text-gray-500">{formatValue(validAverage)} {unit}</p>
        </div>
        <div className="text-right">
          <span className="font-medium">Max</span>
          <p className="text-gray-500">{formatValue(localMax)} {unit}</p>
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

export default function ReportsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);

  const selectedProperty = useMemo(
    () => properties.find((prop) => prop.id === selectedPropertyId) ?? null,
    [properties, selectedPropertyId],
  );

  const {
    data: comparison,
    loading: comparisonLoading,
    error: comparisonError,
  } = useComparison(selectedPropertyId);

  const loadProperties = useCallback(async () => {
    try {
      setLoadingProperties(true);
      setPropertiesError(null);
      const data = await getMyProperties();
      setProperties(data);
      setSelectedPropertyId((prev) => prev ?? (data[0]?.id ?? null));
    } catch (error) {
      console.error('Failed to load properties', error);
      setPropertiesError('Kunde inte hämta fastigheter just nu.');
    } finally {
      setLoadingProperties(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  if (loadingProperties) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-soft">
          <p className="text-gray-600">Hämtar fastigheter…</p>
        </div>
      </main>
    );
  }

  if (propertiesError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-soft">
          <p className="text-red-600 font-medium">{propertiesError}</p>
          <button
            onClick={loadProperties}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-nsr-teal px-4 py-2 text-white font-semibold"
          >
            Försök igen
          </button>
        </div>
      </main>
    );
  }

  if (!properties.length) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-soft">
          <p className="text-lg font-medium text-gray-600">Inga fastigheter hittades</p>
          <p className="mt-2 text-gray-500">Du behöver registrera en fastighet för att se jämförelser.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft">
        <h1 className="h1 rubriktext">Rapporter & Statistik</h1>
        <p className="mt-2 text-gray-600 brodtext">
          Jämför din fastighet med liknande fastigheter (samma kommun och ±5 lägenheter).
        </p>
      </div>

      <div className="mb-6 rounded-2xl border bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="property-select" className="block text-sm font-medium text-nsr-ink">
            Välj fastighet
          </label>
          {selectedProperty?.municipalityName && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-nsr-teal/10 text-nsr-teal rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {selectedProperty.municipalityName}
            </span>
          )}
        </div>
        <select
          id="property-select"
          value={selectedPropertyId ?? ''}
          onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
        >
          {properties.map((prop) => (
            <option key={prop.id} value={prop.id}>
              {prop.address}
            </option>
          ))}
        </select>
      </div>

      {comparisonError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {comparisonError}
        </div>
      )}

      {comparisonLoading && (
        <div className="mb-6 rounded-2xl border bg-white p-6 text-center shadow-soft">
          <p className="text-gray-600">Laddar jämförelsedata…</p>
        </div>
      )}

      {comparison && (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-2 mb-4">
              <h2 className="text-xl font-black text-nsr-ink">Jämförelseöversikt</h2>
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
    </main>
  );
}

