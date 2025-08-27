import React from 'react';
import { Chatbot } from '@/components/Chatbot';
import { useChatbot } from '@/contexts/ChatbotContext';

export function ChatbotWidget() {
  const { config } = useChatbot();
  
  // Ne s'affiche que si le chatbot est activé et que nous ne sommes pas dans l'admin
  if (!config.enabled || window.location.pathname.startsWith('/admin')) {
    return null;
  }

  return <Chatbot />;
}