import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Terminal, FolderOpen, Users, Settings, DatabaseBackup,
  Layers, Cpu, Activity, Bot, Send, Sparkles, Zap, Play, Square, RotateCcw,
  LogOut
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

// ═══════════════════════════════════════════════════════════
// FAKE DATA
// ═══════════════════════════════════════════════════════════

const FAKE_SERVER = {
  id: 'demo-001',
  server_name: 'Survival SMP',
  server_type: 'paper',
  mc_version: '1.20.4',
  ram_gb: 6,
  ip: '192.168.1.104',
  port: 25565,
  status_server: 'running',
};

const FAKE_USER = {
  user_metadata: { full_name: 'Alex' },
  email: 'alex@minelab.gg',
};

const FAKE_PLAN = 'pro_6gb';

const CONSOLE_LINES = [
  '[18:04:01] [Server thread/INFO]: Starting minecraft server version 1.20.4',
  '[18:04:02] [Server thread/INFO]: Loading properties',
  '[18:04:03] [Server thread/INFO]: Default game type: SURVIVAL',
  '[18:04:05] [Server thread/INFO]: Preparing level "world"',
  '[18:04:07] [Server thread/INFO]: Preparing start region for dimension minecraft:overworld',
  '[18:04:09] [Server thread/INFO]: Time elapsed: 4218 ms',
  '[18:04:09] [Server thread/INFO]: Done (8.21s)! For help, type "help"',
  '[18:05:12] [User Authenticator/INFO]: UUID of player Notch is 069a79f4-44e9...',
  '[18:05:12] [Server thread/INFO]: Notch joined the game',
  '[18:06:44] [Server thread/INFO]: Notch has made the advancement [Stone Age]',
  '[18:07:01] [Server thread/INFO]: <Notch> gg server está volando',
  '[18:08:33] [User Authenticator/INFO]: UUID of player Dream is a31c2e4b-8f01...',
  '[18:08:33] [Server thread/INFO]: Dream joined the game',
  '[18:09:15] [Server thread/INFO]: <Dream> hola a todos!',
  '[18:10:02] [Server thread/INFO]: Dream has made the advancement [Getting an Upgrade]',
  '[18:11:44] [Server thread/INFO]: Saving the game (this may take a moment!)',
  '[18:11:44] [Server thread/INFO]: Saved the game',
  '[18:12:20] [User Authenticator/INFO]: UUID of player Alex is 6ab431b4-da2a...',
  '[18:12:20] [Server thread/INFO]: Alex joined the game',
  '[18:13:05] [Server thread/INFO]: <Alex> vamos a minar!',
];

const FAKE_ACTIVITIES = [
  { id: 1, type: 'player_join', player: 'Alex', created_at: new Date(Date.now() - 60000 * 2).toISOString() },
  { id: 2, type: 'player_join', player: 'Dream', created_at: new Date(Date.now() - 60000 * 5).toISOString() },
  { id: 3, type: 'server_start', created_at: new Date(Date.now() - 60000 * 15).toISOString() },
  { id: 4, type: 'player_join', player: 'Notch', created_at: new Date(Date.now() - 60000 * 12).toISOString() },
  { id: 5, type: 'player_leave', player: 'Steve', created_at: new Date(Date.now() - 60000 * 30).toISOString() },
];

const AI_RESPONSES = {
  instala: {
    text: 'Ejecutando instalación automática:',
    details: ['Buscando versión compatible en Modrinth...', 'Descargando plugin v2.4.1...', 'Verificando dependencias...', 'Plugin instalado correctamente. Reiniciando servidor...']
  },
  optimiz: {
    text: 'Analizando rendimiento del servidor:',
    details: ['Escaneando uso de RAM y chunks cargados...', 'Ajustando view-distance a 10...', 'Optimizando entity-activation-range...', 'Configuración aplicada. TPS mejorado de 18.2 → 20.0']
  },
  error: {
    text: 'Detectando y reparando errores:',
    details: ['Analizando logs de la última hora...', 'Error encontrado: NullPointerException en plugin Vault...', 'Actualizando Vault a v1.7.3...', 'Error corregido. Servidor estable.']
  },
  version: {
    text: 'Preparando cambio de versión:',
    details: ['Creando backup del mundo actual...', 'Descargando Paper 1.21.1...', 'Migrando archivos de configuración...', 'Servidor actualizado a 1.21.1 correctamente.']
  },
  default: {
    text: 'He procesado tu solicitud:',
    details: ['Analizando parámetros del comando...', 'Aplicando cambios en el servidor...', 'Operación completada con éxito.']
  }
};

