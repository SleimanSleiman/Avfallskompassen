import { useEffect, useState } from 'react';
import { getMyProperties } from '../lib/property';
import type { Property } from '../lib/property';
import LoadingBar from './LoadingBar';

// Determine notification threshold in seconds.
// Frontend uses VITE_NOTIFICATION_THRESHOLD_SECONDS (set in .env) if available.
// Default is ~1 year (31536000 seconds).
const DEFAULT_THRESHOLD_SECONDS = (() => {
  try {
    const raw = (import.meta as any).env?.VITE_NOTIFICATION_THRESHOLD_SECONDS;
    if (raw) return parseInt(raw, 10);
  } catch (e) {
    // ignore
  }
  // default to ~1 year in seconds
  return 31536000;
})();

function isOlderThanThreshold(dateString?: string) {
  if (!dateString) return false;
  const d = new Date(dateString);
  const now = new Date();
  const threshold = new Date(now.getTime() - DEFAULT_THRESHOLD_SECONDS * 1000);
  return d < threshold;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('dismissedNotifications');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const props = await getMyProperties();
      const candidates = props.filter((p) => {
        // Determine last meaningful change
        const lastChange = p.updatedAt ?? p.createdAt;
        if (!lastChange) return false;

        // If property was already notified after the last change, skip it
        if (p.lastNotifiedAt) {
          const notified = new Date(p.lastNotifiedAt);
          const changed = new Date(lastChange);
          if (notified >= changed) return false;
        }

        // Only notify if it's older than the configured threshold
        return isOlderThanThreshold(lastChange);
      });

      // Exclude dismissed local ids
      const visible = candidates.filter((p) => !dismissed.includes(p.id));
      setNotifications(visible);
    } catch (e) {
      console.error('Failed to load properties for notifications', e);
    } finally {
      setLoading(false);
    }
  }

  function dismiss(id: number) {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem('dismissedNotifications', JSON.stringify(next));
    setNotifications((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) {
    return (
      <div className="mb-6 rounded-2xl border bg-white p-6 shadow-soft">
        <h2 className="text-lg font-black">Meddelanden</h2>
        <div className="mt-4">
          <LoadingBar message="Läser meddelanden..." />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">Meddelanden</h2>
        <span className="text-sm text-gray-500">{notifications.length} nya</span>
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500 mt-3">Inga meddelanden för närvarande.</p>
      ) : (
        <div className="space-y-4 mt-4">
          {notifications.map((n) => {
            const lastChange = n.updatedAt ?? n.createdAt;
            return (
              <div key={n.id} className="p-4 bg-gray-50 rounded-lg flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Uppdatera din fastighet: {n.address}</p>
                  <p className="text-sm text-gray-600">Senaste ändring: {lastChange ? new Date(lastChange).toLocaleDateString('sv-SE') : '—'}</p>
                  <p className="text-sm text-gray-500 mt-1">Det har gått mer än ett år sedan din fastighet senast ändrades — kontrollera att informationen är korrekt.</p>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <a href={`/properties`} className="btn-primary text-sm">Uppdatera</a>
                  <button onClick={() => dismiss(n.id)} className="btn-secondary text-sm">Ignorera</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
