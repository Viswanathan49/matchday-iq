import { useState, useEffect, useCallback } from 'react';

/** Priority badge colors mapped to incident type for quick visual triage. */
const INCIDENT_TYPE_STYLES = {
  medical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  security: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  spill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  maintenance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

/**
 * Reads all active incidents from localStorage.
 * @returns {Array} Array of active incident objects.
 */
const readActiveIncidents = () => {
  try {
    const raw = localStorage.getItem('stadium_incidents');
    const all = raw ? JSON.parse(raw) : [];
    return Array.isArray(all) ? all.filter(inc => inc.status === 'active') : [];
  } catch {
    return [];
  }
};

/**
 * StaffPortal — real-time operations command center for stadium staff.
 * Polls localStorage for fan-submitted incidents every 10 seconds.
 */
const StaffPortal = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = useCallback(() => {
    setIncidents(readActiveIncidents());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  /** Marks an incident as resolved in localStorage and refreshes the list. */
  const resolveIncident = useCallback((id) => {
    try {
      const raw = localStorage.getItem('stadium_incidents');
      const all = raw ? JSON.parse(raw) : [];
      const updated = all.map(inc => inc.id === id ? { ...inc, status: 'resolved', resolvedAt: new Date().toISOString() } : inc);
      localStorage.setItem('stadium_incidents', JSON.stringify(updated));
    } catch {
      // localStorage unavailable — fail silently
    }
    fetchIncidents();
  }, [fetchIncidents]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Operations Command Center</h2>
        <p className="text-slate-300">Live incident reports and crowd anomalies — auto-refreshes every 10 seconds.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Active Incidents</h3>
          <span
            aria-live="polite"
            aria-atomic="true"
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              incidents.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {incidents.length > 0 ? `${incidents.length} Active` : 'All Clear'}
          </span>
        </div>
        {loading ? (
          <div className="flex items-center gap-3 text-slate-500" role="status" aria-label="Loading incidents">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" aria-hidden="true" />
            <span>Loading incidents...</span>
          </div>
        ) : incidents.length === 0 ? (
          <p className="text-slate-500 text-center py-8">✅ No active incidents. Stadium is clear.</p>
        ) : (
          <ul className="space-y-3" aria-label="Active incident list">
            {incidents.map((incident) => (
              <li key={incident.id} className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex-1 min-w-0">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold mr-2 uppercase ${
                    INCIDENT_TYPE_STYLES[incident.type] || 'bg-blue-100 text-blue-700'
                  }`}>
                    {incident.type}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {incident.location}
                  </span>
                  {incident.source === 'ai-chatbot' && (
                    <span className="ml-2 text-xs text-purple-600 dark:text-purple-400 font-medium">via AI</span>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Reported: {new Date(incident.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => resolveIncident(incident.id)}
                  aria-label={`Resolve ${incident.type} incident at ${incident.location}`}
                  className="ml-4 flex-shrink-0 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Mark Resolved
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StaffPortal;
