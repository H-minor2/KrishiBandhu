'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Bot, User, Send, ArrowLeft } from 'lucide-react';
import '../../globals.css';

export default function ChatBotPage() {
  const params = useParams();
  const cropId = params.cropId as string;
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Namaste! I am Krishi AI, your virtual agricultural assistant. I see you are consulting about your recorded crop. How can I assist you with farming practices, pest control, or weather forecasts today?",
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages([...messages, newMsg]);
    setInput('');
    
    // Simulate AI response for the mockup UI
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'ai',
        text: "This is a simulated response. Once the AI backend is connected, I will provide tailored agricultural advice based on this crop's data!"
      }]);
    }, 1000);
  };

  return (
    <main className="min-h-screen m-0 p-0 font-[Arial,Verdana,sans-serif] bg-slate-50 text-black flex flex-col h-screen">
      
      {/* Navbar (matching government theme) */}
      <nav className="w-full bg-[#003366] text-white p-4 border-b border-black flex flex-wrap gap-4 justify-between items-center rounded-none shadow-none shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-12 h-12 bg-white flex items-center justify-center text-[#003366] border border-black font-bold no-underline">
            SEAL
          </Link>
          <div>
            <h1 className="m-0 text-xl font-bold tracking-tight">Krishi Bandhu</h1>
            <p className="m-0 text-xs text-gray-300 font-bold uppercase tracking-widest mt-1">Government of India</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href="/dashboard" 
            className="bg-white text-[#003366] border border-black px-4 py-2 font-bold flex items-center gap-2 cursor-pointer outline-none hover:bg-gray-200 no-underline text-sm rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Chat Area */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col p-4 sm:p-6 overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-white border-2 border-black p-4 mb-4 rounded-xl flex items-center gap-3 shrink-0">
          <div className="bg-[#003366] p-2 rounded-full">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Krishi AI Assistant</h2>
            <p className="text-sm text-gray-600 font-medium">Consulting for Crop Record #{cropId}</p>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-white border-2 border-black rounded-xl p-4 overflow-y-auto flex flex-col gap-4 mb-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-end gap-2 max-w-[80%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              <div className={`shrink-0 p-2 rounded-full border-2 border-black ${msg.sender === 'user' ? 'bg-amber-100' : 'bg-[#003366]'}`}>
                {msg.sender === 'user' ? <User className="w-5 h-5 text-black" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div 
                className={`p-3 border-2 border-black text-sm font-medium ${
                  msg.sender === 'user' 
                    ? 'bg-amber-50 rounded-2xl rounded-br-sm' 
                    : 'bg-slate-100 rounded-2xl rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="bg-white border-2 border-black rounded-xl p-3 flex gap-3 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Krishi AI about fertilizers, weather, or crop health..."
            className="flex-1 bg-slate-50 border border-black rounded-lg px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#003366]"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-[#003366] text-white px-6 py-3 font-bold border border-black rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Send <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </main>
  );
}
