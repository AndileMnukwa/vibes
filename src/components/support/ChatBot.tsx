
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
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <Button
          onClick={toggleChat}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-purple-600 hover:bg-purple-700"
        >
          {isChatOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-[60] w-96 max-w-[calc(100vw-3rem)] md:max-w-96">
          <Card className="shadow-2xl border-0 overflow-hidden max-h-[calc(100vh-12rem)] flex flex-col">
            <CardHeader className="bg-purple-600 text-white p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  VibeCatcher Support
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-white hover:bg-purple-700 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleChat}
                    className="text-white hover:bg-purple-700 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-purple-100">
                Get instant help with events, tickets, and more
              </p>
            </CardHeader>
            
            <CardContent className="p-0 flex flex-col flex-1 min-h-0">
              <ScrollArea className="flex-1 p-4 max-h-[calc(100vh-20rem)] min-h-[300px]">
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
                          "text-xs",
                          message.isBot 
                            ? "bg-purple-100 text-purple-600" 
                            : "bg-blue-100 text-blue-600"
                        )}>
                          {message.isBot ? 'AI' : 'You'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={cn(
                        "flex-1 max-w-[80%]",
                        !message.isBot && "text-right"
                      )}>
                        <div className={cn(
                          "rounded-lg px-3 py-2 text-sm break-words",
                          message.isBot
                            ? "bg-gray-100 text-gray-800"
                            : "bg-purple-600 text-white"
                        )}>
                          {message.content}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <div className="border-t p-4 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-purple-600 hover:bg-purple-700 flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-2 text-center">
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
