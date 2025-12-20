// Sahayak Copilot AI Service with OpenRouter Integration

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

// System prompt defining Sahayak Copilot's personality and scope
const SYSTEM_PROMPT = `You are Sahayak Copilot, an AI assistant for the Sahayak app - a scam prevention and government policy navigator for Indian citizens.

Your primary responsibilities:
1. Help users understand government schemes and policies in simple language
2. Assist in drafting FIR (First Information Report) descriptions for cybercrime and fraud cases
3. Provide guidance on scam prevention and safety tips
4. Explain eligibility criteria and application processes for government schemes
5. Answer questions about cyber fraud compensation, victim support systems, and legal procedures

Your scope and boundaries:
- You ONLY answer questions related to: scam prevention, FIR assistance, government schemes, cybercrime, fraud reporting, victim support, and related legal procedures
- If asked about topics OUTSIDE this scope (general knowledge, entertainment, unrelated topics), politely redirect: "I'm Sahayak Copilot, specialized in scam prevention and government policy assistance. I can only help with FIR drafting, scheme information, fraud prevention, and related legal guidance. Please ask me something within my area of expertise."
- Always be respectful, empathetic, and supportive - remember users may be victims of fraud
- Use simple, clear language - avoid legal jargon unless necessary
- Provide actionable steps and practical advice
- When discussing FIR content, focus on factual, chronological narrative structure
- For government schemes, explain eligibility, benefits, and application process clearly

Response style:
- Keep responses concise and practical (2-4 paragraphs typically)
- Use bullet points for step-by-step guidance
- Be empathetic but professional
- Always prioritize user safety and legal accuracy

Remember: You are here to empower citizens to navigate complex systems with confidence.`;

/**
 * Send a message to the AI copilot and get a response
 * @param {Array} messages - Array of message objects with {role, content}
 * @returns {Promise<string>} - AI response text
 */
export async function sendCopilotMessage(messages) {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    // Format messages for OpenRouter API
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
    ];

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Sahayak - Scam Prevention & Policy Navigator'
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it:free', // Free model that works
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Service Error:', error);
    
    // Return user-friendly error messages
    if (error.message.includes('API key')) {
      return 'Sorry, the AI service is not properly configured. Please contact support.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'I\'m having trouble connecting to the AI service. Please check your internet connection and try again.';
    } else {
      return 'I encountered an error processing your request. Please try again in a moment.';
    }
  }
}

/**
 * Check if user query is within Sahayak Copilot's scope
 * @param {string} query - User's question
 * @returns {boolean} - True if within scope
 */
export function isQueryInScope(query) {
  const scopeKeywords = [
    'fir', 'complaint', 'police', 'report', 'cybercrime', 'fraud', 'scam',
    'scheme', 'policy', 'government', 'eligibility', 'apply', 'application',
    'benefit', 'compensation', 'victim', 'legal', 'help', 'assistance',
    'document', 'proof', 'evidence', 'incident', 'cheated', 'stolen',
    'phishing', 'upi', 'bank', 'online fraud', 'safety', 'prevention'
  ];

  const lowerQuery = query.toLowerCase();
  return scopeKeywords.some(keyword => lowerQuery.includes(keyword));
}

/**
 * Get a contextual welcome message based on page context
 * @param {string} context - Context like 'fir', 'schemes', 'general'
 * @returns {string} - Contextual greeting
 */
export function getContextualGreeting(context = 'general') {
  const greetings = {
    fir: 'Hello! I\'m Sahayak Copilot. I can help you draft a clear, factual FIR description. Tell me what happened, and I\'ll help you structure it properly.',
    schemes: 'Hi! I\'m Sahayak Copilot. I can explain government schemes, check eligibility, and guide you through the application process. What would you like to know?',
    general: 'Hello! I\'m Sahayak Copilot, your assistant for scam prevention and government policy guidance. I can help with:\n\n• Drafting FIR descriptions for fraud cases\n• Understanding government schemes and eligibility\n• Scam prevention tips and safety guidance\n• Legal procedures and documentation\n\nHow can I assist you today?'
  };

  return greetings[context] || greetings.general;
}

export default {
  sendCopilotMessage,
  isQueryInScope,
  getContextualGreeting
};
