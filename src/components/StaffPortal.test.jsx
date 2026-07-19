import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StaffPortal from './StaffPortal';

describe('StaffPortal Component', () => {
  it('fetches and displays incidents', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: '1', type: 'spill', location: 'Gate A', timestamp: new Date().toISOString(), status: 'active' }
      ])
    });

    render(<StaffPortal />);
    
    expect(screen.getByText('Loading incidents...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/Gate A/i)).toBeInTheDocument();
      expect(screen.getByText(/spill/i)).toBeInTheDocument();
    });
  });

  it('resolves an incident', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { id: '1', type: 'spill', location: 'Gate A', timestamp: new Date().toISOString(), status: 'active' }
        ])
      })
      .mockResolvedValueOnce({ ok: true }) // For resolve
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      }); // For fetch after resolve

    render(<StaffPortal />);
    
    await waitFor(() => {
      expect(screen.getByText(/Gate A/i)).toBeInTheDocument();
    });

    const resolveBtn = screen.getByText('Mark Resolved');
    fireEvent.click(resolveBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Gate A/i)).not.toBeInTheDocument();
    });
  });
});
