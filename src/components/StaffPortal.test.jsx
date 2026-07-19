import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import StaffPortal from './StaffPortal';

const MOCK_INCIDENT = {
  id: '1',
  type: 'spill',
  location: 'Gate A',
  timestamp: new Date().toISOString(),
  status: 'active',
};

const MOCK_MEDICAL = {
  id: '2',
  type: 'medical',
  location: 'Section 112',
  timestamp: new Date().toISOString(),
  status: 'active',
  source: 'ai-chatbot',
};

describe('StaffPortal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the command center header', () => {
    render(<StaffPortal />);
    expect(screen.getByText(/Operations Command Center/i)).toBeInTheDocument();
  });

  it('shows all clear when no active incidents', async () => {
    render(<StaffPortal />);
    await waitFor(() => {
      expect(screen.getByText(/No active incidents/i)).toBeInTheDocument();
    });
  });

  it('fetches and displays active incidents from localStorage', async () => {
    localStorage.setItem('stadium_incidents', JSON.stringify([MOCK_INCIDENT]));
    render(<StaffPortal />);
    await waitFor(() => {
      expect(screen.getByText(/Gate A/i)).toBeInTheDocument();
      expect(screen.getByText(/spill/i)).toBeInTheDocument();
    });
  });

  it('shows the correct badge count', async () => {
    localStorage.setItem('stadium_incidents', JSON.stringify([MOCK_INCIDENT, MOCK_MEDICAL]));
    render(<StaffPortal />);
    await waitFor(() => {
      expect(screen.getByText(/2 Active/i)).toBeInTheDocument();
    });
  });

  it('shows "via AI" tag for chatbot-sourced incidents', async () => {
    localStorage.setItem('stadium_incidents', JSON.stringify([MOCK_MEDICAL]));
    render(<StaffPortal />);
    await waitFor(() => {
      expect(screen.getByText(/via AI/i)).toBeInTheDocument();
    });
  });

  it('resolves an incident and removes it from the list', async () => {
    localStorage.setItem('stadium_incidents', JSON.stringify([MOCK_INCIDENT]));
    render(<StaffPortal />);

    await waitFor(() => {
      expect(screen.getByText(/Gate A/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /resolve spill incident at gate a/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Gate A/i)).not.toBeInTheDocument();
    });
  });

  it('stores resolvedAt timestamp when resolving', async () => {
    localStorage.setItem('stadium_incidents', JSON.stringify([MOCK_INCIDENT]));
    render(<StaffPortal />);

    await waitFor(() => {
      expect(screen.getByText(/Gate A/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /resolve spill incident at gate a/i }));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('stadium_incidents'));
      expect(stored[0].status).toBe('resolved');
      expect(stored[0].resolvedAt).toBeTruthy();
    });
  });

  it('does not display resolved incidents', async () => {
    localStorage.setItem('stadium_incidents', JSON.stringify([
      { ...MOCK_INCIDENT, status: 'resolved' }
    ]));
    render(<StaffPortal />);
    await waitFor(() => {
      expect(screen.queryByText(/Gate A/i)).not.toBeInTheDocument();
      expect(screen.getByText(/No active incidents/i)).toBeInTheDocument();
    });
  });
});
