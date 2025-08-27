import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    model?: string;
    temperature?: number;
    tokens?: number;
  };
}

export interface ChatbotConfig {
  enabled: boolean;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'llama-2';
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  welcomeMessage: string;
  placeholder: string;
  position: 'bottom-right' | 'bottom-left' | 'bottom-center';
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  triggerText: string;
  allowedDomains: string[];
  rateLimitPerMinute: number;
  enableVoice: boolean;
  enableFileUpload: boolean;
  maxHistoryLength: number;
  showTypingIndicator: boolean;
  enableFeedback: boolean;
  customCSS?: string;
}

export interface ChatbotStats {
  totalConversations: number;
  totalMessages: number;
  averageSessionLength: number;
  topQuestions: Array<{ question: string; count: number }>;
  userSatisfaction: number;
  responseTime: number;
}

interface ChatbotContextType {
  // Configuration
  config: ChatbotConfig;
  updateConfig: (updates: Partial<ChatbotConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;

  // Chat State
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  
  // Messages
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  deleteMessage: (id: string) => void;
  
  // Chat Functions
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  regenerateResponse: (messageId: string) => Promise<void>;
  
  // Voice Features
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  
  // Statistics
  stats: ChatbotStats;
  exportChat: () => Promise<Blob>;
  
  // API Keys
  apiKey: string;
  setApiKey: (key: string) => void;
  
  // State
  isLoading: boolean;
  error: string | null;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  // Configuration par défaut
  const [config, setConfig] = useState<ChatbotConfig>({
    enabled: true,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: 'Tu es un assistant virtuel intelligent et serviable. Réponds de manière claire, précise et professionnelle.',
    welcomeMessage: '👋 Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?',
    placeholder: 'Posez votre question...',
    position: 'bottom-right',
    theme: 'auto',
    primaryColor: '#4F46E5',
    triggerText: '💬 Discuter',
    allowedDomains: [],
    rateLimitPerMinute: 10,
    enableVoice: true,
    enableFileUpload: true,
    maxHistoryLength: 50,
    showTypingIndicator: true,
    enableFeedback: true
  });

  // États du chat
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Statistiques
  const [stats, setStats] = useState<ChatbotStats>({
    totalConversations: 23,
    totalMessages: 156,
    averageSessionLength: 4.2,
    topQuestions: [
      { question: 'Comment puis-je réinitialiser mon mot de passe ?', count: 15 },
      { question: 'Quels sont vos tarifs ?', count: 12 },
      { question: 'Comment contacter le support ?', count: 8 },
      { question: 'Où trouver la documentation ?', count: 6 }
    ],
    userSatisfaction: 4.3,
    responseTime: 1.2
  });

  // Initialisation avec message de bienvenue
  useEffect(() => {
    if (messages.length === 0 && config.welcomeMessage) {
      addMessage({
        content: config.welcomeMessage,
        role: 'assistant'
      });
    }
  }, [config.welcomeMessage]);

  // Fonctions de configuration
  const updateConfig = async (updates: Partial<ChatbotConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetConfig = async () => {
    setConfig({
      enabled: true,
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: 'Tu es un assistant virtuel intelligent et serviable.',
      welcomeMessage: '👋 Bonjour ! Comment puis-je vous aider ?',
      placeholder: 'Posez votre question...',
      position: 'bottom-right',
      theme: 'auto',
      primaryColor: '#4F46E5',
      triggerText: '💬 Discuter',
      allowedDomains: [],
      rateLimitPerMinute: 10,
      enableVoice: true,
      enableFileUpload: true,
      maxHistoryLength: 50,
      showTypingIndicator: true,
      enableFeedback: true
    });
  };

  // Fonctions de messages
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString() + Math.random(),
      timestamp: new Date()
    };
    
    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Limiter l'historique
      if (updated.length > config.maxHistoryLength) {
        return updated.slice(-config.maxHistoryLength);
      }
      return updated;
    });
  };

  const clearMessages = () => {
    setMessages([]);
    // Rajouter le message de bienvenue
    if (config.welcomeMessage) {
      addMessage({
        content: config.welcomeMessage,
        role: 'assistant'
      });
    }
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  // Simulation d'envoi de message
  const sendMessage = async (content: string, files?: File[]) => {
    if (!content.trim()) return;

    setError(null);
    setIsLoading(true);

    // Ajouter le message utilisateur
    addMessage({
      content,
      role: 'user'
    });

    // Simulation de réponse avec typing indicator
    if (config.showTypingIndicator) {
      setIsTyping(true);
    }

    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Réponses simulées
      const responses = [
        "Je comprends votre question. Voici quelques informations qui pourraient vous aider...",
        "C'est une excellente question ! Laissez-moi vous expliquer...",
        "Basé sur les informations dont je dispose, je peux vous dire que...",
        "Voici ce que je peux vous recommander dans ce cas...",
        "Je vais vous donner les détails sur ce sujet...",
        "Pour répondre à votre demande, voici les étapes à suivre...",
        "Permettez-moi de clarifier ce point pour vous...",
        "Voici une solution qui pourrait fonctionner pour votre situation..."
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      addMessage({
        content: randomResponse,
        role: 'assistant',
        metadata: {
          model: config.model,
          temperature: config.temperature,
          tokens: Math.floor(Math.random() * 200) + 50
        }
      });

      // Mettre à jour les stats
      setStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 2 // user + assistant
      }));

    } catch (err) {
      setError('Erreur lors de l\'envoi du message. Veuillez réessayer.');
      console.error('Erreur chatbot:', err);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    setIsLoading(true);
    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newResponse = "Voici une réponse alternative à votre question...";
      
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: newResponse,
        timestamp: new Date()
      };
      
      setMessages(updatedMessages);
    } catch (err) {
      setError('Erreur lors de la régénération');
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  // Fonctions vocales (simulation)
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      setIsListening(true);
      // Simulation de reconnaissance vocale
      setTimeout(() => {
        setIsListening(false);
        // addMessage({ content: 'Message vocal transcrit', role: 'user' });
      }, 3000);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // Export du chat
  const exportChat = async () => {
    const chatData = {
      messages,
      config,
      stats,
      exportDate: new Date().toISOString()
    };
    
    const jsonData = JSON.stringify(chatData, null, 2);
    return new Blob([jsonData], { type: 'application/json' });
  };

  const value: ChatbotContextType = {
    // Configuration
    config,
    updateConfig,
    resetConfig,

    // Chat State
    isOpen,
    setIsOpen,
    isTyping,
    setIsTyping,

    // Messages
    messages,
    addMessage,
    clearMessages,
    deleteMessage,

    // Chat Functions
    sendMessage,
    regenerateResponse,

    // Voice
    isListening,
    startListening,
    stopListening,
    speak,

    // Statistics
    stats,
    exportChat,

    // API
    apiKey,
    setApiKey,

    // State
    isLoading,
    error
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}