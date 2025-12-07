import React, { useState, useEffect, useRef } from 'react';
import { Message, Role } from './types';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import { sendMessageStream, resetChat } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: 'init-1',
        role: Role.MODEL,
        text: "Hello! I'm Gemini. How can I help you today?",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // 2. Prepare Placeholder for Bot Message
    const botMsgId = (Date.now() + 1).toString();
    const botMsgPlaceholder: Message = {
      id: botMsgId,
      role: Role.MODEL,
      text: '', // Start empty
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, botMsgPlaceholder]);

    try {
      // 3. Stream Response
      let fullText = '';
      
      await sendMessageStream(text, (chunkText) => {
        fullText += chunkText;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, text: fullText } : msg
          )
        );
      });

    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? { ...msg, text: "I'm sorry, I encountered an error. Please try again.", isError: true }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    resetChat();
    setMessages([
      {
        id: Date.now().toString(),
        role: Role.MODEL,
        text: "Conversation cleared. How can I help you now?",
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                ✨
            </div>
            <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Gemini Chat</h1>
        </div>
        <button 
            onClick={handleReset}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors"
        >
            New Chat
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-0">
        <div className="max-w-3xl mx-auto flex flex-col min-h-full">
            <div className="flex-1">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} className="h-4" />
            </div>
        </div>
      </main>

      {/* Input Area */}
      <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
