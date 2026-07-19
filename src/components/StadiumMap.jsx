import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const ZONES = [
  { id: 'North Gate', x: 50, y: 10, width: 100, height: 30 },
  { id: 'South Gate', x: 50, y: 160, width: 100, height: 30 },
  { id: 'Gate B', x: 10, y: 50, width: 30, height: 100 },
  { id: 'Section 112', x: 50, y: 50, width: 45, height: 100 },
  { id: 'Section 204', x: 105, y: 50, width: 45, height: 100 },
  { id: 'Sensory Room', x: 160, y: 50, width: 30, height: 45 },
  { id: 'Food Court', x: 160, y: 105, width: 30, height: 45 },
  { id: 'Concourse', x: -100, y: -100, width: 0, height: 0 },
];

const StadiumMap = ({ selectedZone, onSelect }) => {
  const [focusedId, setFocusedId] = useState(null);
  const containerRef = useRef(null);

  const handleKeyDown = (e, id, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = ZONES[(index + 1) % ZONES.length];
      setFocusedId(next.id);
      document.getElementById(`zone-${next.id.replace(/\s/g, '-')}`)?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = ZONES[(index - 1 + ZONES.length) % ZONES.length];
      setFocusedId(prev.id);
      document.getElementById(`zone-${prev.id.replace(/\s/g, '-')}`)?.focus();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
      <h3 className="text-center font-bold text-slate-800 dark:text-slate-200 mb-2" id="map-label">Interactive Stadium Map</h3>
      <p className="text-xs text-center text-slate-500 mb-4">Use Arrow keys to navigate, Space/Enter to select.</p>
      
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-auto"
        role="radiogroup" 
        aria-labelledby="map-label"
        ref={containerRef}
      >
        <rect x="0" y="0" width="200" height="200" fill="transparent" />
        
        {ZONES.map((zone, index) => {
          const isSelected = selectedZone === zone.id;
          const isFocused = focusedId === zone.id;
          return (
            <g key={zone.id}>
              <rect
                id={`zone-${zone.id.replace(/\s/g, '-')}`}
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                rx="4"
                fill={isSelected ? '#3b82f6' : (isFocused ? '#93c5fd' : '#e2e8f0')}
                className="cursor-pointer transition-colors duration-200 dark:fill-slate-700"
                stroke={isSelected ? '#1d4ed8' : '#cbd5e1'}
                strokeWidth="2"
                role="radio"
                aria-checked={isSelected}
                aria-label={zone.id}
                tabIndex={isSelected || (selectedZone === null && index === 0) ? 0 : -1}
                onClick={() => onSelect(zone.id)}
                onKeyDown={(e) => handleKeyDown(e, zone.id, index)}
                onFocus={() => setFocusedId(zone.id)}
                onBlur={() => setFocusedId(null)}
              />
              {(() => {
                const parts = zone.id.split(' ');
                if (parts.length > 1) {
                  return (
                    <text 
                      x={zone.x + zone.width / 2} 
                      y={zone.y + zone.height / 2} 
                      textAnchor="middle" 
                      className={`text-[9px] font-medium pointer-events-none ${isSelected ? 'fill-white' : 'fill-slate-700 dark:fill-slate-300'}`}
                    >
                      <tspan x={zone.x + zone.width / 2} dy="-0.4em">{parts[0]}</tspan>
                      <tspan x={zone.x + zone.width / 2} dy="1.2em">{parts.slice(1).join(' ')}</tspan>
                    </text>
                  );
                }
                return (
                  <text 
                    x={zone.x + zone.width / 2} 
                    y={zone.y + zone.height / 2} 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className={`text-[9px] font-medium pointer-events-none ${isSelected ? 'fill-white' : 'fill-slate-700 dark:fill-slate-300'}`}
                  >
                    {zone.id}
                  </text>
                );
              })()}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

StadiumMap.propTypes = {
  selectedZone: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

export default StadiumMap;
