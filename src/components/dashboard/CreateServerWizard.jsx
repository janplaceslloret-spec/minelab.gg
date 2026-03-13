import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Send, Cpu, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const CreateServerWizard = ({ user, onFinish }) => {
  const [serverId, setServerId] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  const [inputStr, setInputStr] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: '¡Hola! Soy el asistente IA de MineLab. Puedo ayudarte a configurar tu servidor. ¿Qué tienes en mente?' },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: 'Mi servidor',
    type: 'vanilla',
    version: '1.21.11',
    ram: 6,
    location: 'Europa (Frankfurt)'
  });

  // Initialization: check for 'configuring' server or create one
  useEffect(() => {
    const initServer = async () => {
      if (!user) return;
      try {
        const { data: existingList, error: fetchErr } = await supabase
          .from('mc_servers')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['draft', 'ready', 'paid'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (fetchErr) {
          if (fetchErr.code === 'PGRST303' || fetchErr.message?.includes('JWT') || fetchErr.code === '401') {
             alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
             localStorage.removeItem('minelab-forced-token');
             window.location.href = '/';
             return;
          }
          throw fetchErr;
        }

        if (existingList && existingList.length > 0) {
          const existing = existingList[0];
          setServerId(existing.id);
          setForm({
            name: existing.server_name || 'Mi servidor',
            type: existing.server_type || 'vanilla',
            version: existing.mc_version || '1.21.11',
            ram: existing.ram_gb || 6,
            location: 'Europa (Frankfurt)' // Static for now per reqs
          });
        } else {
          // Create new record with unique name to prevent constraint violations
          const uniqueName = `Mi servidor ${Math.floor(Date.now() / 1000)}`;
          const insertData = {
            user_id: user.id,
            server_name: uniqueName,
            server_type: "vanilla",
            mc_version: "1.21.11",
            ram_gb: 6,
            status: "draft",
            status_server: "offline",
            ready: false,
            mods: false,
            mod_count: 0
          };
          const { data: newSrv, error: insertErr } = await supabase
            .from('mc_servers')
            .insert(insertData)
            .select()
            .single();
            
          if (insertErr) {
            if (insertErr.code === 'PGRST303' || insertErr.message?.includes('JWT') || insertErr.code === '401') {
              alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
              localStorage.removeItem('minelab-forced-token');
              window.location.href = '/';
              return;
            }
            throw insertErr;
          }
          setServerId(newSrv.id);
        }
      } catch (err) {
        console.error('Error initializing configuring server:', err);
        if (err.code === 'PGRST303' || err.message?.includes('JWT')) {
            alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
            localStorage.removeItem('minelab-forced-token');
            window.location.href = '/';
        }
      } finally {
        setLoadingConfig(false);
      }
    };
    initServer();
  }, [user]);

  // Sync individual field changes to Supabase instantly
  const handleUpdateField = async (field, value, dbField) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (!serverId) return;
    try {
      await supabase
        .from('mc_servers')
        .update({ [dbField]: value })
        .eq('id', serverId);
    } catch (err) {
      console.error('Failed to update field:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputStr.trim() || !user || !serverId) {
      console.warn("Blocked sending message. Reason:", {
        hasInput: !!inputStr.trim(),
        hasUser: !!user,
        userId: user?.id,
        serverId: serverId
      });
      return;
    }

    const userMessage = inputStr;
    setInputStr('');
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch('https://snack55-n8n1.q7pa8v.easypanel.host/webhook/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          user_id: user.id,
          server_id: serverId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.output || "No recibí una respuesta válida.";
        setChatMessages(prev => [...prev, { type: 'bot', text }]);
      } else {
        throw new Error('Webhook failed');
      }
    } catch (err) {
      console.error('N8N Chat Error:', err);
      setChatMessages(prev => [...prev, { type: 'bot', text: 'Ups, parece que he perdido la conexión. Intenta de nuevo.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!serverId) return;
    try {
      // Redirect logic to Checkout
      const stripeLinks = {
        4: "https://buy.stripe.com/8x228s2LKcZN3lK3As3AY01",
        6: "https://buy.stripe.com/4gM5kE1HG6Bpg8w7QI3AY02",
        8: "https://buy.stripe.com/14AdRa2LK2l99K8gne3AY03",
        12: "https://buy.stripe.com/bJe7sM1HGe3R3lK2wo3AY05"
      };
      
      const baseUrl = stripeLinks[form.ram] || stripeLinks[6];
      window.location.href = `${baseUrl}?client_reference_id=${serverId}`;
    } catch (err) {
      console.error('Error proceeding to payment:', err);
    }
  };

  if (loadingConfig) {
    return (
      <main className="flex-1 flex h-screen bg-[#0B0B0B] overflow-hidden items-center justify-center">
        <Loader2 className="animate-spin text-[#22C55E]" size={40} />
      </main>
    );
  }

  return (
    <main className="flex-1 flex h-screen bg-[#0B0B0B] overflow-hidden relative z-10 w-full min-w-0">
      
      {/* Left: Configuration Form */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 border-r border-[#2A2A2A] bg-[#121212]">
        <div className="max-w-2xl mx-auto flex flex-col gap-10">
          
          <div>
            <h1 className="text-3xl font-bold font-heading text-[#FFFFFF] tracking-tight mb-2">Configura tu servidor</h1>
            <p className="text-[#B3B3B3] text-sm">Selecciona las especificaciones manualmente o pídele a nuestra IA que lo haga por ti.</p>
          </div>

          <div className="flex flex-col gap-8">
            {/* Form Name */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider">Nombre del servidor</label>
              <input 
                type="text" 
                value={form.name}
                onChange={e => handleUpdateField('name', e.target.value, 'server_name')}
                className="w-full bg-[#171717] border border-[#2A2A2A] rounded-xl py-3 px-4 text-[#FFFFFF] focus:outline-none focus:border-[#22C55E]/50 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-all"
              />
            </div>

            {/* Type & Version */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider">Tipo</label>
                <select 
                  value={form.type}
                  onChange={e => handleUpdateField('type', e.target.value, 'server_type')}
                  className="w-full bg-[#171717] border border-[#2A2A2A] rounded-xl py-3 px-4 text-[#FFFFFF] focus:outline-none focus:border-[#22C55E]/50 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-all appearance-none"
                >
                  <option value="vanilla">Vanilla</option>
                  <option value="fabric">Fabric</option>
                  <option value="forge">Forge</option>
                  <option value="paper">Paper</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider">Versión</label>
                <select 
                  value={form.version}
                  onChange={e => handleUpdateField('version', e.target.value, 'mc_version')}
                  className="w-full bg-[#171717] border border-[#2A2A2A] rounded-xl py-3 px-4 text-[#FFFFFF] focus:outline-none focus:border-[#22C55E]/50 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-all appearance-none overflow-y-auto max-h-60"
                >
                  {['1.21.11', '1.21.10', '1.21.9', '1.21.8', '1.21.7', '1.21.6', '1.21.5', '1.21.4', '1.21.3', '1.21.2', '1.21.1', '1.21', '1.20.6', '1.20.5', '1.20.4', '1.20.3', '1.20.2', '1.20.1', '1.20', '1.19.4', '1.19.3', '1.19.2', '1.19.1', '1.19', '1.18.2', '1.18.1', '1.18', '1.17.1', '1.17', '1.16.5', '1.16.4', '1.16.3', '1.16.2', '1.16.1', '1.16', '1.15.2', '1.15.1', '1.15', '1.14.4', '1.14.3', '1.14.2', '1.14.1', '1.14', '1.13.2', '1.13.1', '1.13', '1.12.2'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* RAM */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-2">
                <Cpu size={16} className="text-[#6B6B6B]" /> RAM Asignada
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[4, 6, 8, 12].map(ram => (
                  <button 
                    key={ram}
                    onClick={() => handleUpdateField('ram', ram, 'ram_gb')}
                    className={`py-3 rounded-xl border font-bold text-sm transition-all ${form.ram === ram ? 'bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-[#171717] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#6B6B6B]'}`}
                  >
                    {ram}GB
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-2">
                <Globe size={16} className="text-[#6B6B6B]" /> Ubicación
              </label>
              <select 
                  value={form.location}
                  onChange={() => {}} // Disabled changes effectively since Frankfurt is 100% hardcoded constraint for now.
                  className="w-full bg-[#171717] border border-[#2A2A2A] rounded-xl py-3 px-4 text-[#FFFFFF] focus:outline-none focus:border-[#22C55E]/50 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-all appearance-none"
                >
                  <option value="Europa (Frankfurt)">Europa (Frankfurt)</option>
                  <option disabled value="Europa (Madrid)">Europa (Madrid) — Próximamente</option>
                  <option disabled value="USA (Virginia)">USA (Virginia) — Próximamente</option>
                  <option disabled value="Asia (Singapur)">Asia (Singapur) — Próximamente</option>
              </select>
            </div>
            
          </div>

          <div className="pt-6 border-t border-[#2A2A2A] flex justify-end">
            <button 
              onClick={handleStripeCheckout}
              className="px-8 py-4 bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#0B0B0B] rounded-xl flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors shadow-xl group"
            >
              Continuar al pago <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>

      {/* Right: AI Assistant */}
      <aside className="w-[360px] bg-[#141414] h-full flex flex-col shrink-0 hidden lg:flex shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20">
         {/* Header */}
         <div className="px-6 py-5 border-b border-white/5 bg-[#141414] shadow-[0_5px_20px_rgba(0,0,0,0.2)] flex flex-col relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center border border-[#22C55E]/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] shrink-0">
                <Bot size={16} className="text-[#22C55E]" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-[#FFFFFF] tracking-wide flex items-center gap-1.5 leading-none">
                  ASISTENTE IA <Sparkles size={12} className="text-[#22C55E] opacity-80"/>
                </h3>
                <p className="text-[10px] text-[#B3B3B3] flex items-center gap-1 leading-tight">
                  <ArrowRight size={10} className="text-[#22C55E]/70" /> 
                  ¿Necesitas ayuda? Escríbele al asistente y te ayudará a configurar tu servidor.
                </p>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="max-w-[90%] bg-[#171717] border border-white/5 text-[#B3B3B3] px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-md text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex flex-col items-start">
                  <div className="bg-[#171717] border border-white/5 text-[#B3B3B3] px-4 py-3.5 rounded-2xl shadow-md flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-accent-green" /> Escribiendo...
                  </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5 bg-[#141414]">
            <form className="relative flex items-center group" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
              <input 
                type="text" 
                placeholder="Ej: Quiero jugar Cobblemon..." 
                className="w-full bg-[#0B0B0B] border border-white/5 rounded-xl py-3.5 pl-4 pr-12 text-sm text-[#FFFFFF] transition-all focus:outline-none focus:border-[#22C55E]/50 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)] placeholder-[#6B6B6B]"
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                disabled={chatLoading}
              />
              <button 
                type="submit" 
                disabled={chatLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#22C55E] hover:bg-[#1faa50] text-[#0B0B0B] w-8 h-8 rounded-lg transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                <Send size={14} className="ml-[-2px] mt-[1px]" />
              </button>
            </form>
          </div>
      </aside>

    </main>
  );
};

export default CreateServerWizard;
