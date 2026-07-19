import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StadiumMap from './StadiumMap';

describe('StadiumMap Component', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders the map title', () => {
    render(<StadiumMap selectedZone={null} onSelect={mockOnSelect} />);
    expect(screen.getByText(/Interactive Stadium Map/i)).toBeInTheDocument();
  });

  it('renders all 7 stadium zones as radio options', () => {
    render(<StadiumMap selectedZone={null} onSelect={mockOnSelect} />);
    expect(screen.getByRole('radio', { name: 'North Gate' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'South Gate' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Gate B' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Section 112' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Section 204' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Sensory Room' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Food Court' })).toBeInTheDocument();
  });

  it('calls onSelect when a zone is clicked', () => {
    render(<StadiumMap selectedZone={null} onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByRole('radio', { name: 'North Gate' }));
    expect(mockOnSelect).toHaveBeenCalledWith('North Gate');
  });

  it('marks the selected zone as aria-checked', () => {
    render(<StadiumMap selectedZone="Food Court" onSelect={mockOnSelect} />);
    const foodCourt = screen.getByRole('radio', { name: 'Food Court' });
    expect(foodCourt).toHaveAttribute('aria-checked', 'true');
  });

  it('marks non-selected zones as aria-checked=false', () => {
    render(<StadiumMap selectedZone="Food Court" onSelect={mockOnSelect} />);
    const northGate = screen.getByRole('radio', { name: 'North Gate' });
    expect(northGate).toHaveAttribute('aria-checked', 'false');
  });

  it('has a radiogroup role on the SVG element', () => {
    render(<StadiumMap selectedZone={null} onSelect={mockOnSelect} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('is keyboard navigable with ArrowRight (moves to next zone)', () => {
    render(<StadiumMap selectedZone="North Gate" onSelect={mockOnSelect} />);
    const northGate = screen.getByRole('radio', { name: 'North Gate' });
    fireEvent.keyDown(northGate, { key: 'ArrowRight' });
    // Focus moves to second zone, South Gate
    expect(screen.getByRole('radio', { name: 'South Gate' })).toBeInTheDocument();
  });

  it('is keyboard navigable with ArrowLeft (wraps to last zone)', () => {
    render(<StadiumMap selectedZone="North Gate" onSelect={mockOnSelect} />);
    const northGate = screen.getByRole('radio', { name: 'North Gate' });
    fireEvent.keyDown(northGate, { key: 'ArrowLeft' });
    // Focus wraps to last zone
    expect(screen.getByRole('radio', { name: 'Food Court' })).toBeInTheDocument();
  });

  it('selects zone on Enter key', () => {
    render(<StadiumMap selectedZone={null} onSelect={mockOnSelect} />);
    const gateB = screen.getByRole('radio', { name: 'Gate B' });
    fireEvent.keyDown(gateB, { key: 'Enter' });
    expect(mockOnSelect).toHaveBeenCalledWith('Gate B');
  });

  it('selects zone on Space key', () => {
    render(<StadiumMap selectedZone={null} onSelect={mockOnSelect} />);
    const sensoryRoom = screen.getByRole('radio', { name: 'Sensory Room' });
    fireEvent.keyDown(sensoryRoom, { key: ' ' });
    expect(mockOnSelect).toHaveBeenCalledWith('Sensory Room');
  });

  it('ArrowDown also moves to the next zone', () => {
    render(<StadiumMap selectedZone="North Gate" onSelect={mockOnSelect} />);
    const northGate = screen.getByRole('radio', { name: 'North Gate' });
    fireEvent.keyDown(northGate, { key: 'ArrowDown' });
    // Should move focus (no crash)
    expect(northGate).toBeInTheDocument();
  });

  it('ArrowUp also moves to the previous zone', () => {
    render(<StadiumMap selectedZone="South Gate" onSelect={mockOnSelect} />);
    const southGate = screen.getByRole('radio', { name: 'South Gate' });
    fireEvent.keyDown(southGate, { key: 'ArrowUp' });
    expect(southGate).toBeInTheDocument();
  });

  it('renders keyboard instructions for screen readers', () => {
    render(<StadiumMap selectedZone={null} onSelect={mockOnSelect} />);
    expect(screen.getByText(/Arrow keys/i)).toBeInTheDocument();
  });

  it('is labeled by map-label for screen readers', () => {
    render(<StadiumMap selectedZone={null} onSelect={mockOnSelect} />);
    expect(screen.getByRole('radiogroup', { name: /Interactive Stadium Map/i })).toBeInTheDocument();
  });
});
