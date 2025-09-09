import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from '@/contexts/ChatbotContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Download,
  RotateCcw,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Minimize2,
  Maximize2,
  Loader2
} from 'lucide-react';

export function Chatbot() {
  const { 
    config, 
    isOpen, 
    setIsOpen, 
    messages, 
    sendMessage, 
    clearMessages, 
    regenerateResponse,
    isTyping,
    isListening,
    startListening,
    stopListening,
    speak,
    exportChat,
    isLoading 
  } = useChatbot();
  
  const { config: appearanceConfig } = useAppearance();
  const theme = appearanceConfig.layout.theme;
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 20, y: 20 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!config.enabled) return null;

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    if (config.enableFileUpload) {
      fileInputRef.current?.click();
    }
  };

  const handleExportChat = async () => {
    const blob = await exportChat();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Position du chatbot
  const position = config.position;
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  // Bouton déclencheur
  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
          style={{ backgroundColor: config.primaryColor }}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Card className={`w-80 h-96 flex flex-col shadow-xl ${isMinimized ? 'h-14' : 'h-96'}`}>
        {/* Header */}
        <CardHeader className="p-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.primaryColor }}
              />
              <h3 className="font-semibold text-sm">Assistant IA</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportChat}
                className="h-6 w-6 p-0"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'text-white'
                        : 'bg-muted'
                    }`}
                    style={message.role === 'user' ? { backgroundColor: config.primaryColor } : {}}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speak(message.content)}
                            className="h-4 w-4 p-0 opacity-70 hover:opacity-100"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => regenerateResponse(message.id)}
                            className="h-4 w-4 p-0 opacity-70 hover:opacity-100"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Indicateur de frappe */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted p-2 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">En train d'écrire...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="p-3 border-t flex-shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={config.placeholder}
                    className="min-h-[40px] max-h-24 resize-none"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  {config.enableFileUpload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFileUpload}
                      className="h-8 w-8 p-0"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {config.enableVoice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={isListening ? stopListening : startListening}
                      className={`h-8 w-8 p-0 ${isListening ? 'text-red-500' : ''}`}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                    className="h-8 w-8 p-0"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearMessages}
                    className="text-xs h-6"
                  >
                    Nouveau chat
                  </Button>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {messages.filter(m => m.role === 'user').length} messages
                </Badge>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Input de fichier caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          // Gérer l'upload de fichiers
          console.log('Fichiers sélectionnés:', e.target.files);
        }}
      />
    </div>
  );
}