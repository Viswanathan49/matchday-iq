import React, { Suspense, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Chatbot = React.lazy(() => import('./components/Chatbot'));
const CrowdRouting = React.lazy(() => import('./components/CrowdRouting'));
const FanPortal = React.lazy(() => import('./components/FanPortal'));
const StaffPortal = React.lazy(() => import('./components/StaffPortal'));

/** Accessible loading spinner shown while lazy components load. */
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-[50vh]" role="status" aria-label="Loading">
    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" aria-hidden="true"></div>
  </div>
);

/**
 * Global error boundary — catches render-time errors in the component tree
 * and displays a user-friendly fallback instead of a blank screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
          <div className="text-5xl mb-4" aria-hidden="true">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">An unexpected error occurred. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Root application component.
 * Manages portal selection (Fan / Staff), dark mode preference,
 * and offline/online status detection.
 */
const App = () => {
  const [portal, setPortal] = useState(null);
  
  // Theme toggle state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference on initial load
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  
  React.useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Apply theme to HTML class
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans flex flex-col">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent cursor-pointer" onClick={() => setPortal(null)}>
                MatchDay IQ
              </h1>
              <div className="flex items-center gap-6">
                {portal && (
                  <button 
                    onClick={() => setPortal(null)}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Switch Portal
                  </button>
                )}
                
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </nav>
        </header>

        {isOffline && (
          <div role="alert" className="bg-red-600 text-white text-center py-2 text-sm font-bold z-40 animate-pulse">
            ⚠️ You are currently offline. The app is running in local PWA mode.
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!portal ? (
            <div className="flex flex-col items-center justify-center space-y-12 mt-8">
              
              {/* World Cup Stats Banner */}
              <div className="w-full max-w-5xl bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                  <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                </div>
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-white/20 pb-6">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">FIFA World Cup 2026™</h2>
                      <p className="text-blue-200 mt-1">USA • Canada • Mexico | The Grand Finale</p>
                    </div>
                    <div className="mt-4 md:mt-0 px-4 py-2 bg-yellow-500/20 text-yellow-100 rounded-full border border-yellow-500/50 flex items-center gap-2 font-bold text-sm animate-pulse">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      World Cup Final Today!
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                      <div className="text-blue-200 text-sm font-medium mb-1">Matches Played</div>
                      <div className="text-4xl font-bold font-mono">103<span className="text-lg text-slate-400">/104</span></div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                      <div className="text-blue-200 text-sm font-medium mb-1">Total Goals</div>
                      <div className="text-4xl font-bold font-mono">298</div>
                      <div className="text-xs text-green-300 mt-1">Record-breaking tournament</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                      <div className="text-blue-200 text-sm font-medium mb-1">Avg. Attendance</div>
                      <div className="text-4xl font-bold font-mono">72,104</div>
                      <div className="text-xs text-slate-300 mt-1">Across 16 venues</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                      <div className="text-blue-200 text-sm font-medium mb-1">Incidents Resolved</div>
                      <div className="text-4xl font-black text-emerald-400">99.4%</div>
                      <div className="text-xs text-emerald-200 mt-1">Powered by MatchDay IQ</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Grand Finale Banner */}
              <div className="w-full max-w-5xl rounded-3xl shadow-2xl relative overflow-hidden bg-gradient-to-r from-red-900 via-slate-900 to-sky-900 flex flex-col md:flex-row min-h-[300px] border border-white/10">
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="relative z-10 p-8 flex flex-col justify-center items-center w-full">
                  <div className="text-yellow-400 font-bold tracking-widest uppercase text-sm mb-6 border border-yellow-400/30 bg-yellow-400/10 px-4 py-1 rounded-full">
                    World Cup Final - Kick-off 3:00 PM ET
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 md:gap-12 w-full">
                    {/* Spain */}
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/10 p-2 backdrop-blur-md shadow-[0_0_30px_rgba(255,0,0,0.3)]">
                        <img src="/spain_nobg.png?v=2" alt="Spain Logo" className="w-full h-full object-contain drop-shadow-lg" />
                      </div>
                      <h3 className="text-white font-black text-2xl md:text-4xl mt-4">SPAIN</h3>
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center px-4">
                      <div className="text-white/60 text-xl md:text-3xl font-black italic">VS</div>
                    </div>

                    {/* Argentina */}
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/10 p-2 backdrop-blur-md shadow-[0_0_30px_rgba(0,150,255,0.3)]">
                        <img src="/argentina_nobg.png?v=2" alt="Argentina Logo" className="w-full h-full object-contain drop-shadow-lg" />
                      </div>
                      <h3 className="text-white font-black text-2xl md:text-4xl mt-4">ARGENTINA</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center mt-12">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-6">Select Your Portal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <button
                  onClick={() => setPortal('fan')}
                  className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-400 transition-all group text-left"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏟️</div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Fan Portal</h3>
                  <p className="text-slate-500 dark:text-slate-400">Navigate the stadium, find food, and ask the AI concierge.</p>
                </button>
                
                <button
                  onClick={() => setPortal('staff')}
                  className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-indigo-400 transition-all group text-left"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🛡️</div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Staff Portal</h3>
                  <p className="text-slate-500 dark:text-slate-400">Monitor crowd density and resolve live incidents.</p>
                </button>
              </div>
              </div>
            </div>
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                {portal === 'fan' ? <FanPortal /> : <StaffPortal />}
              </ErrorBoundary>
            </Suspense>
          )}
        </main>
        
        <footer className="border-t border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500 dark:text-slate-400 text-sm mt-auto">
          &copy; 2026 Smart Stadiums Initiative. Confidential.
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
