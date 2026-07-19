import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const MATCHES = [
  {
    id: 'm1',
    team1: 'Spain',
    team1Logo: '/spain_nobg.png',
    team2: 'Argentina',
    team2Logo: '/argentina_nobg.png',
    status: 'Upcoming',
    score: 'VS',
    time: '3:00 PM ET',
    targetDate: '2026-07-19T15:00:00-04:00',
    stadium: 'MetLife Stadium, NY/NJ',
    type: 'Final',
    capacity: '82,500'
  },
  {
    id: 'm2',
    team1: 'Brazil',
    team1Logo: '/brazil_nobg.png',
    team2: 'France',
    team2Logo: '/france_nobg.png',
    status: 'Finished',
    score: '1 - 2',
    time: 'July 15, 2026',
    stadium: 'SoFi Stadium, Los Angeles',
    type: 'Semi-Final',
    capacity: '70,240'
  },
  {
    id: 'm3',
    team1: 'England',
    team1Logo: '/england_nobg.png',
    team2: 'Germany',
    team2Logo: '/germany_nobg.png',
    status: 'Finished',
    score: '2 - 0',
    time: 'July 11, 2026',
    stadium: 'AT&T Stadium, Dallas',
    type: 'Quarter-Final',
    capacity: '80,000'
  }
];

const MatchSelector = ({ onSelect }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountdown = (targetDate) => {
    const diff = new Date(targetDate) - now;
    if (diff <= 0) return 'Live Now';
    
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Select Your Match</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Choose an ongoing or upcoming match to enter the Fan Portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MATCHES.map(match => (
          <button
            key={match.id}
            onClick={() => onSelect(match)}
            className="group relative flex flex-col items-center bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full ${
              match.status === 'Ongoing' 
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' 
                : match.status === 'Upcoming'
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  : match.status === 'Finished'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {match.status}
            </div>

            {/* Match Type */}
            <div className="w-full text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              {match.type}
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between w-full mb-6">
              <div className="flex flex-col items-center w-24">
                <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-700 shadow-inner overflow-hidden flex items-center justify-center">
                  <img src={match.team1Logo} alt={match.team1} className={`w-full h-full object-contain drop-shadow-sm ${match.id === 'm1' ? 'scale-110 p-2' : 'scale-[1.5]'}`} />
                </div>
                <span className="mt-3 font-bold text-slate-800 dark:text-white text-sm text-center">{match.team1}</span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="text-2xl font-black text-slate-800 dark:text-slate-200 px-2 tracking-widest whitespace-nowrap">
                  {match.score}
                </div>
                {match.targetDate && (
                  <div className="mt-1 font-mono text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded animate-pulse">
                    {getCountdown(match.targetDate)}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center w-24">
                <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-700 shadow-inner overflow-hidden flex items-center justify-center">
                  <img src={match.team2Logo} alt={match.team2} className={`w-full h-full object-contain drop-shadow-sm ${match.id === 'm1' ? 'scale-110 p-2' : 'scale-[1.5]'}`} />
                </div>
                <span className="mt-3 font-bold text-slate-800 dark:text-white text-sm text-center">{match.team2}</span>
              </div>
            </div>

            {/* Details */}
            <div className="w-full mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 mb-2">
                <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {match.time}
              </div>
              <div className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{match.stadium}</span>
              </div>
            </div>

            {/* Hover overlay button */}
            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 rounded-3xl transition-colors pointer-events-none border-2 border-transparent group-hover:border-blue-500/30"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

MatchSelector.propTypes = {
  onSelect: PropTypes.func.isRequired
};

export default MatchSelector;
