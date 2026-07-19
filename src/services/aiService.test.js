import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askAssistant, getOptimalRoute, getStadiumDensity } from './aiService';

// Mock global fetch
global.fetch = vi.fn();

describe('aiService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('askAssistant translates food query to Spanish', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'comida', intent: 'facilities_food' })
    });
    const res = await askAssistant('where is the food?', 'es');
    expect(res.reply).toContain('comida');
    expect(res.intent).toBe('facilities_food');
  });

  it('askAssistant replies with restroom info in English', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'restrooms', intent: 'facilities_restroom' })
    });
    const res = await askAssistant('restroom', 'en');
    expect(res.reply).toContain('restrooms');
    expect(res.intent).toBe('facilities_restroom');
  });

  it('askAssistant returns default greeting', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'How can I help', intent: 'greeting' })
    });
    const res = await askAssistant('hello', 'en');
    expect(res.reply).toContain('How can I help');
    expect(res.intent).toBe('greeting');
  });

  it('getOptimalRoute returns expected object', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ route: ['A', 'X', 'Y', 'B'], estimatedTime: 10, crowdingLevel: 'Low' })
    });
    const route = await getOptimalRoute('A', 'B');
    expect(route).toHaveProperty('route');
    expect(route).toHaveProperty('estimatedTime');
    expect(route).toHaveProperty('crowdingLevel');
    expect(route.route[0]).toBe('A');
    expect(route.route[3]).toBe('B');
  });

  it('getStadiumDensity returns array of densities', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ zone: 'Z1', density: 50 }])
    });
    const data = await getStadiumDensity();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('zone');
    expect(data[0]).toHaveProperty('density');
  });
});
