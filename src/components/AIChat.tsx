
import React, { useState, useRef, useEffect } from 'react';
import { analyzeData } from '../services/geminiService';
import { Transaction, ProductStock } from '../types';
import { MessageSquare } from './Icons';

interface AIChatProps {
  transactions: Transaction[];
  stocks: ProductStock[];
}

const AIChat: React.FC<AIChatProps> = ({ transactions, stocks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'ai' }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await analyzeData(transactions, stocks, userMsg);
      setMessages(prev => [...prev, { text: response || "No pude generar respuesta", sender: 'ai' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Error de conexión con la IA.", sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 border border-slate-200 overflow-hidden flex flex-col max-h-[500px]">
          <div className="bg-indigo-600 p-4 text-white font-bold flex justify-between items-center">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Asistente LaserBeam
            </span>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded">✕</button>
          </div>
          
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[300px]">
            {messages.length === 0 && (
              <p className="text-slate-400 text-sm italic text-center">Pregúntame algo sobre tus ventas o stock...</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.sender === 'user' 
                    ? 'bg-indigo-100 text-indigo-900 rounded-tr-none' 
                    : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none border border-slate-200">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ej: ¿Qué tal las ventas de hoy?"
              className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default AIChat;
