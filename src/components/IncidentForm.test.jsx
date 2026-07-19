import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import IncidentForm from './IncidentForm';

describe('IncidentForm Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up any leaked toasts in document.body
    document.querySelectorAll('.fixed.top-4.right-4').forEach(toast => toast.remove());
  });

  it('renders correctly with all form elements', () => {
    render(<IncidentForm />);
    expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Submit Report')).toBeInTheDocument();
  });

  it('shows error when submitting without selecting a location', () => {
    render(<IncidentForm />);
    fireEvent.click(screen.getByText('Submit Report'));
    expect(screen.getByText(/Please select a location/i)).toBeInTheDocument();
  });

  it('handles successful submission with location selected', async () => {
    render(<IncidentForm />);

    // Select a location via the map radio
    fireEvent.click(screen.getByRole('radio', { name: 'Gate B' }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'medical' } });

    fireEvent.click(screen.getByText('Submit Report'));

    await waitFor(() => {
      expect(screen.getByText(/successfully/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  }, 10000);

  it('persists incident to localStorage on submission', async () => {
    render(<IncidentForm />);

    fireEvent.click(screen.getByRole('radio', { name: 'North Gate' }));
    fireEvent.click(screen.getByText('Submit Report'));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('stadium_incidents') || '[]');
      expect(stored.length).toBeGreaterThan(0);
      expect(stored[0].location).toBe('North Gate');
      expect(stored[0].status).toBe('active');
    }, { timeout: 3000 });
  }, 10000);

  it('only allows whitelisted incident types in select', () => {
    render(<IncidentForm />);
    const select = screen.getByRole('combobox');
    const options = Array.from(select.options).map(o => o.value);
    expect(options).toContain('spill');
    expect(options).toContain('medical');
    expect(options).toContain('security');
    expect(options).toContain('maintenance');
    expect(options.length).toBe(4);
  });

  it('resets location field after successful submission', async () => {
    render(<IncidentForm />);

    fireEvent.click(screen.getByRole('radio', { name: 'Gate B' }));
    expect(screen.getByText(/Selected: Gate B/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Submit Report'));

    await waitFor(() => {
      expect(screen.queryByText(/Selected: Gate B/)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  }, 10000);

  it('falls back when existing storage contains invalid JSON', async () => {
    localStorage.setItem('stadium_incidents', 'invalid-json-{');
    render(<IncidentForm />);

    fireEvent.click(screen.getByRole('radio', { name: 'North Gate' }));
    fireEvent.click(screen.getByText('Submit Report'));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('stadium_incidents') || '[]');
      expect(stored.length).toBe(1);
      expect(stored[0].location).toBe('North Gate');
    }, { timeout: 3000 });
  }, 10000);

  it('handles write errors to localStorage gracefully', async () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full');
    });
    render(<IncidentForm />);

    fireEvent.click(screen.getByRole('radio', { name: 'North Gate' }));
    fireEvent.click(screen.getByText('Submit Report'));

    await waitFor(() => {
      expect(screen.getByText(/Error connecting to server/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    spy.mockRestore();
  }, 10000);

  it('creates, fades and removes toast notification using timers', async () => {
    vi.useFakeTimers();
    render(<IncidentForm />);

    fireEvent.click(screen.getByRole('radio', { name: 'Gate B' }));
    fireEvent.click(screen.getByText('Submit Report'));

    // Fast-forward PWA submit delay inside act
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    // Verify toast is present
    const toast = screen.getByText('✅ Incident Reported');
    expect(toast).toBeInTheDocument();

    // Advance 3000ms to trigger fade out inside act
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(toast.style.opacity).toBe('0');

    // Advance 500ms to trigger remove inside act
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(toast).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
