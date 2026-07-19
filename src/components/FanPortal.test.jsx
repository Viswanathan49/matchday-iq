import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FanPortal from './FanPortal';

window.HTMLElement.prototype.scrollIntoView = function() {};

describe('FanPortal Component', () => {
  it('renders and switches tabs', () => {
    render(<FanPortal />);
    expect(screen.getByText('AI Assistant')).toBeInTheDocument(); // Chat is default

    // Switch to routing
    fireEvent.click(screen.getByText('Route'));
    expect(screen.getByText('Smart Crowd Routing')).toBeInTheDocument();

    // Switch to Dashboard
    fireEvent.click(screen.getByText('Dashboard'));
    expect(screen.getByText('Stadium Operations Dashboard')).toBeInTheDocument();

    // Switch to Report
    fireEvent.click(screen.getByText('Report'));
    expect(screen.getByText('Report an Issue')).toBeInTheDocument();
  });
});
