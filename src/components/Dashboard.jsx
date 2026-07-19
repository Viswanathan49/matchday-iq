import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getStadiumDensity } from '../services/aiService';

/**
 * Renders a single zone density indicator.
 * @param {Object} props
 * @param {string} props.zone - Zone name.
 * @param {number} props.density - Density percentage.
 */
const ZoneIndicator = ({ zone, density }) => {
  const bgColor = density > 80 ? 'bg-red-500' : density > 50 ? 'bg-yellow-500' : 'bg-green-500';
  
  return (
    <div className="flex items-center justify-between p-4 mb-2 bg-white dark:bg-slate-800 rounded shadow">
      <span className="font-medium text-slate-800 dark:text-slate-100">{zone}</span>
      <div className="flex items-center gap-4">
        <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full ${bgColor}`} style={{ width: `${density}%` }} aria-label={`${density}% capacity`} />
        </div>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 w-10 text-right">{density}%</span>
      </div>
    </div>
  );
};

ZoneIndicator.propTypes = {
  zone: PropTypes.string.isRequired,
  density: PropTypes.number.isRequired,
};

/**
 * Dashboard Component displaying real-time operational intelligence.
 */
const Dashboard = () => {
  const [densities, setDensities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDensity = async () => {
      try {
        const data = await getStadiumDensity();
        if (mounted) {
          setDensities(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load density data", error);
        if (mounted) setLoading(false);
      }
    };
    fetchDensity();
    return () => { mounted = false; };
  }, []);

  // Memoize average density calculation
  const averageDensity = useMemo(() => {
    if (densities.length === 0) return 0;
    const total = densities.reduce((acc, curr) => acc + curr.density, 0);
    return Math.round(total / densities.length);
  }, [densities]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Stadium Operations Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Real-time overview of venue capacity and crowding.</p>
      </header>
      
      {loading ? (
        <div className="flex justify-center p-12" aria-live="polite">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-blue-50 dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Avg Venue Density</h2>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">{averageDensity}%</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Live Heatmap Areas</h2>
            <div className="grid gap-2">
              {densities.map((item) => (
                <ZoneIndicator key={item.zone} zone={item.zone} density={item.density} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
