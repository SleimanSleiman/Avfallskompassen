import { useState, useEffect } from 'react';
import { getMyProperties } from '../lib/Property';
import type { Property } from '../lib/Property';
import { currentUser } from '../lib/auth';

type ComparisonData = {
  costs: {
    yourCost: number;
    averageCost: number;
    minCost: number;
    maxCost: number;
    percentageDifference: number;
    comparisonCount: number;
  };
  containerSize: {
    yourVolume: number;
    averageVolume: number;
    minVolume: number;
    maxVolume: number;
    percentageDifference: number;
    comparisonCount: number;
  };
  wasteAmounts: {
    yourAmount: number;
    averageAmount: number;
    minAmount: number;
    maxAmount: number;
    percentageDifference: number;
    comparisonCount: number;
  };
  collectionFrequency: {
    yourFrequency: number;
    averageFrequency: number;
    percentageDifference: number;
    comparisonCount: number;
  };
};

function ComparisonScale({ 
  value, 
  average, 
  min, 
  max, 
  unit = 'kr',
  formatValue = (v: number) => v.toLocaleString('sv-SE')
}: { 
  value: number; 
  average: number; 
  min: number; 
  max: number;
  unit?: string;
  formatValue?: (v: number) => string;
}) {
  const range = max - min;
  const position = range > 0 ? ((value - min) / range) * 100 : 50;
  const avgPosition = range > 0 ? ((average - min) / range) * 100 : 50;
  const diff = value - average;
  const diffPercent = average > 0 ? (diff / average) * 100 : 0;

  let comparisonText = 'Lika mycket som medelvärdet';
  let comparisonSubtext = '';
  let comparisonColor = 'text-gray-700';
  let barColor = 'bg-gradient-to-r from-nsr-teal/40 to-nsr-teal/60';
  let markerColor = 'bg-nsr-teal';
  let markerShadow = 'shadow-lg shadow-nsr-teal/50';
  
  if (Math.abs(diffPercent) < 5) {
    comparisonText = 'Lika mycket som medelvärdet';
    comparisonSubtext = '';
    comparisonColor = 'text-gray-700';
    barColor = 'bg-gradient-to-r from-gray-300 to-gray-400';
    markerColor = 'bg-gray-500';
    markerShadow = 'shadow-lg shadow-gray-400/50';
  } else if (diffPercent > 0) {
    comparisonText = `${Math.abs(diffPercent).toFixed(1)}% mer än medelvärdet`;
    comparisonSubtext = 'Högre än genomsnittet';
    comparisonColor = 'text-nsr-teal';
    barColor = 'bg-gradient-to-r from-[rgba(0,119,136,0.4)] to-[rgba(0,119,136,0.7)]';
    markerColor = 'bg-[rgb(0,119,136)]';
    markerShadow = 'shadow-lg shadow-[rgba(0,119,136,0.5)]';
  } else {
    comparisonText = `${Math.abs(diffPercent).toFixed(1)}% mindre än medelvärdet`;
    comparisonSubtext = 'Lägre än genomsnittet';
    comparisonColor = 'text-green-600';
    barColor = 'bg-gradient-to-r from-green-400/50 to-green-500/70';
    markerColor = 'bg-green-500';
    markerShadow = 'shadow-lg shadow-green-500/50';
  }

  return (
    <div className="space-y-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-nsr-ink">Din fastighet</span>
          <span className={`text-base font-black ${comparisonColor}`}>{comparisonText}</span>
        </div>
        {comparisonSubtext && (
          <p className={`text-xs ${comparisonColor} text-right`}>{comparisonSubtext}</p>
        )}
      </div>
      
      <div className="relative">
        <div className="relative h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full overflow-visible shadow-inner">
          <div 
            className={`absolute top-0 left-0 h-full ${barColor} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.max(0, Math.min(100, position))}%` }}
            title="Din fastighets värde"
          />
          
          <div 
            className="absolute top-0 bottom-0 flex flex-col items-center transition-all duration-500 z-10"
            style={{ left: `${Math.max(0, Math.min(100, avgPosition))}%` }}
          >
            <div className="w-0.5 h-full bg-gray-500 shadow-sm" />
            <span className="text-[10px] font-bold text-gray-600 whitespace-nowrap bg-white px-2 py-0.5 rounded shadow-md mt-1 border border-gray-200">
              Medel
            </span>
          </div>
          
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Den färgade baren visar din fastighets värde
        </p>
      </div>
      
      <div className="flex justify-between text-xs text-gray-600">
        <div className="text-left">
          <span className="font-medium">Min</span>
          <p className="text-gray-500">{formatValue(min)} {unit}</p>
        </div>
        <div className="text-center">
          <span className="font-medium">Medel</span>
          <p className="text-gray-500">{formatValue(average)} {unit}</p>
        </div>
        <div className="text-right">
          <span className="font-medium">Max</span>
          <p className="text-gray-500">{formatValue(max)} {unit}</p>
        </div>
      </div>
      
      <div className="text-center pt-2 border-t border-gray-200">
        <span className="text-2xl font-black text-nsr-ink">
          {formatValue(value)} {unit}
        </span>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const user = currentUser();

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      const data = await getMyProperties();
      setProperties(data);
      if (data.length > 0 && !selectedProperty) {
        setSelectedProperty(data[0]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  }

  useEffect(() => {
    if (selectedProperty) {
      loadComparisonData(selectedProperty.id);
    }
  }, [selectedProperty]);

  async function loadComparisonData(propertyId: number) {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData: ComparisonData = {
        costs: {
          yourCost: 125000,
          averageCost: 118000,
          minCost: 95000,
          maxCost: 145000,
          percentageDifference: 5.9,
          comparisonCount: 12,
        },
        containerSize: {
          yourVolume: 2400,
          averageVolume: 2200,
          minVolume: 1800,
          maxVolume: 2800,
          percentageDifference: 9.1,
          comparisonCount: 12,
        },
        wasteAmounts: {
          yourAmount: 8500,
          averageAmount: 8200,
          minAmount: 6800,
          maxAmount: 10200,
          percentageDifference: 3.7,
          comparisonCount: 12,
        },
        collectionFrequency: {
          yourFrequency: 24,
          averageFrequency: 22,
          percentageDifference: 9.1,
          comparisonCount: 12,
        },
      };
      
      setComparisonData(mockData);
    } catch (error) {
      console.error('Error loading comparison data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (properties.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-soft">
          <p className="text-lg font-medium text-gray-600">Inga fastigheter hittades</p>
          <p className="mt-2 text-gray-500">Du behöver ha fastigheter för att se jämförelser.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-soft">
        <h1 className="h1 rubriktext">Rapporter & Statistik</h1>
        <p className="mt-2 text-gray-600 brodtext">
          Jämför dina fastigheter med liknande fastigheter i samma kommun
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
          value={selectedProperty?.id || ''}
          onChange={(e) => {
            const prop = properties.find(p => p.id === parseInt(e.target.value));
            setSelectedProperty(prop || null);
          }}
          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal"
        >
          {properties.map((prop) => (
            <option key={prop.id} value={prop.id}>
              {prop.address}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-8 text-center shadow-soft">
          <p className="text-gray-600">Laddar jämförelsedata...</p>
        </div>
      ) : comparisonData && selectedProperty ? (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-soft">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-nsr-ink">Jämförelse</h2>
                {selectedProperty?.municipalityName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-nsr-teal/10 text-nsr-teal rounded-lg text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedProperty.municipalityName}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Jämförs med {comparisonData.costs.comparisonCount} fastigheter med liknande antal lägenheter (±5) i samma kommun
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-nsr-ink mb-4">Kostnader</h3>
                  <ComparisonScale
                    value={comparisonData.costs.yourCost}
                    average={comparisonData.costs.averageCost}
                    min={comparisonData.costs.minCost}
                    max={comparisonData.costs.maxCost}
                    unit="kr/år"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-black text-nsr-ink mb-4">Kärlstorlek</h3>
                  <ComparisonScale
                    value={comparisonData.containerSize.yourVolume}
                    average={comparisonData.containerSize.averageVolume}
                    min={comparisonData.containerSize.minVolume}
                    max={comparisonData.containerSize.maxVolume}
                    unit="L"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-nsr-ink mb-4">Avfallsmängder</h3>
                  <ComparisonScale
                    value={comparisonData.wasteAmounts.yourAmount}
                    average={comparisonData.wasteAmounts.averageAmount}
                    min={comparisonData.wasteAmounts.minAmount}
                    max={comparisonData.wasteAmounts.maxAmount}
                    unit="kg/år"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-black text-nsr-ink mb-4">Hämtningsfrekvens</h3>
                  <ComparisonScale
                    value={comparisonData.collectionFrequency.yourFrequency}
                    average={comparisonData.collectionFrequency.averageFrequency}
                    min={comparisonData.collectionFrequency.averageFrequency * 0.7}
                    max={comparisonData.collectionFrequency.averageFrequency * 1.3}
                    unit="gånger/år"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

