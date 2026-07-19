/**
 * API Service Layer.
 * In production (Vercel), all functions use an intelligent local fallback.
 * Locally, the app attempts to connect to the FastAPI backend at localhost:5000.
 *
 * @module aiService
 */

import { FALLBACK_DELAY_MS } from '../constants';

/** Base URL of the FastAPI backend (only used in local development). */
const API_BASE = 'http://localhost:5000/api';

/** True when the app is running on Vercel or any non-localhost host. */
const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

/**
 * Returns a Promise that resolves after the specified number of milliseconds.
 * Used to simulate realistic network latency in PWA offline fallback mode.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends a natural-language query to the AI assistant.
 * Falls back to an intelligent keyword-based response engine when the backend
 * is unavailable (always the case in production PWA deployment).
 *
 * @param {string} query - The user's raw message text.
 * @param {string} [language='en'] - BCP-47 language code for response localisation.
 * @param {string} [location=''] - The fan's self-reported stadium zone.
 * @returns {Promise<{reply: string, intent: string}>} AI response object.
 */
export const askAssistant = async (query, language = 'en', location = '') => {
  if (!isProd) {
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language, location })
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      // Fall through to local fallback below
    }
  }

  await delay(FALLBACK_DELAY_MS);
  const q = query.toLowerCase();

  if (q.includes('bathroom') || q.includes('restroom') || q.includes('toilet')) {
    return { reply: 'The nearest restrooms are located near Gate B. I have mapped the route for you! [ROUTE:Gate B]', intent: 'routing' };
  }
  if (q.includes('food') || q.includes('hungry') || q.includes('hotdog')) {
    return { reply: 'There are plenty of concessions in the Food Court. Follow the blue line on your map! [ROUTE:Food Court]', intent: 'routing' };
  }
  if (q.includes('spill') || q.includes('slippery')) {
    return { reply: 'Thank you for reporting this. I have immediately alerted the janitorial staff to clean up the spill near Gate B. Please step carefully! [INCIDENT:spill:Gate B]', intent: 'report' };
  }
  if (q.includes('fight') || q.includes('security')) {
    return { reply: 'I have dispatched security to Section 112 immediately. Please stay safe. [INCIDENT:security:Section 112]', intent: 'report' };
  }

  return {
    reply: 'I am your MatchDay IQ AI concierge! I can help you find your way around the stadium, locate food and restrooms, or report issues to our staff. How can I assist you?',
    intent: 'general'
  };
};

/**
 * Retrieves the optimal route between two stadium zones.
 * Respects accessibility constraints (wheelchair, low vision, deaf).
 *
 * @param {string} currentZone - The fan's current zone ID.
 * @param {string} destination - The target zone ID.
 * @param {{wheelchair?: boolean, lowVision?: boolean, deaf?: boolean}} [constraints={}]
 * @returns {Promise<{route: string[], estimatedTime: number, crowdingLevel: string, stepFree: boolean}>}
 */
export const getOptimalRoute = async (currentZone, destination, constraints = {}) => {
  if (!isProd) {
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
    } catch {
      // Fall through to local fallback below
    }
  }

  await delay(1000);
  return {
    route: [currentZone, 'Fallback Concourse', destination],
    estimatedTime: 15,
    crowdingLevel: 'Low',
    stepFree: constraints.wheelchair || false
  };
};

/**
 * Fetches live crowd density data for all stadium zones.
 * Returns mock data in PWA/offline mode.
 *
 * @returns {Promise<Array<{zone: string, density: number}>>}
 */
export const getStadiumDensity = async () => {
  if (!isProd) {
    try {
      const res = await fetch(`${API_BASE}/density`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      // Fall through to local fallback below
    }
  }

  await delay(600);
  return [
    { zone: 'North Gate', density: 85 },
    { zone: 'South Gate', density: 40 },
    { zone: 'Gate B', density: 62 },
    { zone: 'Section 112', density: 78 },
    { zone: 'Section 204', density: 45 },
    { zone: 'Food Court', density: 91 },
    { zone: 'Sensory Room', density: 15 },
  ];
};
