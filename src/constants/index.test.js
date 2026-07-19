/**
 * Tests for the shared constants module.
 * Ensures no magic strings drift and allowlists remain correct.
 */
import { describe, it, expect } from 'vitest';
import {
  INCIDENT_POLL_INTERVAL_MS,
  FALLBACK_DELAY_MS,
  STORAGE_KEY_CHATBOT,
  STORAGE_KEY_INCIDENTS,
  STORAGE_KEY_THEME,
  ALLOWED_INCIDENT_TYPES,
  SUPPORTED_LANGUAGES,
  DENSITY_THRESHOLDS,
} from './index';

describe('Constants module', () => {
  it('INCIDENT_POLL_INTERVAL_MS is a positive number', () => {
    expect(typeof INCIDENT_POLL_INTERVAL_MS).toBe('number');
    expect(INCIDENT_POLL_INTERVAL_MS).toBeGreaterThan(0);
  });

  it('FALLBACK_DELAY_MS is a positive number', () => {
    expect(typeof FALLBACK_DELAY_MS).toBe('number');
    expect(FALLBACK_DELAY_MS).toBeGreaterThan(0);
  });

  it('storage keys are non-empty strings', () => {
    expect(typeof STORAGE_KEY_CHATBOT).toBe('string');
    expect(STORAGE_KEY_CHATBOT.length).toBeGreaterThan(0);
    expect(typeof STORAGE_KEY_INCIDENTS).toBe('string');
    expect(STORAGE_KEY_INCIDENTS.length).toBeGreaterThan(0);
    expect(typeof STORAGE_KEY_THEME).toBe('string');
    expect(STORAGE_KEY_THEME.length).toBeGreaterThan(0);
  });

  it('ALLOWED_INCIDENT_TYPES contains all expected types', () => {
    expect(ALLOWED_INCIDENT_TYPES).toContain('spill');
    expect(ALLOWED_INCIDENT_TYPES).toContain('medical');
    expect(ALLOWED_INCIDENT_TYPES).toContain('security');
    expect(ALLOWED_INCIDENT_TYPES).toContain('maintenance');
  });

  it('SUPPORTED_LANGUAGES includes English and Arabic', () => {
    const codes = SUPPORTED_LANGUAGES.map(l => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('ar');
    expect(codes).toContain('es');
  });

  it('DENSITY_THRESHOLDS has HIGH > MEDIUM', () => {
    expect(DENSITY_THRESHOLDS.HIGH).toBeGreaterThan(DENSITY_THRESHOLDS.MEDIUM);
  });
});
