import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IncidentForm from './IncidentForm';

describe('IncidentForm Component', () => {
  it('renders correctly', () => {
    render(<IncidentForm />);
    expect(screen.getByText('Report an Issue')).toBeInTheDocument();
  });

  it('handles submission', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    
    render(<IncidentForm />);
    
    // Select location
    fireEvent.click(screen.getByRole('radio', { name: 'Gate B' }));
    
    // Select type
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'medical' } });
    
    // Submit
    fireEvent.click(screen.getByText('Submit Report'));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(screen.getByText(/successfully/i)).toBeInTheDocument();
    });
  });
});
