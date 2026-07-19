import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import * as aiService from '../services/aiService';

vi.mock('../services/aiService', () => ({
  getStadiumDensity: vi.fn()
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    aiService.getStadiumDensity.mockClear();
  });

  it('renders the dashboard title', () => {
    aiService.getStadiumDensity.mockResolvedValue([]);
    render(<Dashboard />);
    expect(screen.getByText('Stadium Operations Dashboard')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    // Never resolves during this check
    aiService.getStadiumDensity.mockReturnValue(new Promise(() => {}));
    render(<Dashboard />);
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('renders zone density data after loading', async () => {
    aiService.getStadiumDensity.mockResolvedValue([
      { zone: 'North Gate', density: 85 },
      { zone: 'South Gate', density: 30 },
    ]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('North Gate')).toBeInTheDocument();
      expect(screen.getByText('South Gate')).toBeInTheDocument();
    });
  });

  it('calculates and displays correct average density', async () => {
    aiService.getStadiumDensity.mockResolvedValue([
      { zone: 'North', density: 100 },
      { zone: 'South', density: 0 },
    ]);

    render(<Dashboard />);

    await waitFor(() => {
      // (100 + 0) / 2 = 50
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  it('shows 0% average when no zones returned', async () => {
    aiService.getStadiumDensity.mockResolvedValue([]);
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    // Average should default to 0
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('handles service failure gracefully without crashing', async () => {
    aiService.getStadiumDensity.mockRejectedValue(new Error('Network down'));
    render(<Dashboard />);
    // Component should not throw - it should just stop loading
    await waitFor(() => {
      expect(screen.getByText('Stadium Operations Dashboard')).toBeInTheDocument();
    });
  });

  it('renders density bar with correct aria-label', async () => {
    aiService.getStadiumDensity.mockResolvedValue([
      { zone: 'Gate B', density: 72 },
    ]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByLabelText('72% capacity')).toBeInTheDocument();
    });
  });
});
