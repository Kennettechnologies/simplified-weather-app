import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Send, Bot, User, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface WeatherAssistantProps {
  weatherData?: any;
  className?: string;
}

export const WeatherAssistant: React.FC<WeatherAssistantProps> = ({ 
  weatherData, 
  className = "" 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! I'm your weather assistant. I can help you understand current weather conditions, give advice on what to wear, suggest activities, and answer any weather-related questions. How can I help you today?`,
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/weather-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message,
          weatherData: weatherData 
        })
      });

      if (!response.ok) {
        throw new Error('Weather assistant API request failed');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Assistant error:', error);
      
      // Fallback response if API fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I'm having trouble connecting to my weather analysis service right now. However, based on the current weather data I can see: ${weatherData ? `It's ${weatherData.temperature}°C with ${weatherData.description} in ${weatherData.location}. The humidity is ${weatherData.humidity}% and wind speed is ${weatherData.windSpeed} m/s.` : 'Please load weather data first so I can help you better.'}`,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackMessage]);
      
      toast({
        title: 'Connection Issue',
        description: 'Using offline weather analysis. Some features may be limited.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: 'Voice Recognition Error',
          description: 'Could not recognize speech. Please try again.',
          variant: 'destructive'
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: 'Not Supported',
        description: 'Voice input is not supported in your browser',
        variant: 'destructive'
      });
    }
  };

  const quickQuestions = [
    "What should I wear today?",
    "Is it good weather for outdoor activities?",
    "Should I bring an umbrella?",
    "What's the air quality like?",
    "When will it rain?",
    "Is it safe to drive?"
  ];

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-primary/10 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          Weather Assistant
          <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea className="h-64 w-full rounded-lg border bg-muted/20 p-3">
          <div className="space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex gap-2 animate-fade-in ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground ml-8' 
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.slice(0, 3).map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(question)}
                disabled={isLoading}
                className="text-xs h-auto py-1 px-2"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about the weather..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startVoiceInput}
            disabled={isLoading || isListening}
            className="px-3"
          >
            <Mic className={`w-4 h-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
          </Button>
          <Button type="submit" disabled={isLoading || !inputMessage.trim()} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeatherAssistant;