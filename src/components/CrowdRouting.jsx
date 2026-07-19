import { useState, useEffect, useRef } from 'react';
import { getOptimalRoute } from '../services/aiService';
import PropTypes from 'prop-types';
import StadiumMap from './StadiumMap';

const RouteDisplay = ({ routeData, containerRef }) => {
  if (!routeData) return null;

  return (
    <div ref={containerRef} className="w-full lg:w-1/2 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Assistance Route</h3>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium">
          Crowd: {routeData.crowdingLevel}
        </span>
        {routeData.stepFree && (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Step-free / accessible
          </span>
        )}
        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
          {routeData.estimatedTime} min
        </span>
      </div>

      <ol className="relative border-l border-blue-200 dark:border-blue-800 ml-3 mb-8">                  
        {routeData.route.map((step, index) => (
          <li key={index} className="mb-6 ml-6 last:mb-0">            
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-slate-900 dark:bg-blue-900">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
            </span>
            <p className="flex items-center mb-1 text-base font-semibold text-slate-900 dark:text-white">Walk to {step}</p>
          </li>
        ))}
      </ol>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex gap-4 mt-auto">
        <div className="text-2xl">💡</div>
        <div>
          <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300 mb-1">MatchDay AI Insight</h4>
          <p className="text-xs text-blue-800 dark:text-blue-400">
            {routeData.route[routeData.route.length - 1]?.includes('Food') 
              ? 'Concession lines are currently 30% shorter than the stadium average. Great time to grab a snack!' 
              : routeData.route[routeData.route.length - 1]?.includes('Sensory')
                ? 'The Sensory Room is currently open and operating at low capacity. Staff are available to assist.'
                : 'This route dynamically avoids the main concourse congestion, saving you approximately 4 minutes of walking time.'}
          </p>
        </div>
      </div>
    </div>
  );
};

RouteDisplay.propTypes = {
  routeData: PropTypes.shape({
    route: PropTypes.arrayOf(PropTypes.string).isRequired,
    estimatedTime: PropTypes.number.isRequired,
    crowdingLevel: PropTypes.string.isRequired,
    stepFree: PropTypes.bool,
  }),
  containerRef: PropTypes.oneOfType([
    PropTypes.func, 
    PropTypes.shape({ current: PropTypes.any })
  ])
};

const CrowdRouting = ({ initialDestination }) => {
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState(initialDestination || '');
  const [mapMode, setMapMode] = useState('current'); // 'current' or 'destination'
  const [constraints, setConstraints] = useState({
    wheelchair: false,
    lowVision: false,
    deaf: false
  });
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState(null);
  const routeRef = useRef(null);

  useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination);
      setMapMode('current'); // Ask for current location since dest is known
    }
  }, [initialDestination]);

  const handleRouteSearch = async (e) => {
    e.preventDefault();
    if (!currentLocation || !destination) return;

    setLoading(true);
    setRoute(null);
    try {
      const data = await getOptimalRoute(currentLocation, destination, constraints);
      setRoute(data);
      setTimeout(() => {
        routeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (e) => {
    setConstraints({ ...constraints, [e.target.name]: e.target.checked });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Smart Crowd Routing</h2>
        <p className="text-slate-600 dark:text-slate-400">Accessible wayfinding and dynamic routing to avoid congestion.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <form onSubmit={handleRouteSearch} className="w-full lg:w-1/2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Your context</h3>
          
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMapMode('current')}
                className={`flex-1 py-2 text-sm font-medium rounded-md ${mapMode === 'current' ? 'bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Set Current Location
              </button>
              <button
                type="button"
                onClick={() => setMapMode('destination')}
                className={`flex-1 py-2 text-sm font-medium rounded-md ${mapMode === 'destination' ? 'bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Set Destination
              </button>
            </div>
            
            <StadiumMap 
              selectedZone={mapMode === 'current' ? currentLocation : destination} 
              onSelect={mapMode === 'current' ? setCurrentLocation : setDestination}
            />

            <div className="flex flex-col gap-2 mt-2">
              <p className="text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">From: </span>
                <span className="text-blue-600 dark:text-blue-400">{currentLocation || 'Select on map'}</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">To: </span>
                <span className="text-blue-600 dark:text-blue-400">{destination || 'Select on map'}</span>
              </p>
            </div>
          </div>

          <fieldset className="mb-6 border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
            <legend className="text-sm font-medium text-slate-700 dark:text-slate-300 px-1">Accessibility needs</legend>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <input type="checkbox" name="wheelchair" checked={constraints.wheelchair} onChange={handleCheck} className="w-4 h-4 rounded text-blue-600" />
                Wheelchair / step-free
              </label>
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <input type="checkbox" name="lowVision" checked={constraints.lowVision} onChange={handleCheck} className="w-4 h-4 rounded text-blue-600" />
                Low vision / screen reader
              </label>
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <input type="checkbox" name="deaf" checked={constraints.deaf} onChange={handleCheck} className="w-4 h-4 rounded text-blue-600" />
                Deaf / hard of hearing
              </label>
            </div>
          </fieldset>
          
          <button 
            type="submit"
            disabled={loading || !currentLocation || !destination}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-colors flex justify-center items-center h-12"
            aria-label="Get Help Routing"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : 'Get help'}
          </button>
        </form>

        <RouteDisplay routeData={route} containerRef={routeRef} />
      </div>
    </div>
  );
};

CrowdRouting.propTypes = {
  initialDestination: PropTypes.string
};

export default CrowdRouting;
