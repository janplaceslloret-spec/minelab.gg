import React, { useState } from 'react';
import { Bot, Send, Sparkles, Zap } from 'lucide-react';

const AIAssistantSidebar = ({ activeServer, user }) => {
  const [inputStr, setInputStr] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef(null);
  
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `¡Hola! Soy tu asistente de IA de MineLab. ¿En qué puedo ayudarte a gestionar el servidor "${activeServer?.server_name || 'actual'}" hoy?` }
  ]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e, forcedText = null) => {
    if (e) e.preventDefault();
    
    const textToSend = forcedText || inputStr.trim();
    if (!textToSend || isTyping || !activeServer?.id) return;

    setInputStr('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsTyping(true);

    try {
      const response = await fetch('https://snack55-n8n1.q7pa8v.easypanel.host/webhook/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          server_id: activeServer.id
        })
      });

      if (!response.ok) throw new Error("Webhook failure");
      const data = await response.json();

      const assistantText = data.response || data.output || data.message || data.reply || "He procesado tu solicitud.";
      setMessages(prev => [...prev, { role: 'assistant', text: assistantText }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'assistant', text: "Lo siento, ha ocurrido un error de conexión con la IA. Inténtalo de nuevo." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    'Instalar mod', 
    'Arreglar error', 
    'Optimizar servidor', 
    'Cambiar versión'
  ];

  return (
    <aside className="w-[350px] bg-[#141414] border-l border-white/5 h-screen sticky top-0 flex flex-col z-20 shrink-0 hidden lg:flex shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 bg-[#141414] shadow-[0_5px_20px_rgba(0,0,0,0.2)] flex flex-col gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center border border-[#22C55E]/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <Bot size={16} className="text-[#22C55E]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#FFFFFF] tracking-wide flex items-center gap-1.5">
              ASISTENTE IA <Sparkles size={12} className="text-[#22C55E] opacity-80"/>
            </h3>
            <p className="text-[10px] text-[#22C55E] font-medium uppercase tracking-widest flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block shadow-[0_0_8px_#22C55E] shrink-0"></span> ONLINE
            </p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
           {quickActions.map((action, i) => (
              <button 
                key={i} 
                onClick={() => handleSendMessage(null, action)}
                disabled={isTyping}
                className="px-2.5 py-1.5 bg-[#171717] border border-white/5 hover:border-[#22C55E]/30 hover:bg-[rgba(34,197,94,0.05)] rounded-lg text-xs font-medium text-[#B3B3B3] hover:text-[#FFFFFF] transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Zap size={10} className="text-[#22C55E]" /> {action}
              </button>
           ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'user' ? (
              <div className="max-w-[85%] bg-[#22C55E] text-[#0B0B0B] font-semibold px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm whitespace-pre-wrap">
                {msg.text}
              </div>
            ) : (
              <div className="max-w-[90%] bg-[#171717] border border-[#2A2A2A] text-[#E5E5E5] px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-md text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#171717] border border-[#2A2A2A] px-4 py-4 rounded-2xl rounded-tl-none shadow-md">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#2A2A2A] bg-[#141414]">
        <form className="relative flex items-center group" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            placeholder="Pregúntale a la IA..." 
            className="w-full bg-[#0B0B0B] border border-[#2A2A2A] rounded-xl py-3.5 pl-4 pr-12 text-sm text-[#FFFFFF] transition-all focus:outline-none focus:border-[#22C55E]/50 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)] placeholder-[#6B6B6B] disabled:opacity-50"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={isTyping || !inputStr.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#22C55E] hover:bg-[#1faa50] text-[#0B0B0B] w-8 h-8 rounded-lg transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
          >
            <Send size={14} className="ml-[-2px] mt-[1px]" />
          </button>
        </form>
      </div>

    </aside>
  );
};

export default AIAssistantSidebar;
