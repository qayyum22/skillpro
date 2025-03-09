"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MinusCircle, MessageCircle, Info, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/hooks/useAuth';
import { usePathname } from 'next/navigation';

type Message = {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hi there! I'm your AI assistant. How can I help you today?",
    sender: 'bot',
    timestamp: new Date(),
  }
];

const SupportBot: React.FC = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [issue, setIssue] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [chatSize, setChatSize] = useState({ width: 320, height: 480 });
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  
  // Ensure component is mounted only on client-side to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Reset the chat state when navigating between routes
  useEffect(() => {
    // Optional: close the chat when changing routes
    // setIsOpen(false);
    setShowEmailForm(false);
  }, [pathname]);
  
  // Auto-fill user email if authenticated
  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };
  
  const minimizeChat = () => {
    setIsMinimized(!isMinimized);
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Handle resizing functionality
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (!isResizing) return;
      
      // Set minimum sizes to ensure usability
      const minWidth = 280;
      const minHeight = 400;
      
      if (chatRef.current) {
        const rect = chatRef.current.getBoundingClientRect();
        const newWidth = Math.max(minWidth, e.clientX - rect.left);
        const newHeight = Math.max(minHeight, e.clientY - rect.top);
        
        setChatSize({
          width: newWidth,
          height: newHeight
        });
      }
    };

    const stopResize = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', stopResize);
    }

    return () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    
    // Process the user message
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Would you like me to create a support ticket for this issue? A member of our team will get back to you via email.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setShowEmailForm(true);
      
      // Auto-fill user name if available
      if (user && user.displayName) {
        setName(user.displayName);
      }
    }, 1000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Extract the conversation history
      const conversationHistory = messages
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Bot'}: ${msg.text}`)
        .join('\n');
      
      // Send the support request using server action or API route
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          issue,
          message: conversationHistory,
          targetEmail: 'ailabs.2208@gmail.com',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit support request');
      }
      
      // Add confirmation message
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        text: `Thanks, ${name}! Your support request has been submitted. We'll get back to you at ${email} as soon as possible.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, confirmationMessage]);
      setShowEmailForm(false);
      toast.success('Support request submitted successfully!');
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast.error('Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChatSize = () => {
    if (chatSize.width === 320) {
      setChatSize({ width: 400, height: 600 });
    } else {
      setChatSize({ width: 320, height: 480 });
    }
  };
  
  return mounted ? (
    <div className="supportbot-container" style={{ position: 'fixed', zIndex: 9999 }}>
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 flex items-center justify-center"
        aria-label="Support Chat"
        style={{ zIndex: 9999 }}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div 
          ref={chatRef}
          style={{ 
            width: isMinimized ? 'auto' : `${chatSize.width}px`, 
            height: isMinimized ? 'auto' : `${chatSize.height}px`,
            resize: isMinimized ? 'none' : 'both',
            zIndex: 9998
          }}
          className={`fixed bottom-20 right-4 bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
            isMinimized ? 'h-14' : ''
          }`}
        >
          {/* Chat header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center cursor-move">
            <div className="flex items-center">
              <Bot size={20} className="mr-2" />
              <span className="font-medium">Support Assistant</span>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={toggleChatSize} className="text-white hover:text-blue-200">
                {chatSize.width === 320 ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={minimizeChat}>
                <MinusCircle size={18} />
              </button>
              <button onClick={toggleChat}>
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Resize handle */}
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50"
            onMouseDown={startResize}
            style={{
              backgroundImage: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)',
              display: isMinimized ? 'none' : 'block'
            }}
          />
          
          {/* Chat body */}
          {!isMinimized && (
            <>
              <div className="p-3 overflow-y-auto bg-gray-50" style={{ height: `calc(${chatSize.height}px - 120px)` }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-3 ${
                      message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block rounded-lg py-2 px-3 max-w-[80%] ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {message.text}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                {showEmailForm && (
                  <div className="border border-blue-200 rounded-lg p-3 bg-blue-50 mt-4">
                    <form onSubmit={handleSubmitTicket}>
                      <h4 className="font-semibold text-sm mb-2 flex items-center">
                        <Info size={16} className="mr-1 text-blue-500" />
                        Submit support request
                      </h4>
                      <div className="mb-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded"
                          required
                        />
                        <input
                          type="email"
                          placeholder="Your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded"
                          required
                        />
                        <textarea
                          placeholder="Describe your issue in detail"
                          value={issue}
                          onChange={(e) => setIssue(e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
                          rows={3}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-1.5 px-3 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-70"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                      </button>
                    </form>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Chat input */}
              <div className="p-3 border-t">
                <div className="flex">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={showEmailForm}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || showEmailForm}
                    className="bg-blue-600 text-white p-2 rounded-r-lg disabled:bg-gray-400"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  ) : null;
};

export default SupportBot; 