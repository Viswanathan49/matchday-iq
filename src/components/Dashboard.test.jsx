import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from './Dashboard';
import * as aiService from '../services/aiService';

vi.mock('../services/aiService', () => ({
  getStadiumDensity: vi.fn()
}));

describe('Dashboard Component', () => {
  it('renders loading state initially', () => {
    aiService.getStadiumDensity.mockResolvedValue([]);
    render(<Dashboard />);
    expect(screen.getByText('Stadium Operations Dashboard')).toBeInTheDocument();
  });

  it('renders density data and calculates average', async () => {
    aiService.getStadiumDensity.mockResolvedValue([
      { zone: 'North', density: 100 },
      { zone: 'South', density: 0 }
    ]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('North')).toBeInTheDocument();
      expect(screen.getByText('South')).toBeInTheDocument();
    });

    // 100 + 0 / 2 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
