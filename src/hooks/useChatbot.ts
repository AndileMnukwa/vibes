
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your VibeCatcher support assistant. I can help you with finding events, buying tickets, leaving reviews, and more. What can I help you with today?",
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare chat history (last 6 messages for context)
      const chatHistory = messages.slice(-6).map(msg => ({
        content: msg.content,
        isBot: msg.isBot
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat-support', {
        body: { message: content, chatHistory }
      });

      if (error) throw error;

      // Add bot response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment or contact our support team directly.",
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Chat Error',
        description: 'Unable to connect to support chat. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: "Hi! I'm your VibeCatcher support assistant. I can help you with finding events, buying tickets, leaving reviews, and more. What can I help you with today?",
        isBot: true,
        timestamp: new Date(),
      }
    ]);
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  return {
    messages,
    isLoading,
    isChatOpen,
    sendMessage,
    clearChat,
    toggleChat,
  };
};
