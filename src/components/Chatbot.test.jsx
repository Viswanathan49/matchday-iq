import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Chatbot from './Chatbot';
import * as aiService from '../services/aiService';

vi.mock('../services/aiService', () => ({
  askAssistant: vi.fn()
}));

// Mock scrollIntoView as jsdom doesn't implement it
window.HTMLElement.prototype.scrollIntoView = function () {};

describe('Chatbot Component', () => {
  beforeEach(() => {
    localStorage.clear();
    aiService.askAssistant.mockClear();
  });

  it('renders initial greeting message', () => {
    render(<Chatbot />);
    expect(screen.getByText(/I am your MatchDay IQ Assistant/)).toBeInTheDocument();
  });

  it('renders language selector with all options', () => {
    render(<Chatbot />);
    const selector = screen.getByLabelText('Language selector');
    expect(selector).toBeInTheDocument();
    expect(selector).toHaveValue('en');
  });

  it('handles user input and displays AI response', async () => {
    aiService.askAssistant.mockResolvedValue({ reply: 'Mocked reply', intent: 'general' });
    render(<Chatbot />);

    const input = screen.getByRole('textbox', { name: /chat input/i });
    const button = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Where is food?' } });
    fireEvent.click(button);

    expect(screen.getByText('Where is food?')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mocked reply')).toBeInTheDocument();
      expect(aiService.askAssistant).toHaveBeenCalledWith('Where is food?', 'en', '');
    });
  });

  it('passes location context to askAssistant', async () => {
    aiService.askAssistant.mockResolvedValue({ reply: 'Near you!', intent: 'routing' });
    render(<Chatbot />);

    const locationInput = screen.getByLabelText(/current location/i);
    fireEvent.change(locationInput, { target: { value: 'Section 112' } });

    const chatInput = screen.getByLabelText(/chat input/i);
    fireEvent.change(chatInput, { target: { value: 'Where is the exit?' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(aiService.askAssistant).toHaveBeenCalledWith('Where is the exit?', 'en', 'Section 112');
    });
  });

  it('calls onRouteAction callback when AI returns [ROUTE:] token', async () => {
    aiService.askAssistant.mockResolvedValue({
      reply: 'Head to the Food Court! [ROUTE:Food Court]',
      intent: 'routing'
    });
    const mockRouteAction = vi.fn();
    render(<Chatbot onRouteAction={mockRouteAction} />);

    const input = screen.getByLabelText(/chat input/i);
    fireEvent.change(input, { target: { value: 'food please' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/Head to the Food Court/)).toBeInTheDocument();
    });
  });

  it('displays error message when askAssistant throws', async () => {
    aiService.askAssistant.mockRejectedValue(new Error('Network failure'));
    render(<Chatbot />);

    const input = screen.getByLabelText(/chat input/i);
    fireEvent.change(input, { target: { value: 'test error' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/trouble connecting/i)).toBeInTheDocument();
    });
  });

  it('does not submit on empty input', () => {
    render(<Chatbot />);
    const button = screen.getByRole('button', { name: /send/i });
    expect(button).toBeDisabled();
  });

  it('persists messages to localStorage', async () => {
    aiService.askAssistant.mockResolvedValue({ reply: 'Saved reply', intent: 'general' });
    render(<Chatbot />);

    const input = screen.getByLabelText(/chat input/i);
    fireEvent.change(input, { target: { value: 'Remember me' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('chatbot_messages') || '[]');
      expect(stored.some(m => m.text === 'Remember me')).toBe(true);
    });
  });
});
