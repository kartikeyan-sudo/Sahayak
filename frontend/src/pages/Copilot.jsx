import { useEffect, useRef, useState } from 'react';
import { sendCopilotMessage, getContextualGreeting, isQueryInScope } from '../services/aiService';
import './Copilot.css';

function isLikelyHtml(text) {
  if (!text || typeof text !== 'string') return false;
  return /<\/?[a-z][\s\S]*>/i.test(text) || /<!doctype|<html|<body/i.test(text);
}

function sanitizeHtml(input) {
  if (typeof window === 'undefined' || typeof input !== 'string') return input;

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(input, 'text/html');
  const allowedTags = new Set([
    'P', 'B', 'STRONG', 'I', 'EM', 'UL', 'OL', 'LI', 'BR', 'CODE', 'PRE',
    'H1', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'A', 'SPAN', 'DIV'
  ]);

  const allowedAttrs = new Set(['href', 'target', 'rel', 'class']);

  const allElements = Array.from(doc.body.querySelectorAll('*'));
  allElements.forEach((el) => {
    if (!allowedTags.has(el.tagName)) {
      const textNode = doc.createTextNode(el.textContent || '');
      el.replaceWith(textNode);
      return;
    }

    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value || '';

      if (name.startsWith('on') || name === 'style' || !allowedAttrs.has(name)) {
        el.removeAttribute(attr.name);
        return;
      }

      if (name === 'href') {
        const safeHref = /^(https?:|mailto:|tel:|#|\/)/i.test(value);
        if (!safeHref) {
          el.removeAttribute('href');
        } else {
          el.setAttribute('rel', 'noopener noreferrer');
          if (!el.getAttribute('target')) el.setAttribute('target', '_blank');
        }
      }
    });
  });

  return doc.body.innerHTML;
}

function renderMessageContent(msg) {
  if (msg.type !== 'bot' || !isLikelyHtml(msg.text)) {
    return msg.text;
  }

  const cleanHtml = sanitizeHtml(msg.text);

  return <div className="rendered-html" dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}

function Copilot() {
  const messagesRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: getContextualGreeting('general')
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, isLoading]);

  const quickActions = [
    'How do I file an FIR for online fraud?',
    'Explain PM Vishwakarma Scheme',
    'What documents needed for cyber fraud complaint?',
    'How to check if a scheme is legitimate?'
  ];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    
    // Add user message immediately
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInputText('');
    setIsLoading(true);

    try {
      // Check if query is in scope
      if (!isQueryInScope(userMessage)) {
        // If out of scope, provide redirection message
        setMessages(prev => [...prev, {
          type: 'bot',
          text: 'I\'m Sahayak Copilot, specialized in scam prevention and government policy assistance. I can only help with:\n\n• FIR drafting and fraud reporting\n• Government schemes and eligibility\n• Scam prevention and safety tips\n• Legal procedures and documentation\n\nPlease ask me something within my area of expertise. How can I help you with these topics?'
        }]);
        setIsLoading(false);
        return;
      }

      // Get all messages for context
      const contextMessages = [...messages, { type: 'user', text: userMessage }];
      
      // Call AI service
      const botResponse = await sendCopilotMessage(contextMessages);
      
      // Add bot response
      setMessages(prev => [...prev, {
        type: 'bot',
        text: botResponse
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    // Treat quick action as user message
    setMessages(prev => [...prev, { type: 'user', text: action }]);
    setIsLoading(true);

    try {
      const contextMessages = [...messages, { type: 'user', text: action }];
      const botResponse = await sendCopilotMessage(contextMessages);
      
      setMessages(prev => [...prev, {
        type: 'bot',
        text: botResponse
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="copilot-page">
      <div className="page-header">
        <h2>Sahayak Copilot</h2>
        <p>AI-powered assistance for scam prevention and policy guidance</p>
      </div>

      <div className="copilot-container card">
        <div className="copilot-header">
          <div className="status-indicator">
            <span className={`status-dot ${isLoading ? 'loading' : 'active'}`}></span>
            <span>{isLoading ? 'Thinking...' : 'AI Active'}</span>
          </div>
          <button
            className={`voice-toggle ${voiceEnabled ? 'active' : ''}`}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </button>
        </div>

        <div className="messages-container" ref={messagesRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.type}`}>
              <div className="message-avatar">
                {msg.type === 'bot' ? 'AI' : 'You'}
              </div>
              <div className="message-bubble">
                {renderMessageContent(msg)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="message-avatar">AI</div>
              <div className="message-bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <p className="quick-actions-label">Quick Actions:</p>
          <div className="quick-actions-buttons">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                className="quick-action-btn"
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="copilot-input-form">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask me about scams, FIR help, schemes, or fraud prevention..."
            className="copilot-input"
            disabled={isLoading}
          />
          <button type="submit" className="send-btn" disabled={isLoading}>
            {isLoading ? '...' : 'Send →'}
          </button>
        </form>
      </div>

      <section className="copilot-features card">
        <h3>AI Capabilities</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>FIR Narrative Help</h4>
            <p>Get help structuring your fraud complaint in clear, factual language</p>
          </div>
          <div className="feature-card">
            <h4>Scheme Guidance</h4>
            <p>Understand eligibility and benefits of government schemes</p>
          </div>
          <div className="feature-card">
            <h4>Scam Prevention</h4>
            <p>Learn how to identify and protect yourself from fraud</p>
          </div>
          <div className="feature-card">
            <h4>Legal Procedures</h4>
            <p>Get guidance on documentation and reporting processes</p>
          </div>
        </div>
        <div className="copilot-note">
          <p><strong>Note:</strong> Sahayak Copilot is specialized for scam prevention and policy assistance. For general questions outside this scope, please use other resources.</p>
        </div>
      </section>
    </div>
  );
}

export default Copilot;
