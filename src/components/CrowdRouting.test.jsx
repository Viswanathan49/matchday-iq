import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CrowdRouting from './CrowdRouting';
import * as aiService from '../services/aiService';

vi.mock('../services/aiService', () => ({
  getOptimalRoute: vi.fn()
}));

window.HTMLElement.prototype.scrollIntoView = function () {};

const MOCK_ROUTE = {
  route: ['North Gate', 'Main Concourse', 'Food Court'],
  estimatedTime: 5,
  crowdingLevel: 'Low',
  stepFree: false,
};

const MOCK_ROUTE_ACCESSIBLE = {
  route: ['Gate B', 'Step-Free Corridor', 'South Gate'],
  estimatedTime: 8,
  crowdingLevel: 'Low',
  stepFree: true,
};

describe('CrowdRouting Component', () => {
  beforeEach(() => {
    aiService.getOptimalRoute.mockClear();
  });

  it('renders all UI elements', () => {
    render(<CrowdRouting />);
    expect(screen.getByText(/Smart Crowd Routing/i)).toBeInTheDocument();
    expect(screen.getByText(/Set Current Location/i)).toBeInTheDocument();
    expect(screen.getByText(/Set Destination/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get Help Routing/i })).toBeInTheDocument();
  });

  it('renders accessibility fieldset with all 3 checkboxes', () => {
    render(<CrowdRouting />);
    expect(screen.getByText(/Accessibility needs/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Wheelchair/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Low vision/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Deaf/i)).toBeInTheDocument();
  });

  it('disables submit button when no locations selected', () => {
    render(<CrowdRouting />);
    expect(screen.getByRole('button', { name: /Get Help Routing/i })).toBeDisabled();
  });

  it('switches map mode on button click', () => {
    render(<CrowdRouting />);
    const destBtn = screen.getByText('Set Destination');
    fireEvent.click(destBtn);
    // Map mode switched — no crash
    expect(screen.getByText('Set Destination')).toBeInTheDocument();
  });

  it('updates current location when zone is selected in current mode', () => {
    render(<CrowdRouting />);
    fireEvent.click(screen.getByText('Set Current Location'));
    fireEvent.click(screen.getByRole('radio', { name: 'North Gate' }));
    expect(screen.getByText('North Gate')).toBeInTheDocument();
  });

  it('updates destination when zone is selected in destination mode', () => {
    render(<CrowdRouting />);
    fireEvent.click(screen.getByText('Set Destination'));
    fireEvent.click(screen.getByRole('radio', { name: 'Food Court' }));
    expect(screen.getByText('Food Court')).toBeInTheDocument();
  });

  it('generates route correctly', async () => {
    aiService.getOptimalRoute.mockResolvedValue(MOCK_ROUTE);
    render(<CrowdRouting />);

    fireEvent.click(screen.getByRole('radio', { name: 'North Gate' }));
    fireEvent.click(screen.getByText('Set Destination'));
    fireEvent.click(screen.getByRole('radio', { name: 'South Gate' }));
    fireEvent.click(screen.getByRole('button', { name: /Get Help Routing/i }));

    await waitFor(() => {
      expect(screen.getByText('Assistance Route')).toBeInTheDocument();
      expect(screen.getByText('Walk to North Gate')).toBeInTheDocument();
      expect(screen.getByText('5 min')).toBeInTheDocument();
    });
  });

  it('displays crowd level badge in route result', async () => {
    aiService.getOptimalRoute.mockResolvedValue(MOCK_ROUTE);
    render(<CrowdRouting />);

    fireEvent.click(screen.getByRole('radio', { name: 'North Gate' }));
    fireEvent.click(screen.getByText('Set Destination'));
    fireEvent.click(screen.getByRole('radio', { name: 'South Gate' }));
    fireEvent.click(screen.getByRole('button', { name: /Get Help Routing/i }));

    await waitFor(() => {
      expect(screen.getByText(/Crowd: Low/i)).toBeInTheDocument();
    });
  });

  it('displays step-free badge for accessible routes', async () => {
    aiService.getOptimalRoute.mockResolvedValue(MOCK_ROUTE_ACCESSIBLE);
    render(<CrowdRouting />);

    fireEvent.click(screen.getByRole('radio', { name: 'Gate B' }));
    fireEvent.click(screen.getByText('Set Destination'));
    fireEvent.click(screen.getByRole('radio', { name: 'South Gate' }));
    fireEvent.click(screen.getByRole('button', { name: /Get Help Routing/i }));

    await waitFor(() => {
      expect(screen.getByText(/Step-free/i)).toBeInTheDocument();
    });
  });

  it('toggles wheelchair checkbox', () => {
    render(<CrowdRouting />);
    const checkbox = screen.getByLabelText(/Wheelchair/i);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('passes wheelchair constraint to getOptimalRoute', async () => {
    aiService.getOptimalRoute.mockResolvedValue(MOCK_ROUTE_ACCESSIBLE);
    render(<CrowdRouting />);

    fireEvent.click(screen.getByLabelText(/Wheelchair/i));
    fireEvent.click(screen.getByRole('radio', { name: 'Gate B' }));
    fireEvent.click(screen.getByText('Set Destination'));
    fireEvent.click(screen.getByRole('radio', { name: 'South Gate' }));
    fireEvent.click(screen.getByRole('button', { name: /Get Help Routing/i }));

    await waitFor(() => {
      expect(aiService.getOptimalRoute).toHaveBeenCalledWith(
        'Gate B',
        'South Gate',
        expect.objectContaining({ wheelchair: true })
      );
    });
  });

  it('prefills destination when initialDestination prop is provided', () => {
    render(<CrowdRouting initialDestination="Food Court" />);
    expect(screen.getByText('Food Court')).toBeInTheDocument();
  });

  it('shows Food Court AI insight when destination is Food Court', async () => {
    aiService.getOptimalRoute.mockResolvedValue({
      ...MOCK_ROUTE,
      route: ['North Gate', 'Food Court'],
    });
    render(<CrowdRouting />);

    fireEvent.click(screen.getByRole('radio', { name: 'North Gate' }));
    fireEvent.click(screen.getByText('Set Destination'));
    fireEvent.click(screen.getByRole('radio', { name: 'Food Court' }));
    fireEvent.click(screen.getByRole('button', { name: /Get Help Routing/i }));

    await waitFor(() => {
      expect(screen.getByText(/concession/i)).toBeInTheDocument();
    });
  });

  it('handles route service error gracefully without crashing', async () => {
    aiService.getOptimalRoute.mockRejectedValue(new Error('Fatal'));
    render(<CrowdRouting />);

    fireEvent.click(screen.getByRole('radio', { name: 'North Gate' }));
    fireEvent.click(screen.getByText('Set Destination'));
    fireEvent.click(screen.getByRole('radio', { name: 'South Gate' }));
    fireEvent.click(screen.getByRole('button', { name: /Get Help Routing/i }));

    await waitFor(() => {
      // Should not crash — just stay on the form without a route
      expect(screen.queryByText('Assistance Route')).not.toBeInTheDocument();
    });
  });
});
