import { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { askAssistant } from '../services/aiService';
import PropTypes from 'prop-types';

const Message = ({ text, isUser, isRtl }) => {
  const safeText = DOMPurify.sanitize(text);

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div 
        className={`max-w-[80%] rounded-2xl p-4 ${
          isUser 
            ? 'bg-blue-600 text-white ' + (isRtl ? 'rounded-bl-none' : 'rounded-br-none')
            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white ' + (isRtl ? 'rounded-br-none' : 'rounded-bl-none')
        }`}
        dangerouslySetInnerHTML={{ __html: safeText }}
      />
    </div>
  );
};

Message.propTypes = {
  text: PropTypes.string.isRequired,
  isUser: PropTypes.bool.isRequired,
  isRtl: PropTypes.bool,
};

const Chatbot = ({ onRouteAction }) => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatbot_messages');
    if (saved) return JSON.parse(saved);
    return [{ id: '1', text: 'Hello! I am your MatchDay IQ Assistant. How can I help you?', isUser: false }];
  });
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [location, setLocation] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  const isRtl = language === 'ar';

  useEffect(() => {
    localStorage.setItem('chatbot_messages', JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userMsg, isUser: true }]);
    
    setIsTyping(true);
    
    try {
      const response = await askAssistant(userMsg, language, location);
      let replyText = response.reply;
      
      // Dynamic UI Action Interceptors
      const routeMatch = replyText.match(/\[ROUTE:(.+?)\]/i);
      if (routeMatch) {
        const dest = routeMatch[1].trim();
        replyText = replyText.replace(routeMatch[0], '').trim();
        if (onRouteAction) {
          // Slight delay for UX
          setTimeout(() => onRouteAction(dest), 1500);
        }
      }

      const incidentMatch = replyText.match(/\[INCIDENT:(.+?):(.+?)\]/i);
      if (incidentMatch) {
        const type = incidentMatch[1].trim();
        const loc = incidentMatch[2].trim();
        replyText = replyText.replace(incidentMatch[0], '').trim();
        
        // Auto-fire to backend
        fetch('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, location: loc })
        }).catch(err => console.error(err));
      }

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: replyText, 
        isUser: false 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: 'Sorry, I am having trouble connecting.', 
        isUser: false 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      <header className="bg-blue-600 p-4 flex justify-between items-center text-white">
        <div>
          <h2 className="font-bold text-lg">AI Assistant</h2>
          <p className="text-blue-100 text-sm">Multilingual support</p>
        </div>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-blue-700 border border-blue-500 rounded p-1 text-sm outline-none"
          aria-label="Language selector"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="pt">Português</option>
          <option value="ar">العربية (Arabic)</option>
        </select>
      </header>

      <div className="bg-slate-100 dark:bg-slate-700 p-2 border-b border-slate-200 dark:border-slate-600">
        <input 
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Where are you now? (Optional)"
          className="w-full p-2 text-sm rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 text-slate-900 dark:text-white focus:outline-none"
          aria-label="Current Location"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
        {messages.map(msg => (
          <Message key={msg.id} text={msg.text} isUser={msg.isUser} isRtl={isRtl} />
        ))}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-4 text-slate-500 dark:text-slate-400">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRtl ? "اكتب سؤالك..." : "Type your question..."}
            className="flex-1 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Chat input message"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg disabled:opacity-50 transition-colors"
            aria-label="Send message"
          >
            {isRtl ? "إرسال" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

Chatbot.propTypes = {
  onRouteAction: PropTypes.func
};

export default Chatbot;
