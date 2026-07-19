import { useState } from 'react';
import Dashboard from './Dashboard';
import Chatbot from './Chatbot';
import CrowdRouting from './CrowdRouting';
import IncidentForm from './IncidentForm';
import MatchSelector from './MatchSelector';

const FanPortal = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  // Used to bridge chat -> routing automatically
  const [routeContext, setRouteContext] = useState(null);

  const handleRouteAction = (destination) => {
    setRouteContext({ destination });
    setActiveTab('route');
  };

  if (!selectedMatch) {
    return <MatchSelector onSelect={setSelectedMatch} />;
  }

  return (
    <div className="space-y-6">
      {/* Persistent Match Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between text-white border border-blue-700/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex -space-x-3">
            <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-50 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
              <img src={selectedMatch.team1Logo} alt={selectedMatch.team1} className={`w-full h-full object-contain ${selectedMatch.id === 'm1' ? 'scale-110 p-1' : 'scale-[1.5]'}`} />
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-50 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
              <img src={selectedMatch.team2Logo} alt={selectedMatch.team2} className={`w-full h-full object-contain ${selectedMatch.id === 'm1' ? 'scale-110 p-1' : 'scale-[1.5]'}`} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">{selectedMatch.team1} vs {selectedMatch.team2}</h3>
            <div className="flex items-center text-sm text-blue-200">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {selectedMatch.stadium}
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setSelectedMatch(null)}
          className="mt-4 md:mt-0 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors border border-white/20 relative z-10"
        >
          Change Match
        </button>
      </div>

      <div className="flex justify-center space-x-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-sm mx-auto shadow-inner">
        {['chat', 'route', 'dashboard', 'report'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'chat' && <Chatbot onRouteAction={handleRouteAction} />}
        {activeTab === 'route' && <CrowdRouting initialDestination={routeContext?.destination} />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'report' && <IncidentForm />}
      </div>
    </div>
  );
};

export default FanPortal;
