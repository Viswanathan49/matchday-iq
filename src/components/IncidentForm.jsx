import { useState } from 'react';
import StadiumMap from './StadiumMap';

const IncidentForm = () => {
  const [type, setType] = useState('spill');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setStatus('Please select a location on the map.');
      return;
    }
    
    setStatus('Submitting...');
    try {
      // Simulate network request for PWA deployment
      await new Promise(resolve => setTimeout(resolve, 800));
      setStatus('Incident reported successfully. Staff has been notified.');
      setLocation('');
    } catch (err) {
      console.error(err);
      setStatus('Error connecting to server.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Report an Issue</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Issue Type</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="spill">Spill / Cleaning Needed</option>
            <option value="medical">Medical Assistance</option>
            <option value="security">Security Issue</option>
            <option value="maintenance">Maintenance / Repair</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
          <StadiumMap selectedZone={location} onSelect={setLocation} />
          {location && <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">Selected: {location}</p>}
        </div>

        <button 
          type="submit"
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          Submit Report
        </button>

        {status && (
          <p className={`text-center text-sm ${status.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </p>
        )}
      </form>
    </div>
  );
};

export default IncidentForm;
