/**
 * Application-wide constants for MatchDay IQ.
 * Centralizing magic values prevents typos and makes updates easier.
 */

/** Polling interval (ms) for the Staff Portal incident feed. */
export const INCIDENT_POLL_INTERVAL_MS = 10_000;

/** Delay (ms) simulating network latency in PWA fallback mode. */
export const FALLBACK_DELAY_MS = 800;

/** localStorage key for persisted chatbot conversation history. */
export const STORAGE_KEY_CHATBOT = 'chatbot_messages';

/** localStorage key for the shared incident bus between Fan and Staff portals. */
export const STORAGE_KEY_INCIDENTS = 'stadium_incidents';

/** localStorage key for user theme preference. */
export const STORAGE_KEY_THEME = 'theme';

/** Incident types accepted by the system (allowlist for security). */
export const ALLOWED_INCIDENT_TYPES = ['spill', 'medical', 'security', 'maintenance'];

/** Supported UI language codes (BCP-47). */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية (Arabic)' },
];

/** Crowd density thresholds for visual warnings (percentage). */
export const DENSITY_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
};
