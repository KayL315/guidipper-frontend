import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatSession, SendMessageRequest, ApplyDiffRequest } from '../types/chat';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

interface PendingDiff {
  messageId: number;
  diffContent: string;
  chatMessage: string;
}

interface ChatBoxProps {
  session: ChatSession | null;
  onSessionUpdate: (session: ChatSession | null) => void;
  routeText: string;
  onRouteUpdate: (newRouteText: string) => void;
  generatedRouteId: number | null;
  pendingDiff: PendingDiff | null;
  setPendingDiff: (diff: PendingDiff | null) => void;
}


function ChatBox({ session, onSessionUpdate, routeText, onRouteUpdate, generatedRouteId, pendingDiff, setPendingDiff }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('auth_token');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (session) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [session]);

  const loadMessages = async () => {
    if (!session) return;

    try {
      const response = await axios.get<ChatMessage[]>(
        `${API}/chat/sessions/${session.id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const createSession = async () => {
    try {
      const response = await axios.post<ChatSession>(
        `${API}/chat/sessions`,
        { generated_route_id: generatedRouteId, route_text: routeText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onSessionUpdate(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to create session:', err);
      throw err;
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const currentSession = session || await createSession();
    if (!currentSession) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post<ChatMessage>(
        `${API}/chat/sessions/${currentSession.id}/messages`,
        { content: userMessage, route_text: routeText } as SendMessageRequest,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages(prev => [...prev, response.data]);

      if (response.data.diff_content) {
        setPendingDiff({
          messageId: response.data.id,
          diffContent: response.data.diff_content,
          chatMessage: response.data.content,
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!session) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Chat with AI Assistant</h3>
        <p className="text-gray-600 mb-4">
          Start a conversation to modify your tour plan. Ask questions or request changes!
        </p>
        <button
          onClick={createSession}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Start Chat
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Chat with AI Assistant</h3>

      <div className="border border-gray-200 rounded-lg h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet. Ask me anything about your tour plan!</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  {msg.diff_content && msg.role === 'assistant' && (
                    <div className="mt-2 text-xs text-gray-600">
                      This message includes proposed changes to your tour plan.
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>


        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
