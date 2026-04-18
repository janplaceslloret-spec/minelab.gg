import React, { useState, useEffect, useRef } from 'react';

const ConsoleView = ({ server }) => {
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [wsStatus, setWsStatus] = useState('disconnected'); // connecting, connected, disconnected
  const [commandInput, setCommandInput] = useState('');
  
  const socketRef = useRef(null);
  const consoleEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectConsole = () => {
    if (!server || socketRef.current?.readyState === WebSocket.OPEN) return;

    setWsStatus('connecting');
    const wsUrl = `wss://console.fluxoai.co/?server=${server.id}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setWsStatus('connected');
    };

    socket.onmessage = (event) => {
      const raw = event.data;
      if (raw.startsWith('[HISTORY]\n')) {
        const lines = raw.slice('[HISTORY]\n'.length).split('\n').filter(Boolean);
        setConsoleLogs(lines);
      } else {
        const lines = raw.split('\n').filter(Boolean);
        setConsoleLogs(prev => [...prev, ...lines]);
      }
    };

    socket.onclose = () => {
      setWsStatus('disconnected');
      setConsoleLogs(prev => [...prev, '>>> Conexión cerrada. Reintentando en 8s...']);
      reconnectTimeoutRef.current = setTimeout(connectConsole, 8000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setWsStatus('disconnected');
    };

    socketRef.current = socket;
  };

  useEffect(() => {
    if (server?.status_server === 'running') {
      connectConsole();
    } else {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConsoleLogs([]);
    }
    
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [server?.status_server]);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  const handleSendCommand = (e) => {
    e.preventDefault();
    if (!commandInput.trim() || wsStatus !== 'connected') return;

    if (socketRef.current) {
      socketRef.current.send(commandInput);
      setConsoleLogs(prev => [...prev, `> ${commandInput}`]);
      setCommandInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
          Terminal en Vivo
          <span className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : wsStatus === 'connecting' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
        </h3>
        <span className="text-[10px] text-zinc-600 font-mono">{wsStatus.toUpperCase()}</span>
      </div>
      
      <div className="flex-1 min-h-[500px] bg-[#0B0B0B] rounded-xl border border-[#2A2A2A] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed text-[#B3B3B3] scrollbar-thin scrollbar-thumb-zinc-800">
          {server?.status_server === 'running' ? (
              consoleLogs.length === 0 ? (
                <div className="text-zinc-700 italic flex h-full items-center justify-center">Esperando datos del servidor...</div>
              ) : (
                consoleLogs.map((log, i) => (
                  <div key={i} className="mb-1 text-zinc-300 break-all whitespace-pre-wrap">{log}</div>
                ))
              )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-center p-8">
              Consola desactivada. El servidor debe estar iniciado (Start).
            </div>
          )}
          <div ref={consoleEndRef} />
        </div>
        
        <form onSubmit={handleSendCommand} className="border-t border-[#2A2A2A] flex bg-[#121212] shrink-0">
          <span className="flex items-center pl-4 text-[#22C55E] font-mono text-sm">/</span>
          <input 
            type="text" 
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            disabled={server?.status_server !== 'running' || wsStatus !== 'connected'}
            placeholder={server?.status_server === 'running' ? "Comando..." : "Cerrado"}
            className="flex-1 bg-transparent border-none text-zinc-100 px-3 py-4 text-sm font-mono focus:ring-0 placeholder:text-zinc-700 disabled:opacity-50 outline-none"
          />
          <button 
            type="submit"
            disabled={server?.status_server !== 'running' || wsStatus !== 'connected'}
            className="px-6 text-[#22C55E] hover:text-white transition-colors disabled:opacity-50 font-bold text-sm bg-black/20"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsoleView;
