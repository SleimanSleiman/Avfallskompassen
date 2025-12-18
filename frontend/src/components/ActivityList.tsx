import LoadingBar from "./LoadingBar";

export default function ActivityItem({ message, timestamp, color }) {
  const formattedTime = new Date(timestamp).toLocaleString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex items-center p-4 bg-gray-50 rounded-xl shadow-sm">
      <div className={`w-2 h-2 rounded-full mr-4 ${color}`}></div>
      <div className="flex-1">
        <p className="brodtext text-gray-700">{message}</p>
        <p className="text-sm text-gray-500">{formattedTime}</p>
      </div>
    </div>
  );
}

export function ActivityList({ activities = [], loading, error }: { activities?: any[]; loading: boolean; error?: string | null }) {
  const colors = ["bg-nsr-accent", "bg-nsr-teal"];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft">
      <h2 className="text-xl font-black text-nsr-ink mb-6">Senaste aktivitet</h2>

      {loading && <LoadingBar message="Laddar aktiviteter…" />}

      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">Kunde inte hämta aktiviteter: {error}</p>
        </div>
      )}

      <div
        className="space-y-4 overflow-y-auto"
        style={{
          maxHeight: "calc(5 * (4rem + 1rem))",
        }}
      >
        {!loading && activities.length === 0 && !error && (
          <p className="text-gray-500 brodtext">Inga aktiviteter att visa.</p>
        )}

        {!loading && activities.map((a, idx) => (
          <ActivityItem
            key={idx}
            message={a.details}
            timestamp={a.timeStamp}
            color={colors[idx % colors.length]}
          />
        ))}
      </div>
    </div>
  );
}