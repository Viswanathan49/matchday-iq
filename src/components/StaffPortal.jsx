import { useState, useEffect } from 'react';

const StaffPortal = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resolveIncident = async (id) => {
    try {
      const res = await fetch(`/api/incidents/${id}/resolve`, { method: 'POST' });
      if (res.ok) {
        fetchIncidents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Operations Command Center</h2>
        <p className="text-slate-300">Live incident reports and crowd anomalies.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Active Incidents</h3>
        {loading ? (
          <p className="text-slate-500">Loading incidents...</p>
        ) : incidents.length === 0 ? (
          <p className="text-slate-500">No active incidents. Stadium is clear.</p>
        ) : (
          <ul className="space-y-3">
            {incidents.map((incident) => (
              <li key={incident.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold mr-2 uppercase ${
                    incident.type === 'medical' ? 'bg-red-100 text-red-700' :
                    incident.type === 'security' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {incident.type}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    Location: {incident.location}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Reported at: {new Date(incident.timestamp).toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={() => resolveIncident(incident.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
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
