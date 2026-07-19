import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import StaffPortal from './StaffPortal';

describe('StaffPortal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('fetches and displays incidents', async () => {
    localStorage.setItem('stadium_incidents', JSON.stringify([
      { id: '1', type: 'spill', location: 'Gate A', timestamp: new Date().toISOString(), status: 'active' }
    ]));

    render(<StaffPortal />);
    
    await waitFor(() => {
      expect(screen.getByText(/Gate A/i)).toBeInTheDocument();
      expect(screen.getByText(/spill/i)).toBeInTheDocument();
    });
  });

  it('resolves an incident', async () => {
    localStorage.setItem('stadium_incidents', JSON.stringify([
      { id: '1', type: 'spill', location: 'Gate A', timestamp: new Date().toISOString(), status: 'active' }
    ]));

    render(<StaffPortal />);
    
    await waitFor(() => {
      expect(screen.getByText(/Gate A/i)).toBeInTheDocument();
    });

    const resolveBtn = screen.getByText('Mark Resolved');
    fireEvent.click(resolveBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Gate A/i)).not.toBeInTheDocument();
      
      // Verify local storage is updated
      const data = JSON.parse(localStorage.getItem('stadium_incidents'));
      expect(data[0].status).toBe('resolved');
    });
  });
});
