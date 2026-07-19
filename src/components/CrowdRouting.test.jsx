import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CrowdRouting from './CrowdRouting';
import * as aiService from '../services/aiService';

vi.mock('../services/aiService', () => ({
  getOptimalRoute: vi.fn()
}));

describe('CrowdRouting Component', () => {
  it('renders UI elements', () => {
    render(<CrowdRouting />);
    expect(screen.getByText(/Set Current Location/i)).toBeInTheDocument();
    expect(screen.getByText(/Set Destination/i)).toBeInTheDocument();
  });

  it('generates route correctly', async () => {
    aiService.getOptimalRoute.mockResolvedValue({
      route: ['Point A', 'Point B'],
      estimatedTime: 5,
      crowdingLevel: 'Low'
    });

    render(<CrowdRouting />);

    // Select Current Location (Point A equivalent e.g. North Gate)
    fireEvent.click(screen.getByRole('radio', { name: 'North Gate' }));
    
    // Switch to Destination
    fireEvent.click(screen.getByText('Set Destination'));
    
    // Select Destination (Point B equivalent e.g. South Gate)
    fireEvent.click(screen.getByRole('radio', { name: 'South Gate' }));
    
    fireEvent.click(screen.getByRole('button', { name: /Get Help Routing/i }));

    await waitFor(() => {
      expect(screen.getByText('Assistance Route')).toBeInTheDocument();
      expect(screen.getByText('Walk to Point A')).toBeInTheDocument();
      expect(screen.getByText('5 min')).toBeInTheDocument();
    });
  });
});
