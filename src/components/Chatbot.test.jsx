import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Chatbot from './Chatbot';
import * as aiService from '../services/aiService';

vi.mock('../services/aiService', () => ({
  askAssistant: vi.fn(),
}));

// Silence scrollIntoView in jsdom
window.HTMLElement.prototype.scrollIntoView = function () {};

const WELCOME_TEXT = 'Hello! I am your MatchDay IQ Assistant. How can I help you?';

describe('Chatbot Component', () => {
  beforeEach(() => {
    localStorage.clear();
    aiService.askAssistant.mockClear();
  });

  it('renders the welcome message on first load', () => {
    render(<Chatbot />);
    expect(screen.getByText(WELCOME_TEXT)).toBeInTheDocument();
  });

  it('renders the chat input and send button', () => {
    render(<Chatbot />);
    expect(screen.getByLabelText(/Chat input message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Send message/i)).toBeInTheDocument();
  });

  it('renders the language selector', () => {
    render(<Chatbot />);
    expect(screen.getByLabelText(/Language selector/i)).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    render(<Chatbot />);
    expect(screen.getByLabelText(/Send message/i)).toBeDisabled();
  });

  it('enables send button when text is typed', () => {
    render(<Chatbot />);
    fireEvent.change(screen.getByLabelText(/Chat input message/i), { target: { value: 'hello' } });
    expect(screen.getByLabelText(/Send message/i)).not.toBeDisabled();
  });

  it('sends a message and displays response', async () => {
    aiService.askAssistant.mockResolvedValueOnce({ reply: 'AI says hi', intent: 'general' });
    render(<Chatbot />);

    fireEvent.change(screen.getByLabelText(/Chat input message/i), { target: { value: 'hello' } });
    fireEvent.click(screen.getByLabelText(/Send message/i));

    await waitFor(() => {
      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('AI says hi')).toBeInTheDocument();
    });
  });

  it('calls askAssistant with user input', async () => {
    aiService.askAssistant.mockResolvedValueOnce({ reply: 'Restroom at Gate B', intent: 'routing' });
    render(<Chatbot />);

    fireEvent.change(screen.getByLabelText(/Chat input message/i), { target: { value: 'where is the restroom?' } });
    fireEvent.click(screen.getByLabelText(/Send message/i));

    await waitFor(() => {
      expect(aiService.askAssistant).toHaveBeenCalledWith(
        'where is the restroom?',
        'en',
        ''
      );
    });
  });

  it('clears input after sending', async () => {
    aiService.askAssistant.mockResolvedValueOnce({ reply: 'ok', intent: 'general' });
    render(<Chatbot />);

    const input = screen.getByLabelText(/Chat input message/i);
    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.click(screen.getByLabelText(/Send message/i));

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('displays error message when askAssistant throws', async () => {
    aiService.askAssistant.mockRejectedValueOnce(new Error('Network failure'));
    render(<Chatbot />);

    fireEvent.change(screen.getByLabelText(/Chat input message/i), { target: { value: 'break this' } });
    fireEvent.click(screen.getByLabelText(/Send message/i));

    await waitFor(() => {
      expect(screen.getByText(/Sorry, I am having trouble connecting/i)).toBeInTheDocument();
    });
  });

  it('triggers onRouteAction when reply contains ROUTE tag', async () => {
    const onRouteAction = vi.fn();
    aiService.askAssistant.mockResolvedValueOnce({
      reply: 'Go to Gate B! [ROUTE:Gate B]',
      intent: 'routing',
    });
    render(<Chatbot onRouteAction={onRouteAction} />);

    fireEvent.change(screen.getByLabelText(/Chat input message/i), { target: { value: 'restroom' } });
    fireEvent.click(screen.getByLabelText(/Send message/i));

    await waitFor(() => {
      expect(screen.getByText(/Go to Gate B!/i)).toBeInTheDocument();
    });

    // Wait for the 1500ms delayed routing trigger
    await new Promise(r => setTimeout(r, 1600));
    expect(onRouteAction).toHaveBeenCalledWith('Gate B');
  });

  it('saves incident to localStorage when reply contains INCIDENT tag', async () => {
    aiService.askAssistant.mockResolvedValueOnce({
      reply: 'Cleaning crew alerted! [INCIDENT:spill:Gate A]',
      intent: 'report',
    });
    render(<Chatbot />);

    fireEvent.change(screen.getByLabelText(/Chat input message/i), { target: { value: 'spill on floor' } });
    fireEvent.click(screen.getByLabelText(/Send message/i));

    await waitFor(() => {
      const incidents = JSON.parse(localStorage.getItem('stadium_incidents') || '[]');
      expect(incidents.length).toBeGreaterThan(0);
      expect(incidents[0].type).toBe('spill');
      expect(incidents[0].location).toBe('Gate A');
      expect(incidents[0].source).toBe('ai-chatbot');
    });
  });

  it('persists messages to localStorage after conversation', async () => {
    aiService.askAssistant.mockResolvedValueOnce({ reply: 'sure', intent: 'general' });
    render(<Chatbot />);

    fireEvent.change(screen.getByLabelText(/Chat input message/i), { target: { value: 'hi' } });
    fireEvent.click(screen.getByLabelText(/Send message/i));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('chatbot_messages') || '[]');
      expect(saved.some(m => m.text === 'hi' && m.isUser)).toBe(true);
    });
  });

  it('loads existing messages from localStorage on mount', () => {
    const stored = [
      { id: '1', text: 'Old message from last session', isUser: false }
    ];
    localStorage.setItem('chatbot_messages', JSON.stringify(stored));

    render(<Chatbot />);
    expect(screen.getByText('Old message from last session')).toBeInTheDocument();
  });

  it('changes language selector to Arabic', () => {
    render(<Chatbot />);
    const selector = screen.getByLabelText(/Language selector/i);
    fireEvent.change(selector, { target: { value: 'ar' } });
    expect(selector.value).toBe('ar');
    // Arabic send button text
    expect(screen.getByText('إرسال')).toBeInTheDocument();
  });

  it('updates location input', () => {
    render(<Chatbot />);
    const locationInput = screen.getByLabelText(/Current Location/i);
    fireEvent.change(locationInput, { target: { value: 'Section 112' } });
    expect(locationInput.value).toBe('Section 112');
  });

  it('passes location to askAssistant', async () => {
    aiService.askAssistant.mockResolvedValueOnce({ reply: 'ok', intent: 'general' });
    render(<Chatbot />);

    fireEvent.change(screen.getByLabelText(/Current Location/i), { target: { value: 'North Gate' } });
    fireEvent.change(screen.getByLabelText(/Chat input message/i), { target: { value: 'help' } });
    fireEvent.click(screen.getByLabelText(/Send message/i));

    await waitFor(() => {
      expect(aiService.askAssistant).toHaveBeenCalledWith('help', 'en', 'North Gate');
    });
  });

  it('does not send empty or whitespace messages', () => {
    render(<Chatbot />);
    fireEvent.change(screen.getByLabelText(/Chat input message/i), { target: { value: '   ' } });
    expect(screen.getByLabelText(/Send message/i)).toBeDisabled();
    expect(aiService.askAssistant).not.toHaveBeenCalled();
  });

  it('handles corrupted messages JSON in localStorage on mount', () => {
    localStorage.setItem('chatbot_messages', 'invalid-corrupt-json-{');
    render(<Chatbot />);
    expect(screen.getByText(WELCOME_TEXT)).toBeInTheDocument();
  });

  it('handles localStorage write errors when saving messages', async () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => { throw new Error('Storage full'); };
    
    aiService.askAssistant.mockResolvedValueOnce({ reply: 'I hear you', intent: 'general' });
    render(<Chatbot />);

    fireEvent.change(screen.getByLabelText(/Chat input message/i), { target: { value: 'test setItem error' } });
    fireEvent.click(screen.getByLabelText(/Send message/i));

    await waitFor(() => {
      expect(screen.getByText('I hear you')).toBeInTheDocument();
    });

    localStorage.setItem = originalSetItem;
  });

  it('handles localStorage write errors when auto-reporting incident from AI reply', async () => {
    const originalSetItem = localStorage.setItem;
    // Allow messages write but block incidents write
    localStorage.setItem = (key, val) => {
      if (key === 'stadium_incidents') throw new Error('Blocked');
      originalSetItem(key, val);
    };

    aiService.askAssistant.mockResolvedValueOnce({
      reply: 'Reported! [INCIDENT:spill:Gate A]',
      intent: 'report',
    });
    render(<Chatbot />);

    fireEvent.change(screen.getByLabelText(/Chat input message/i), { target: { value: 'spill' } });
    fireEvent.click(screen.getByLabelText(/Send message/i));

    await waitFor(() => {
      expect(screen.getByText('Reported!')).toBeInTheDocument();
    });

    localStorage.setItem = originalSetItem;
  });
});
