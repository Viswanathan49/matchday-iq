import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askAssistant, getOptimalRoute, getStadiumDensity } from './aiService';

// Mock global fetch to simulate backend responses
global.fetch = vi.fn();

describe('aiService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // ─── askAssistant ─────────────────────────────────────────────────────────

  it('askAssistant returns backend response when fetch succeeds', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'comida', intent: 'facilities_food' })
    });
    const res = await askAssistant('where is the food?', 'es');
    expect(res.reply).toContain('comida');
    expect(res.intent).toBe('facilities_food');
  });

  it('askAssistant returns restroom route on fallback', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('where is the restroom?', 'en');
    expect(res.reply).toMatch(/restroom|Gate B/i);
    expect(res.intent).toBe('routing');
  });

  it('askAssistant returns food route on fallback', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('I am hungry', 'en');
    expect(res.reply).toMatch(/Food Court/i);
    expect(res.intent).toBe('routing');
  });

  it('askAssistant returns spill incident on fallback', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('there is a big spill on the floor', 'en');
    expect(res.intent).toBe('report');
    expect(res.reply).toMatch(/\[INCIDENT:spill/i);
  });

  it('askAssistant returns security incident on fallback', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('there is a fight', 'en');
    expect(res.intent).toBe('report');
    expect(res.reply).toMatch(/\[INCIDENT:security/i);
  });

  it('askAssistant returns general fallback for unknown queries', async () => {
    fetch.mockRejectedValueOnce(new Error('Network Error'));
    const res = await askAssistant('hello there', 'en');
    expect(res.intent).toBe('general');
    expect(res.reply).toBeTruthy();
  });

  it('askAssistant throws on non-ok HTTP response and falls back', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    const res = await askAssistant('test', 'en');
    // Should have fallen back gracefully
    expect(res).toHaveProperty('reply');
    expect(res).toHaveProperty('intent');
  });

  // ─── getOptimalRoute ──────────────────────────────────────────────────────

  it('getOptimalRoute returns expected object from backend', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ route: ['A', 'X', 'Y', 'B'], estimatedTime: 10, crowdingLevel: 'Low' })
    });
    const route = await getOptimalRoute('A', 'B');
    expect(route).toHaveProperty('route');
    expect(route).toHaveProperty('estimatedTime');
    expect(route).toHaveProperty('crowdingLevel');
    expect(route.route[0]).toBe('A');
  });

  it('getOptimalRoute uses fallback when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Offline'));
    const route = await getOptimalRoute('North Gate', 'Food Court', { wheelchair: true });
    expect(route.stepFree).toBe(true);
    expect(route.route).toContain('North Gate');
    expect(route.route).toContain('Food Court');
  });

  it('getOptimalRoute fallback respects wheelchair constraint', async () => {
    fetch.mockRejectedValueOnce(new Error('Offline'));
    const route = await getOptimalRoute('Gate B', 'South Gate', { wheelchair: true });
    expect(route.stepFree).toBe(true);
  });

  // ─── getStadiumDensity ────────────────────────────────────────────────────

  it('getStadiumDensity returns array of densities from backend', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ zone: 'Z1', density: 50 }])
    });
    const data = await getStadiumDensity();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('zone');
    expect(data[0]).toHaveProperty('density');
  });

  it('getStadiumDensity uses fallback when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Offline'));
    const data = await getStadiumDensity();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(typeof data[0].density).toBe('number');
  });
});
