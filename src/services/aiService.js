/**
 * API Service Layer interfacing with the FastAPI backend.
 */

const API_BASE = 'http://localhost:5000/api';

/**
 * Simulates a delay if backend fails, otherwise calls real backend.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const askAssistant = async (query, language = 'en', location = '') => {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language, location })
    });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.error("Backend error, using local fallback", error);
    await delay(800);
    return {
      reply: 'The server is currently unreachable. Please try again.',
      intent: 'error'
    };
  }
};

export const getOptimalRoute = async (currentZone, destination, constraints = {}) => {
  try {
    const res = await fetch(`${API_BASE}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        current_location: currentZone, 
        destination,
        needs_wheelchair: constraints.wheelchair || false,
        needs_low_vision: constraints.lowVision || false,
        needs_deaf: constraints.deaf || false
      })
    });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.error("Backend error, using local fallback", error);
    await delay(1000);
    return {
      route: [currentZone, 'Fallback Concourse', destination],
      estimatedTime: 15,
      crowdingLevel: 'Unknown',
      stepFree: constraints.wheelchair || false
    };
  }
};

export const getStadiumDensity = async () => {
  try {
    const res = await fetch(`${API_BASE}/density`);
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.error("Backend error, using local fallback", error);
    await delay(600);
    return [
      { zone: 'North Gate', density: 85 },
      { zone: 'South Gate', density: 40 }
    ];
  }
};
