import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FanPortal from './FanPortal';

// All child components mocked to isolate FanPortal logic
vi.mock('./Dashboard', () => ({ default: () => <div data-testid="dashboard">Dashboard</div> }));
vi.mock('./Chatbot', () => ({ default: ({ onRouteAction }) => (
  <div data-testid="chatbot">
    <button onClick={() => onRouteAction && onRouteAction('Food Court')}>Trigger Route</button>
    Chatbot
  </div>
)}));
vi.mock('./CrowdRouting', () => ({ default: ({ initialDestination }) => (
  <div data-testid="crowd-routing">CrowdRouting: {initialDestination}</div>
)}));
vi.mock('./IncidentForm', () => ({ default: () => <div data-testid="incident-form">IncidentForm</div> }));
vi.mock('./MatchSelector', () => ({ default: ({ onSelect }) => (
  <button data-testid="match-selector" onClick={() => onSelect({ id: 'M1', name: 'Test Match', team1: 'A', team2: 'B' })}>
    Select Match
  </button>
)}));

describe('FanPortal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows MatchSelector before a match is selected', () => {
    render(<FanPortal />);
    expect(screen.getByTestId('match-selector')).toBeInTheDocument();
  });

  it('shows the portal after match is selected', () => {
    render(<FanPortal />);
    fireEvent.click(screen.getByTestId('match-selector'));
    expect(screen.getByTestId('chatbot')).toBeInTheDocument();
  });

  it('default active tab is chat after match selection', () => {
    render(<FanPortal />);
    fireEvent.click(screen.getByTestId('match-selector'));
    expect(screen.getByTestId('chatbot')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  it('switches to Dashboard on Dashboard tab click', () => {
    render(<FanPortal />);
    fireEvent.click(screen.getByTestId('match-selector'));
    fireEvent.click(screen.getByRole('tab', { name: /dashboard/i }));
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('chatbot')).not.toBeInTheDocument();
  });

  it('switches to IncidentForm on Report tab click', () => {
    render(<FanPortal />);
    fireEvent.click(screen.getByTestId('match-selector'));
    fireEvent.click(screen.getByRole('tab', { name: /report/i }));
    expect(screen.getByTestId('incident-form')).toBeInTheDocument();
  });

  it('switches to CrowdRouting on Route tab click', () => {
    render(<FanPortal />);
    fireEvent.click(screen.getByTestId('match-selector'));
    fireEvent.click(screen.getByRole('tab', { name: /route/i }));
    expect(screen.getByTestId('crowd-routing')).toBeInTheDocument();
  });

  it('automatically switches to route tab when chatbot triggers onRouteAction', async () => {
    render(<FanPortal />);
    fireEvent.click(screen.getByTestId('match-selector'));

    const chatbot = screen.getByTestId('chatbot');
    expect(chatbot).toBeInTheDocument();

    fireEvent.click(screen.getByText('Trigger Route'));

    await waitFor(() => {
      expect(screen.getByTestId('crowd-routing')).toBeInTheDocument();
    });
  });

  it('passes destination to CrowdRouting when routed from chatbot', async () => {
    render(<FanPortal />);
    fireEvent.click(screen.getByTestId('match-selector'));
    fireEvent.click(screen.getByText('Trigger Route'));

    await waitFor(() => {
      expect(screen.getByText(/Food Court/)).toBeInTheDocument();
    });
  });

  it('renders all 4 tab buttons', () => {
    render(<FanPortal />);
    fireEvent.click(screen.getByTestId('match-selector'));
    expect(screen.getByRole('tab', { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /route/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /report/i })).toBeInTheDocument();
  });

  it('active tab has aria-selected=true', () => {
    render(<FanPortal />);
    fireEvent.click(screen.getByTestId('match-selector'));
    expect(screen.getByRole('tab', { name: /chat/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /route/i })).toHaveAttribute('aria-selected', 'false');
  });

  it('tab list has aria-label for screen readers', () => {
    render(<FanPortal />);
    fireEvent.click(screen.getByTestId('match-selector'));
    expect(screen.getByRole('tablist', { name: /Fan portal sections/i })).toBeInTheDocument();
  });
});
