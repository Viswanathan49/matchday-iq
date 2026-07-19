import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Chatbot from './Chatbot';
import * as aiService from '../services/aiService';

vi.mock('../services/aiService', () => ({
  askAssistant: vi.fn()
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function() {};

describe('Chatbot Component', () => {
  it('renders initial message', () => {
    render(<Chatbot />);
    expect(screen.getByText(/I am your MatchDay IQ Assistant/)).toBeInTheDocument();
  });

  it('handles user input and displays response', async () => {
    aiService.askAssistant.mockResolvedValue({ reply: 'Mocked reply', intent: 'test' });
    
    render(<Chatbot />);
    
    const input = screen.getByRole('textbox', { name: /chat input/i });
    const locationInput = screen.getByRole('textbox', { name: /current location/i });
    const button = screen.getByRole('button', { name: /send/i });

    fireEvent.change(locationInput, { target: { value: 'Section 112' } });
    fireEvent.change(input, { target: { value: 'Where is food?' } });
    fireEvent.click(button);

    // User message should appear immediately
    expect(screen.getByText('Where is food?')).toBeInTheDocument();
    
    // Typing indicator check (optional based on implementation, here we just wait for reply)
    await waitFor(() => {
      expect(screen.getByText('Mocked reply')).toBeInTheDocument();
      expect(aiService.askAssistant).toHaveBeenCalledWith('Where is food?', 'en', 'Section 112');
    });
  });
});
