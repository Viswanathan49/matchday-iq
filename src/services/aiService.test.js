/**
 * Tests for the AI service layer.
 * Validates both the live backend path (mocked fetch) and the PWA fallback engine.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askAssistant, getOptimalRoute, getStadiumDensity } from './aiService';

// Mock global fetch to intercept real network calls
global.fetch = vi.fn();

describe('aiService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // ─── askAssistant: live backend path ────────────────────────────────────────

  it('returns backend response when fetch succeeds with food query', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'Comida disponible', intent: 'facilities_food' })
    });
    const res = await askAssistant('where is the food?', 'es');
    expect(res.reply).toBe('Comida disponible');
    expect(res.intent).toBe('facilities_food');
  });

  it('returns backend response when fetch succeeds with restroom query', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'Restrooms at Gate B', intent: 'facilities_restroom' })
    });
    const res = await askAssistant('restroom', 'en');
    expect(res.reply).toContain('Gate B');
    expect(res.intent).toBe('facilities_restroom');
  });

  it('returns backend response when fetch succeeds with greeting', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'How can I help', intent: 'greeting' })
    });
    const res = await askAssistant('hello', 'en');
    expect(res.reply).toContain('How can I help');
  });

  // ─── askAssistant: fallback engine ──────────────────────────────────────────

  it('falls back to restroom route when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('where is the restroom?', 'en');
    expect(res.intent).toBe('routing');
    expect(res.reply).toMatch(/Gate B/i);
    expect(res.reply).toContain('[ROUTE:Gate B]');
  });

  it('falls back to restroom route on "bathroom" keyword', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('I need the bathroom', 'en');
    expect(res.intent).toBe('routing');
  });

  it('falls back to restroom route on "toilet" keyword', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('toilet please', 'en');
    expect(res.intent).toBe('routing');
  });

  it('falls back to food route on "food" keyword', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('I need food', 'en');
    expect(res.intent).toBe('routing');
    expect(res.reply).toContain('[ROUTE:Food Court]');
  });

  it('falls back to food route on "hungry" keyword', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('I am hungry', 'en');
    expect(res.intent).toBe('routing');
  });

  it('falls back to food route on "hotdog" keyword', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('hotdog please', 'en');
    expect(res.intent).toBe('routing');
  });

  it('falls back to spill incident on "spill" keyword', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('there is a spill', 'en');
    expect(res.intent).toBe('report');
    expect(res.reply).toContain('[INCIDENT:spill:Gate B]');
  });

  it('falls back to spill incident on "slippery" keyword', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('the floor is slippery', 'en');
    expect(res.intent).toBe('report');
  });

  it('falls back to security incident on "fight" keyword', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('there is a fight', 'en');
    expect(res.intent).toBe('report');
    expect(res.reply).toContain('[INCIDENT:security:Section 112]');
  });

  it('falls back to security incident on "security" keyword', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('I need security help', 'en');
    expect(res.intent).toBe('report');
  });

  it('returns general fallback for unrecognised queries', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('what is the score?', 'en');
    expect(res.intent).toBe('general');
    expect(res.reply).toBeTruthy();
  });

  it('falls back gracefully when HTTP response is not ok', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    const res = await askAssistant('test', 'en');
    expect(res).toHaveProperty('reply');
    expect(res).toHaveProperty('intent');
  });

  // ─── getOptimalRoute ────────────────────────────────────────────────────────

  it('returns backend route data when fetch succeeds', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ route: ['A', 'B', 'C'], estimatedTime: 10, crowdingLevel: 'Low' })
    });
    const result = await getOptimalRoute('A', 'C');
    expect(result.route).toEqual(['A', 'B', 'C']);
    expect(result.estimatedTime).toBe(10);
    expect(result.crowdingLevel).toBe('Low');
  });

  it('uses fallback route when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Offline'));
    const result = await getOptimalRoute('North Gate', 'Food Court');
    expect(result.route).toContain('North Gate');
    expect(result.route).toContain('Food Court');
    expect(result).toHaveProperty('estimatedTime');
    expect(result).toHaveProperty('crowdingLevel');
  });

  it('sets stepFree=true when wheelchair constraint is passed', async () => {
    fetch.mockRejectedValueOnce(new Error('Offline'));
    const result = await getOptimalRoute('Gate B', 'South Gate', { wheelchair: true });
    expect(result.stepFree).toBe(true);
  });

  it('sets stepFree=false when no constraint is passed', async () => {
    fetch.mockRejectedValueOnce(new Error('Offline'));
    const result = await getOptimalRoute('Gate B', 'South Gate');
    expect(result.stepFree).toBe(false);
  });

  // ─── getStadiumDensity ──────────────────────────────────────────────────────

  it('returns density array from backend when fetch succeeds', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ zone: 'Z1', density: 50 }])
    });
    const data = await getStadiumDensity();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('zone');
    expect(data[0]).toHaveProperty('density');
  });

  it('returns fallback density array when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Offline'));
    const data = await getStadiumDensity();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    data.forEach(item => {
      expect(typeof item.zone).toBe('string');
      expect(typeof item.density).toBe('number');
      expect(item.density).toBeGreaterThanOrEqual(0);
      expect(item.density).toBeLessThanOrEqual(100);
    });
  });

  it('fallback density includes all 7 stadium zones', async () => {
    fetch.mockRejectedValueOnce(new Error('Offline'));
    const data = await getStadiumDensity();
    expect(data.length).toBe(7);
  });
});
