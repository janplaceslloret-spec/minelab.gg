import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, Check, Send, Terminal, FolderOpen, Package, Settings, Server as ServerIcon, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const AIFeature = () => {
  const sectionRef = useRef(null);
  const chatBottomRef = useRef(null);

  const [activeTab, setActiveTab] = useState('Servidores');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { 
      id: 1, 
      type: 'user', 
      text: 'Instálame Vault y EssentialsX con economía base de 500 monedas.' 
    },
    { 
      id: 2, 
      type: 'bot', 
      text: 'Ejecutando configuración automática:', 
      details: [
        'Descargando Vault v1.7.3', 
        'Descargando EssentialsX v2.20.1', 
        'Editando config.yml', 
        'Reiniciando servidor...'
      ]
    }
  ]);

  // Scroll logic for chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg = { id: Date.now(), type: 'user', text: inputValue };
    setChatMessages(prev => [...prev, newUserMsg]);
    const command = inputValue.toLowerCase();
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let botResponse;

      if (command.includes('instala') || command.includes('modpack') || command.includes('plugin')) {
        botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Iniciando proceso de instalación:',
          details: ['Buscando versión compatible...', 'Resolviendo dependencias...', 'Instalación completada correctamente.']
        };
      } else if (command.includes('reinicia') || command.includes('restart')) {
        botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Orden de reinicio recibida. Procediendo:',
          details: ['Guardando mundo y datos de jugadores...', 'Deteniendo proceso del servidor...', 'Iniciando servidor...', 'Servidor online.']
        };
      } else if (command.includes('abre') || command.includes('archivo')) {
        botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          text: 'He localizado los archivos. Puedes verlos en la pestaña Archivos:',
          details: ['Navegando al directorio principal...', 'Abriendo gestor de archivos.']
        };
        setActiveTab('Archivos');
      } else {
        botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          text: 'He procesado tu instrucción. Aplicando cambios:',
          details: ['Analizando parámetros...', 'Actualizando configuración del servidor.', 'Cambios aplicados con éxito.']
        };
      }
      setChatMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Servidores':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-[#111827] border border-white/5 rounded-xl p-6 mb-6 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-blue to-accent-green"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                    Survival SMP
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                    </span>
                  </h3>
                  <p className="text-white/50 text-sm mt-1">Paper 1.20.4 • 192.168.1.104:25565</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('Consola')} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                    Abrir consola
                  </button>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                    Reiniciar servidor
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                    <span>RAM Usada</span>
                    <span className="text-white/80">3.2 / 6GB</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-blue w-[53%] rounded-full relative">
                       <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                    <span>Jugadores</span>
                    <span className="text-white/80">3 / 20</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-green w-[15%] rounded-full relative"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mini Console Preview */}
            <div className="flex-1 bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs md:text-sm text-gray-300 overflow-hidden relative shadow-inner mb-24 lg:mb-0">
              <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/80 to-transparent z-10"></div>
              <div className="flex flex-col gap-1.5 h-[150px] justify-end relative z-0 pb-2">
                 <div className="opacity-50">[11:04:20] [Server thread/INFO]: Loading properties</div>
                 <div>[11:04:22] <span className="text-yellow-400">[Server thread/WARN]:</span> **** SERVER IS RUNNING IN OFFLINE/INSECURE MODE!</div>
                 <div>[11:04:31] <span className="text-green-400">[Server thread/INFO]:</span> Done (11.82s)! For help, type "help"</div>
                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-both">[11:05:12] <span className="text-accent-blue">[User Authenticator/INFO]:</span> UUID of player Alex is 4a8b...</div>
                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500 fill-mode-both">[11:05:12] <span className="text-accent-green font-bold">[Server thread/INFO]:</span> Alex joined the game</div>
                 <div className="w-2 h-3 bg-white/50 animate-pulse mt-1 inline-block"></div>
              </div>
            </div>
          </div>
        );
      case 'Consola':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full flex flex-col mb-24 lg:mb-0">
            <h3 className="text-xl font-bold text-white mb-4">Consola en Vivo</h3>
            <div className="flex-1 bg-[#090C13] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 overflow-y-auto relative shadow-inner">
               <div className="flex flex-col gap-1.5">
                 <div className="opacity-50">[12:00:01] [Server thread/INFO]: Starting minecraft server version 1.20.4</div>
                 <div className="opacity-50">[12:00:02] [Server thread/INFO]: Loading properties</div>
                 <div>[12:00:03] <span className="text-yellow-400">[Server thread/WARN]:</span> **** SERVER IS RUNNING IN OFFLINE/INSECURE MODE!</div>
                 <div>[12:00:05] [Server thread/INFO]: Preparing level "world"</div>
                 <div>[12:00:06] [Server thread/INFO]: Preparing start region for dimension minecraft:overworld</div>
                 <div>[12:00:08] <span className="text-green-400">[Server thread/INFO]:</span> Done (7.12s)! For help, type "help"</div>
                 <div>[12:05:12] <span className="text-accent-blue">[User Authenticator/INFO]:</span> UUID of player Notch is 069a79f4-44e9-4726-a5be-fca90e38aaf5</div>
                 <div>[12:05:12] <span className="text-accent-green font-bold">[Server thread/INFO]:</span> Notch joined the game</div>
                 <div className="w-2 h-3 bg-white/50 animate-pulse mt-1 inline-block"></div>
               </div>
            </div>
            <div className="mt-4 flex gap-2">
              <input type="text" placeholder="type a command..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-green font-mono" readOnly />
              <button className="px-4 py-2 bg-accent-green text-gray-900 rounded-lg font-bold text-sm">Enviar</button>
            </div>
          </div>
        );
      case 'Archivos':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 mb-24 lg:mb-0">
            <h3 className="text-xl font-bold text-white mb-4">Gestor de Archivos</h3>
            <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-3 border-b border-white/10 text-xs font-bold text-white/40 uppercase tracking-widest bg-white/5">
                <div className="col-span-6">Nombre</div>
                <div className="col-span-3">Tamaño</div>
                <div className="col-span-3">Modificado</div>
              </div>
              <div className="flex flex-col">
                {[
                  { name: 'plugins', type: 'folder', size: '—', date: 'Hoy 12:30' },
                  { name: 'world', type: 'folder', size: '—', date: 'Hoy 11:04' },
                  { name: 'server.properties', type: 'file', size: '1.2 KB', date: 'Ayer 09:15' },
                  { name: 'eula.txt', type: 'file', size: '184 B', date: 'Ayer 09:12' },
                  { name: 'spigot-1.20.4.jar', type: 'file', size: '45.2 MB', date: 'Hace 2 días' },
                ].map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 p-3 border-b border-white/5 text-sm text-gray-300 hover:bg-white/5 transition-colors cursor-pointer items-center">
                    <div className="col-span-6 flex items-center gap-2">
                       {item.type === 'folder' ? <FolderOpen size={16} className="text-accent-blue" /> : <Terminal size={16} className="text-gray-500" />}
                       {item.name}
                    </div>
                    <div className="col-span-3 text-white/40">{item.size}</div>
                    <div className="col-span-3 text-white/40">{item.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'Modpacks':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 mb-24 lg:mb-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Instalador de Modpacks</h3>
              <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white/50">CurseForge / Modrinth</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { name: 'Cobblemon', desc: 'Pokémon in Minecraft!', ver: '1.4.1', color: 'from-red-500/20 to-orange-500/20', border: 'border-orange-500/30' },
                 { name: 'All the Mods 9', desc: 'Does exactly what the name says', ver: '0.2.45', color: 'from-purple-500/20 to-blue-500/20', border: 'border-purple-500/30' },
                 { name: 'RLCraft', desc: 'Real Life Craft - Hardcore', ver: '2.9.3', color: 'from-gray-700/50 to-gray-900/50', border: 'border-gray-500/30' },
                 { name: 'Better MC', desc: 'Minecraft 2.0', ver: 'v24', color: 'from-green-500/20 to-emerald-500/20', border: 'border-emerald-500/30' }
               ].map((mod, i) => (
                 <div key={i} className={`bg-gradient-to-br ${mod.color} border ${mod.border} rounded-xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform cursor-pointer`}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white">{mod.name}</h4>
                      <span className="text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded text-white/70">{mod.ver}</span>
                    </div>
                    <p className="text-xs text-white/60 mb-2">{mod.desc}</p>
                    <button className="mt-auto w-full py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded transition-colors">Instalar con 1 clic</button>
                 </div>
               ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-white/40">
            Contenido de {activeTab}
          </div>
        );
    }
  };

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl flex flex-col items-center">
        
        <div className="text-center mb-16 max-w-3xl">
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Controla todo por <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-violet">Chat Natural</span>
          </h2>
          <p className="text-white/60 text-lg">
            Experimenta el poder de gestionar tu servidor desde un panel interactivo. Prueba escribir un comando en el chat a continuación.
          </p>
        </div>
        
        {/* Dashboard Frame */}
        <div className="w-full max-w-5xl bg-[#090C13] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col z-10">
          
          <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-green/5 pointer-events-none"></div>
          
          {/* Mac-like Header */}
          <div className="px-4 py-3 bg-[#0B0F1A] border-b border-white/5 flex items-center relative z-20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="flex-1 text-center font-medium text-xs text-white/40 tracking-widest pl-6">
              MINELAB PANEL DEMO
            </div>
          </div>
          
          {/* Dashboard Layout */}
          <div className="flex flex-col md:flex-row h-full min-h-[500px]">
             
            {/* Sidebar */}
            <div className="w-full md:w-56 bg-[#0B0F1A]/80 border-r border-white/5 p-4 flex flex-col gap-2 z-10 shrink-0">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 pl-3">General</div>
              
              {[
                { id: 'Servidores', icon: <ServerIcon size={16} /> },
                { id: 'Consola', icon: <Terminal size={16} /> },
                { id: 'Archivos', icon: <FolderOpen size={16} /> },
                { id: 'Modpacks', icon: <Package size={16} /> }
              ].map(tab => (
                <div 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-all ${activeTab === tab.id ? 'bg-accent-green/10 text-accent-green border border-accent-green/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                  {tab.icon}
                  {tab.id}
                  {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse ml-auto"></div>}
                </div>
              ))}
              
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-6 mb-2 pl-3">Sistema</div>
              <div 
                onClick={() => setActiveTab('Ajustes')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-all ${activeTab === 'Ajustes' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              >
                <Settings size={16} />
                Ajustes
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-6 flex flex-col relative z-0 overflow-hidden">
              {renderTabContent()}
            </div>

            {/* AI Assistant Chat Widget */}
            <div 
              className={`chat-widget-container absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-[#111827]/95 backdrop-blur-md border border-accent-green/30 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col z-30 transition-all duration-300 overflow-hidden ${isChatMinimized ? 'rounded-full cursor-pointer hover:border-accent-green/60 w-fit h-[50px] justify-center' : 'rounded-2xl w-[calc(100%-32px)] md:w-[360px] max-h-[500px]'}`}
              onClick={() => isChatMinimized && setIsChatMinimized(false)}
            >
              
              <div className={`px-4 py-3 bg-gradient-to-r from-accent-green/20 to-accent-violet/20 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 ${isChatMinimized ? 'border-b-0 !bg-none bg-[#111827] py-2' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center border border-accent-green/50 shrink-0">
                    <Bot size={16} className="text-accent-green" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">MineLab Assistant</h4>
                    <p className="text-[10px] text-accent-green font-medium uppercase tracking-widest flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-ping inline-block shrink-0"></span> Online
                    </p>
                  </div>
                </div>
                {!isChatMinimized && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsChatMinimized(true); }}
                    className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
                  >
                    <ChevronDown size={18} />
                  </button>
                )}
                {isChatMinimized && (
                  <div className="text-[10px] font-bold text-white/50 bg-white/10 px-3 py-1.5 rounded-full uppercase tracking-widest ml-4 hover:bg-white/20 transition-colors">Abrir</div>
                )}
              </div>

              {!isChatMinimized && (
                <>
                  <div className="p-4 flex flex-col gap-4 text-sm h-[260px] overflow-y-auto scroll-smooth">
                    {chatMessages.map((msg, i) => (
                      <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.type === 'user' ? (
                          <div className="max-w-[85%] bg-accent-green text-gray-900 font-medium p-3 rounded-t-xl rounded-bl-xl rounded-br-sm shadow-md text-sm">
                            {msg.text}
                          </div>
                        ) : (
                          <div className="max-w-[95%] bg-white/5 border border-white/10 text-white/80 p-3.5 rounded-t-xl rounded-br-xl rounded-bl-sm shadow-md relative">
                            <p className="mb-2 text-white/90 font-medium">{msg.text}</p>
                            {msg.details && (
                              <ul className="space-y-2 text-xs mt-3 select-none">
                                {msg.details.map((detail, j) => (
                                  <li key={j} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-500 fill-mode-both" style={{animationDelay: `${j * 500}ms`}}>
                                    {(j === msg.details.length - 1 && typeof detail === 'string' && detail.includes('...')) ? (
                                      <span className="w-3.5 h-3.5 border-2 border-accent-blue border-t-transparent rounded-full animate-spin shrink-0"></span>
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                        <Check size={10} className="text-green-400" />
                                      </div>
                                    )}
                                    <span className={(j === msg.details.length - 1 && detail.includes('...')) ? 'text-accent-blue font-medium' : ''}>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="self-start bg-white/5 border border-white/10 p-3 rounded-t-xl rounded-br-xl rounded-bl-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-200"></span>
                      </div>
                    )}
                    <div ref={chatBottomRef}></div>
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="p-3 bg-black/40 border-t border-white/5 flex gap-2">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ej: instala simple voice chat..." 
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-accent-green/50 placeholder-white/30"
                    />
                    <button 
                      type="submit" 
                      disabled={!inputValue.trim() || isTyping}
                      className="bg-accent-green hover:bg-[#1faa50] disabled:bg-white/10 disabled:text-white/30 text-gray-900 p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </>
              )}
              
            </div>

          </div>
        </div>
        
      </div>
    </section>
  );
};

export default AIFeature;
