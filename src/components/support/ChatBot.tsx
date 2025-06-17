
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, X, Send, Trash2 } from 'lucide-react';
import { useChatbot } from '@/hooks/useChatbot';
import { cn } from '@/lib/utils';

export const ChatBot = () => {
  const { messages, isLoading, isChatOpen, sendMessage, clearChat, toggleChat } = useChatbot();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chat Toggle Button - Fixed z-index and positioning */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <Button
          onClick={toggleChat}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-coral hover:bg-coral-dark animate-coral-pulse"
        >
          {isChatOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Chat Window - Enhanced z-index and better positioning */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-[55] w-96 max-w-[calc(100vw-3rem)] md:max-w-96">
          <Card className="shadow-2xl border-0 overflow-hidden bg-card backdrop-blur-sm">
            <CardHeader className="bg-coral-gradient text-white p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  VibeCatcher Support
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleChat}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-white/90">
                Get instant help with events, tickets, and more
              </p>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        !message.isBot && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                        <AvatarFallback className={cn(
                          "text-xs font-medium",
                          message.isBot 
                            ? "bg-coral/10 text-coral border border-coral/20" 
                            : "bg-navy/10 text-navy border border-navy/20"
                        )}>
                          {message.isBot ? 'AI' : 'You'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={cn(
                        "flex-1 max-w-[80%]",
                        !message.isBot && "text-right"
                      )}>
                        <div className={cn(
                          "rounded-lg px-3 py-2 text-sm",
                          message.isBot
                            ? "bg-muted text-foreground border border-border/50"
                            : "bg-coral-gradient text-white shadow-sm"
                        )}>
                          {message.content}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-coral/10 text-coral border border-coral/20 text-xs">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg px-3 py-2 border border-border/50">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-coral rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-coral rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-coral rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <div className="border-t border-border p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 focus:ring-coral focus:border-coral"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-coral hover:bg-coral-dark transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Powered by AI • For complex issues, contact human support
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
