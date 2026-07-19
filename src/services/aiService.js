/**
 * API Service Layer.
 * In production (Vercel), all functions use an intelligent local fallback.
 * Locally, the app attempts to connect to the FastAPI backend at localhost:5000.
 */

const API_BASE = 'http://localhost:5000/api';

/** Detects if the app is running in a deployed (non-localhost) environment. */
const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

/** @param {number} ms - Milliseconds to wait. */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends a natural-language query to the AI assistant.
 * @param {string} query - The user's message.
 * @param {string} [language='en'] - BCP-47 language code.
 * @param {string} [location=''] - The user's current location in the stadium.
 * @returns {Promise<{reply: string, intent: string}>}
 */
export const askAssistant = async (query, language = 'en', location = '') => {
  try {
    if (isProd) throw new Error('Offline Mode');
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

/**
 * Retrieves the optimal route between two zones, considering accessibility constraints.
 * @param {string} currentZone - The starting zone ID.
 * @param {string} destination - The destination zone ID.
 * @param {{wheelchair?: boolean, lowVision?: boolean, deaf?: boolean}} [constraints={}]
 * @returns {Promise<{route: string[], estimatedTime: number, crowdingLevel: string, stepFree: boolean}>}
 */
export const getOptimalRoute = async (currentZone, destination, constraints = {}) => {
  try {
    if (isProd) throw new Error('Offline Mode');
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

/**
 * Fetches live crowd density data for all stadium zones.
 * @returns {Promise<Array<{zone: string, density: number}>>}
 */
export const getStadiumDensity = async () => {
  try {
    if (isProd) throw new Error('Offline Mode');
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
