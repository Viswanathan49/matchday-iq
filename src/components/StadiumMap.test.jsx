import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StadiumMap from './StadiumMap';

describe('StadiumMap Component', () => {
  it('renders correctly', () => {
    render(<StadiumMap onSelect={() => {}} selectedZone="" />);
    expect(screen.getByText('Interactive Stadium Map')).toBeInTheDocument();
    // Test some zones exist
    expect(screen.getByText('North Gate')).toBeInTheDocument();
    expect(screen.getByText('Section 112')).toBeInTheDocument();
  });

  it('handles click selection', () => {
    const handleSelect = vi.fn();
    const { container } = render(<StadiumMap onSelect={handleSelect} selectedZone="" />);
    
    // The clickable areas are rects, we can find them by ARIA role
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]);
    expect(handleSelect).toHaveBeenCalled();
  });

  it('handles keyboard navigation', () => {
    const handleSelect = vi.fn();
    render(<StadiumMap onSelect={handleSelect} selectedZone="" />);
    
    const firstRadio = screen.getAllByRole('radio')[0];
    
    // Press ArrowRight to move focus (this updates internal state but doesn't call onSelect)
    fireEvent.keyDown(firstRadio, { key: 'ArrowRight' });
    
    // Press Space to select
    fireEvent.keyDown(firstRadio, { key: ' ' });
    expect(handleSelect).toHaveBeenCalled();
  });
});
