import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPropertiesSimple } from "../lib/Statistics";

interface Property {
  id: number;
  name: string;
  numberOfApartments?: number;
}

export default function StatisticsOverviewPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        },
      });
    }

    function exportPDF(p: Property) {
      // Placeholder — you can hook your real PDF generation here
      console.log("Export PDF for property", p.id);
    }

    if (loading) {
      return (
        <main className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-gray-600">Laddar fastigheter...</p>
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
              {properties.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {p.address}
                  </h3>

                  <div className="mt-2 text-sm text-gray-700">
                    <div>
                      <span className="text-gray-500">Lägenheter:</span>{" "}
                      {p.numberOfApartments ?? "—"}
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