// ═══════════════════════════════════════════════════════════
// GENERATE INITIAL METRICS HISTORY
// ═══════════════════════════════════════════════════════════

const generateInitialHistory = () => {
  const now = Date.now();
  return Array.from({ length: 15 }, (_, i) => {
    const t = new Date(now - (15 - i) * 10000);
    return {
      time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cpu: 20 + Math.random() * 20,
      ram_mb: 2800 + Math.random() * 800,
    };
  });
};

// ═══════════════════════════════════════════════════════════
// DEMO SIDEBAR
// ═══════════════════════════════════════════════════════════

const DemoSidebar = ({ activeTab, onTabChange }) => {
  const generalItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'overview' },
    { icon: <Terminal size={20} />, label: 'Consola', id: 'console' },
  ];

  const serverItems = [
    { icon: <FolderOpen size={20} />, label: 'Archivos', id: 'files' },
    { icon: <Users size={20} />, label: 'Jugadores', id: 'players' },
    { icon: <Settings size={20} />, label: 'Configuración', id: 'configuracion' },
    { icon: <DatabaseBackup size={20} />, label: 'Backups', id: 'backups', disabled: true },
  ];

  const renderItem = (item) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => !item.disabled && onTabChange(item.id)}
        disabled={item.disabled}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group ${
          item.disabled ? 'opacity-40 cursor-not-allowed' : ''
        } ${
          isActive
            ? 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border border-[rgba(34,197,94,0.3)] shadow-[0_0_15px_rgba(34,197,94,0.1)]'
            : 'text-[#B3B3B3] hover:text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
        }`}
      >
        <span className={isActive ? 'text-[#22C55E]' : 'text-[#6B6B6B] group-hover:text-[#B3B3B3]'}>{item.icon}</span>
        {item.label}
      </button>
    );
  };

  return (
    <aside className="w-[240px] bg-[#0F0F0F] border-r border-[#2A2A2A] flex flex-col pt-6 shrink-0 hidden md:flex">
      <div className="px-6 mb-2 mt-2 flex flex-col">
        <span className="font-heading font-extrabold text-4xl tracking-tighter text-[#FFFFFF] uppercase leading-none">MINELAB</span>
      </div>

      {/* Server info */}
      <div className="px-6 flex flex-col gap-3 mb-8">
        <div className="flex flex-col gap-0.5">
          <span className="text-white text-sm font-bold truncate uppercase tracking-tight">{FAKE_SERVER.server_name}</span>
          <span className="text-[#6B6B6B] font-mono text-[10px] tracking-widest">{FAKE_SERVER.ip}:{FAKE_SERVER.port}</span>
        </div>
        
        <div className="flex items-center gap-1.5 w-full grid grid-cols-3">
          <button className="w-full py-1.5 rounded text-[9px] font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-1 uppercase bg-[rgba(255,255,255,0.02)] text-white/30 cursor-not-allowed">
            START
          </button>
          <button className="w-full py-1.5 rounded text-[9px] font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-1 uppercase bg-[rgba(234,179,8,0.1)] text-[#EAB308] hover:bg-[rgba(234,179,8,0.2)] shadow-[0_4px_10px_rgba(234,179,8,0.05)]">
            RESTART
          </button>
          <button className="w-full py-1.5 rounded text-[9px] font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-1 uppercase bg-[rgba(239,68,68,0.1)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] shadow-[0_4px_10px_rgba(239,68,68,0.05)]">
            STOP
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider mb-1 px-4">General</span>
          {generalItems.map(renderItem)}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider mb-1 px-4">Servidor</span>
          {serverItems.map(renderItem)}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider mb-1 px-4">Cuenta</span>
          {renderItem({ icon: <Settings size={20} />, label: 'Ajustes', id: 'settings' })}
        </div>
      </div>

      {/* User info */}
      <div className="p-4 mt-auto border-t border-[#2A2A2A]">
        <div className="flex flex-col gap-3 px-2 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#171717] border border-[#2A2A2A] flex items-center justify-center text-[#FFFFFF] font-bold text-sm">
              A
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-[#FFFFFF] text-sm font-semibold truncate max-w-[120px]">Alex</span>
              <span className="text-[#6B6B6B] text-[10px] uppercase tracking-wider font-bold">PRO 6GB</span>
            </div>
          </div>
          <button className="w-full text-xs text-center py-2 rounded-lg bg-[#2A2A2A] hover:bg-red-500/20 hover:text-red-400 text-[#B3B3B3] transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
};

// ═══════════════════════════════════════════════════════════
// DEMO MAIN CONTENT (OVERVIEW)
// ═══════════════════════════════════════════════════════════

const DemoMainContent = ({ activeTab }) => {
  const [metricsHistory, setMetricsHistory] = useState(generateInitialHistory);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const consoleLogIndex = useRef(0);
  const consoleEndRef = useRef(null);

  // Animate metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const t = new Date();
      setMetricsHistory(prev => {
        const updated = [...prev, {
          time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          cpu: 20 + Math.random() * 20,
          ram_mb: 2800 + Math.random() * 800,
        }];
        return updated.slice(-20);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animate console logs
  useEffect(() => {
    if (activeTab !== 'console') return;
    // Seed initial logs
    setConsoleLogs(CONSOLE_LINES.slice(0, 5));
    consoleLogIndex.current = 5;

    const interval = setInterval(() => {
      if (consoleLogIndex.current < CONSOLE_LINES.length) {
        setConsoleLogs(prev => [...prev, CONSOLE_LINES[consoleLogIndex.current]]);
        consoleLogIndex.current++;
      } else {
        // Loop
        consoleLogIndex.current = 0;
        setConsoleLogs([]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Auto-scroll console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  const latest = metricsHistory[metricsHistory.length - 1] || { cpu: 30, ram_mb: 3200 };
  const maxRamMb = FAKE_SERVER.ram_gb * 1024;
  const ramPercent = Math.min(100, (latest.ram_mb / maxRamMb) * 100);
  
  let ramTextClass = "text-[#22C55E]";
  if (ramPercent > 80) ramTextClass = "text-[#EF4444]";
  else if (ramPercent > 50) ramTextClass = "text-amber-500";

  const getCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#121212] border border-[#2A2A2A] p-2 rounded-lg shadow-lg">
          <p className="text-[#E5E5E5] text-xs font-medium mb-1">{label}</p>
          <p className="text-xs" style={{ color: payload[0].color }}>
            {payload[0].value.toFixed(1)} {payload[0].name === 'ram_mb' ? 'MB' : '%'}
          </p>
        </div>
      );
    }
    return null;
  };

  const getActivityText = (act) => {
    switch(act.type) {
      case 'player_join': return `Jugador ${act.player || ''} se unió al servidor`;
      case 'player_leave': return `Jugador ${act.player || ''} salió del servidor`;
      case 'server_start': return 'Servidor iniciado';
      case 'server_stop': return 'Servidor detenido';
      default: return act.message || act.type;
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // OVERVIEW TAB
  if (activeTab === 'overview') {
    return (
      <main className="flex-1 flex flex-col bg-[#121212] relative z-10 min-w-0">
        {/* Top Navbar */}
        <div className="w-full px-8 py-4 flex justify-between items-center text-sm font-semibold text-[#B3B3B3] bg-[#121212]/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#22C55E] flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.2)]">
              <LayoutDashboard size={14} className="text-[#0B0B0B]" />
            </div>
            <span className="text-[#FFFFFF] font-extrabold text-sm tracking-wide">PANEL</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <span className="text-lg leading-none">🇪🇸</span>
              Español
            </button>
          </div>
        </div>

        <div className="p-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6 shrink-0 mt-4">
          {/* Main Banner */}
          <div className="w-full bg-[#171717] rounded-xl overflow-hidden relative border border-[#2A2A2A] shadow-md flex mb-6 min-h-[140px]">
            <div className="w-full relative flex h-full min-h-[140px]">
              <div className="relative w-[60%] shrink-0 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/10 via-[#171717] to-[#171717]"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#171717]/50 to-[#171717]"></div>
              </div>
              <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center -ml-[15%]">
                <h2 className="text-[#FFFFFF] text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-tighter leading-[0.9]">
                  <span className="text-2xl md:text-3xl text-[#ffffff]/90">MINELAB</span><br />MINECRAFT
                </h2>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* RAM */}
            <div className="bg-[#171717] border border-[#2A2A2A] rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[160px]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[#B3B3B3] text-xs font-bold uppercase tracking-wider">Uso de RAM</p>
                <div className="bg-[#121212] p-2 rounded-lg border border-[#2A2A2A]">
                  <Layers size={16} className={ramTextClass} />
                </div>
              </div>
              <div className="flex justify-between items-end mb-3">
                <span className={`text-3xl font-bold ${ramTextClass}`}>{ramPercent.toFixed(1)}%</span>
                <span className="text-[#6B6B6B] text-xs font-medium pb-1">{latest.ram_mb.toFixed(0)} MB / {maxRamMb} MB</span>
              </div>
              <div className="h-[50px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsHistory}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, maxRamMb]} />
                    <Tooltip content={getCustomTooltip} />
                    <Line
                      type="monotone"
                      dataKey="ram_mb"
                      name="RAM"
                      stroke={ramPercent > 80 ? "#EF4444" : ramPercent > 50 ? "#F59E0B" : "#22C55E"}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CPU */}
            <div className="bg-[#171717] border border-[#2A2A2A] rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[160px]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[#B3B3B3] text-xs font-bold uppercase tracking-wider">Uso de CPU</p>
                <div className="bg-[#121212] p-2 rounded-lg border border-[#2A2A2A]">
                  <Cpu size={16} className="text-accent-green" />
                </div>
              </div>
              <div className="flex items-end mb-3">
                <span className="text-3xl font-bold text-[#E5E5E5]">{latest.cpu.toFixed(0)}%</span>
              </div>
              <div className="h-[50px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsHistory}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip content={getCustomTooltip} />
                    <Line
                      type="monotone"
                      dataKey="cpu"
                      name="CPU"
                      stroke="#22C55E"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PLAYERS */}
            <div className="bg-[#171717] border border-[#2A2A2A] rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[140px]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[#B3B3B3] text-xs font-bold uppercase tracking-wider">Jugadores online</p>
                <div className="bg-[#121212] p-2 rounded-lg border border-[#2A2A2A]">
                  <Users size={16} className="text-blue-500" />
                </div>
              </div>
              <div className="mt-auto flex items-end">
                <span className="text-4xl font-bold text-[#E5E5E5]">3</span>
              </div>
            </div>
          </div>

          {/* Server Information */}
          <div className="bg-[#171717] border border-[#2A2A2A] shadow-sm rounded-xl p-6 flex flex-col">
            <h3 className="text-[#FFFFFF] text-lg font-extrabold mb-6 uppercase tracking-tight">Información del Servidor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
              <div className="flex flex-col gap-1">
                <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Estado</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest w-fit bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_8px_#22C55E]"></span>
                  ONLINE
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Dirección IP</span>
                <span className="text-[#E5E5E5] font-mono text-sm">{FAKE_SERVER.ip}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Puerto</span>
                <span className="text-[#E5E5E5] font-mono text-sm">{FAKE_SERVER.port}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Versión</span>
                <span className="text-[#E5E5E5] text-sm font-medium">{FAKE_SERVER.mc_version}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Software</span>
                <span className="text-[#E5E5E5] text-sm font-medium capitalize">{FAKE_SERVER.server_type}</span>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-[#171717] border border-[#2A2A2A] shadow-sm rounded-xl p-6 flex flex-col min-h-[300px]">
            <h3 className="text-[#FFFFFF] text-lg font-extrabold mb-6 uppercase tracking-tight">Actividad reciente</h3>
            <div className="flex flex-col gap-3">
              {FAKE_ACTIVITIES.map((act) => (
                <div key={act.id} className="flex items-center justify-between p-4 bg-[#121212] border border-[#2A2A2A] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#171717] p-2 rounded-md border border-[#2A2A2A]">
                      <Terminal size={14} className="text-[#B3B3B3]" />
                    </div>
                    <span className="text-[#E5E5E5] text-sm">{getActivityText(act)}</span>
                  </div>
                  <span className="text-[#6B6B6B] text-xs font-medium">{formatTime(act.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // CONSOLE TAB
  if (activeTab === 'console') {
    return (
      <main className="flex-1 flex flex-col bg-[#121212] relative z-10 min-w-0">
        <div className="w-full px-8 py-4 flex justify-between items-center text-sm font-semibold text-[#B3B3B3] bg-[#121212]/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#22C55E] flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.2)]">
              <LayoutDashboard size={14} className="text-[#0B0B0B]" />
            </div>
            <span className="text-[#FFFFFF] font-extrabold text-sm tracking-wide">PANEL</span>
          </div>
        </div>

        <div className="p-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6 mt-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
              Terminal en Vivo
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            </h3>
            <span className="text-[10px] text-zinc-600 font-mono">CONNECTED</span>
          </div>
          
          <div className="flex-1 min-h-[400px] bg-[#0B0B0B] rounded-xl border border-[#2A2A2A] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed text-[#B3B3B3] scrollbar-thin scrollbar-thumb-zinc-800">
              {consoleLogs.map((log, i) => (
                <div key={i} className="mb-1 text-zinc-300 break-all whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-1 duration-300">{log}</div>
              ))}
              <div className="w-2 h-3 bg-white/50 animate-pulse mt-1 inline-block"></div>
              <div ref={consoleEndRef} />
            </div>
            
            <div className="border-t border-[#2A2A2A] flex bg-[#121212] shrink-0">
              <span className="flex items-center pl-4 text-[#22C55E] font-mono text-sm">/</span>
              <input
                type="text"
                placeholder="Comando..."
                className="flex-1 bg-transparent border-none text-zinc-100 px-3 py-4 text-sm font-mono focus:ring-0 placeholder:text-zinc-700 outline-none"
                readOnly
              />
              <button className="px-6 text-[#22C55E] hover:text-white transition-colors font-bold text-sm bg-black/20">
                Enviar
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // FALLBACK for other tabs
  return (
    <main className="flex-1 flex flex-col bg-[#121212] relative z-10 min-w-0 items-center justify-center">
      <div className="text-[#6B6B6B] text-sm">Vista en desarrollo</div>
    </main>
  );
};

// ═══════════════════════════════════════════════════════════
// DEMO AI ASSISTANT SIDEBAR
// ═══════════════════════════════════════════════════════════

const DemoAISidebar = () => {
  const [inputStr, setInputStr] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy tu asistente de IA de MineLab. ¿En qué puedo ayudarte a gestionar el servidor "Survival SMP" hoy?' }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e, forcedText = null) => {
    if (e) e.preventDefault();
    const textToSend = forcedText || inputStr.trim();
    if (!textToSend || isTyping) return;

    setInputStr('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const command = textToSend.toLowerCase();
      let response = AI_RESPONSES.default;

      if (command.includes('instala') || command.includes('plugin') || command.includes('mod')) {
        response = AI_RESPONSES.instala;
      } else if (command.includes('optimiz') || command.includes('rendimiento') || command.includes('tps')) {
        response = AI_RESPONSES.optimiz;
      } else if (command.includes('error') || command.includes('arregl') || command.includes('crash')) {
        response = AI_RESPONSES.error;
      } else if (command.includes('version') || command.includes('versión') || command.includes('actualiz')) {
        response = AI_RESPONSES.version;
      }

      const formattedText = response.text + '\n' + response.details.map((d, i) => `${i === response.details.length - 1 ? '✅' : '✅'} ${d}`).join('\n');
      setMessages(prev => [...prev, { role: 'assistant', text: formattedText }]);
    }, 1500);
  };

  const quickActions = ['Instalar mod', 'Arreglar error', 'Optimizar servidor', 'Cambiar versión'];

  return (
    <aside className="w-[350px] bg-[#141414] border-l border-white/5 flex flex-col shrink-0 hidden lg:flex shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
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
          <div className="flex justify-start mt-2">
            <div className="bg-[#171717] border border-[#2A2A2A] px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-md min-w-[60px]">
              <div className="flex gap-1.5 h-[20px] items-center px-1">
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

// ═══════════════════════════════════════════════════════════
// DEMO PANEL (MAIN EXPORT)
// ═══════════════════════════════════════════════════════════

const DemoPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-[900px] w-full overflow-hidden bg-[#0B0B0B]">
      <DemoSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
        <DemoMainContent activeTab={activeTab} />
        <DemoAISidebar />
      </div>
    </div>
  );
};

export default DemoPanel;
