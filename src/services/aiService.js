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
    const q = query.toLowerCase();
    
    // Mock Routing
    if (q.includes('bathroom') || q.includes('restroom') || q.includes('toilet')) {
      return { reply: 'The nearest restrooms are located near Gate B. I have mapped the route for you! [ROUTE:Gate B]', intent: 'routing' };
    }
    if (q.includes('food') || q.includes('hungry') || q.includes('hotdog')) {
      return { reply: 'There are plenty of concessions in the Food Court. Follow the blue line on your map! [ROUTE:Food Court]', intent: 'routing' };
    }
    
    // Mock Incident Reporting
    if (q.includes('spill') || q.includes('slippery')) {
      return { reply: 'Thank you for reporting this. I have immediately alerted the janitorial staff to clean up the spill near Gate B. Please step carefully! [INCIDENT:spill:Gate B]', intent: 'report' };
    }
    if (q.includes('fight') || q.includes('security')) {
      return { reply: 'I have dispatched security to Section 112 immediately. Please stay safe. [INCIDENT:security:Section 112]', intent: 'report' };
    }

    // Default Fallback
    return {
      reply: "I am your MatchDay IQ AI concierge! I can help you find your way around the stadium, locate food and restrooms, or report issues to our staff. How can I assist you?",
      intent: 'general'
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
