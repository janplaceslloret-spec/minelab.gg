import React, { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from '../../supabaseClient';
import { Play, Square, RotateCcw, Activity, Cpu, Users, Layers, AlertCircle, Copy, Terminal, Zap, ChevronDown, Check, FolderOpen, LayoutDashboard, Globe, MessageSquare, Loader2 } from 'lucide-react';
import ConsoleView from './ConsoleView';
const FileManagerView = lazy(() => import('./FileManagerView'));
import SettingsView from './SettingsView';
import PlayersView from './PlayersView';
import ConfigView from './ConfigView';
import ReviewView from './ReviewView';
import BackupsView from './BackupsView';
import AuditLogView from './AuditLogView';
import CatalogView from './CatalogView';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const MainContent = ({ planStatus, server, activeTab = 'overview', user, onServerUpdate, isActionLoading, onServerAction, memberRole = 'owner' }) => {
  const [copied, setCopied] = useState(false);
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);

  // New states for real-time metrics
  const [metrics, setMetrics] = useState({ cpu: 0, ram_mb: 0, players_online: 0 });
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!server?.id) return;

    const fetchInitialData = async () => {
      // Get latest metrics
      const { data: metricsData } = await supabase
        .from('server_metrics')
        .select('*')
        .eq('server_id', server.id)
        .order('created_at', { ascending: false })
        .limit(20); // Fetch recent history for charts
      
      if (metricsData && metricsData.length > 0) {
        // Reverse so chronological left-to-right
        const historical = [...metricsData].reverse().map(m => ({
          ...m,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }));
        setMetricsHistory(historical);
        
        // Latest is the last one in historical
        const latestInfo = historical[historical.length - 1];
        setMetrics({
          cpu: latestInfo.cpu || 0,
          ram_mb: latestInfo.ram_mb || 0,
          players_online: latestInfo.players_online || 0
        });
      }

      // Get latest activity
      const { data: activityData } = await supabase
        .from('server_activity')
        .select('*')
        .eq('server_id', server.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityData) {
        setActivities(activityData);
      }
    };

    fetchInitialData();

    // Subscribe to metrics
    const metricsChannel = supabase
      .channel(`metrics-realtime-${server.id}`)
      .on(
       'postgres_changes',
       {
        event: '*',  
        schema: 'public',
        table: 'server_metrics',
        filter: `server_id=eq.${server.id}`
       },
       (payload) => {
        console.log("REALTIME METRICS EVENT:", payload);
        if (payload.new) {
          const newData = {
            ...payload.new,
            time: new Date(payload.new.created_at || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };

          // Update chart history
          setMetricsHistory(prev => {
             const updated = [...prev, newData];
             return updated.slice(-20); // Keep last 20 points
          });

          // Update current single metrics
          setMetrics(prev => {
             const nextCpu = payload.new.cpu !== undefined ? payload.new.cpu : prev.cpu;
             const nextRam = payload.new.ram_mb !== undefined ? payload.new.ram_mb : prev.ram_mb;
             const nextPlayers = payload.new.players_online !== undefined ? payload.new.players_online : prev.players_online;
             
             // Check if anything actually changed to avoid useless re-renders
             if (nextCpu === prev.cpu && nextRam === prev.ram_mb && nextPlayers === prev.players_online) {
                return prev;
             }

             return {
               cpu: nextCpu,
               ram_mb: nextRam,
               players_online: nextPlayers
             };
          });
        }
       }
      )
      .subscribe();

    // Subscribe to activity
    const activityChannel = supabase
      .channel(`activity-realtime-${server.id}`)
      .on(
       'postgres_changes',
       {
        event: 'INSERT', 
        schema: 'public',
        table: 'server_activity',
        filter: `server_id=eq.${server.id}`
       },
       (payload) => {
        console.log("REALTIME ACTIVITY EVENT:", payload);
        if (payload.new) {
          setActivities(prev => [payload.new, ...prev]);
        }
       }
      )
      .subscribe();

    return () => {
        supabase.removeChannel(metricsChannel);
        supabase.removeChannel(activityChannel);
    };
  }, [server?.id]);

  // BUG-A fix: when server is not online, force stats to zero so we don't
  // display stale cached values from the last time it was running.
  const statsOnline = server?.status_server === 'online' || server?.status_server === 'running';
  const liveMetrics = statsOnline ? metrics : { cpu: 0, ram_mb: 0, players_online: 0 };

  // Derived values for RAM gauge
  const maxRamGb = server?.ram_gb || 4;
  const maxRamMb = maxRamGb * 1024;
  const ramPercent = Math.min(100, (liveMetrics.ram_mb / maxRamMb) * 100);
  
  let ramTextClass = "text-[#22C55E]";
  if (ramPercent > 80) {
     ramTextClass = "text-[#EF4444]";
  } else if (ramPercent > 50) {
     ramTextClass = "text-amber-500";
  }

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

  const status = server?.status_server || 'offline';
  const isOnline = status === 'running';
  const isTransitioning = status === 'starting' || status === 'stopping' || status === 'restarting' || status === 'creating';
  const canStart = status === 'stopped' || status === 'error' || status === 'offline';
  const canStop = status === 'running';
  const canRestart = status === 'running';
  
  const ipAddress = (server?.ip && server?.port) ? `${server.ip}:${server.port}` : "IP no disponible";

  const handleCopy = () => {
    navigator.clipboard.writeText(ipAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex-1 flex flex-col bg-[#121212] relative z-10 min-w-0 min-h-screen">
      
      {/* Top Navbar / Header area */}
      <div className="w-full px-8 py-4 flex justify-between items-center text-sm font-semibold text-[#B3B3B3] sticky top-0 z-20 bg-[#121212]/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-[#2A2A2A]">
         {/* Left Side: Panel Title */}
         <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#22C55E] flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.2)]">
               <LayoutDashboard size={14} className="text-[#0B0B0B]" />
            </div>
            <span className="text-[#FFFFFF] font-extrabold text-sm tracking-wide">PANEL</span>
         </div>

         {/* Right Side: Language & Discord */}
         <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
               <span className="text-lg leading-none">🇪🇸</span>
               Español
            </button>
            <a href="https://discord.gg/wUJZkQxAQk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#5865F2] transition-colors">
               <svg className="w-5 h-5" viewBox="0 0 127.14 96.36" fill="currentColor">
                 <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.55,67.55,0,0,1-10.87,5.19,77.13,77.13,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.33,46,96.22,53,91.08,65.69,84.69,65.69Z"/>
               </svg>
               Discord
            </a>
         </div>
      </div>

      <div className="p-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6 shrink-0 mt-4">
        
        {activeTab === 'overview' && (
          <>
            {/* Main Header / Banner */}
            <div className="w-full bg-[#171717] rounded-xl overflow-hidden relative border border-[#2A2A2A] shadow-md flex mb-6 min-h-[160px] md:min-h-[200px]">
               <div className="w-full relative flex h-full min-h-[160px] md:min-h-[200px]">
                   {/* Image Background Left Side */}
                   <div className="relative w-[60%] shrink-0 h-full">
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/JROHAHT42NEQZCHQ5NOCKUUXJ4.jpg')" }}
                      ></div>
                      <div className="absolute inset-0 bg-[#171717]/20 mix-blend-overlay"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#171717]/50 to-[#171717]"></div>
                   </div>

                   {/* Content - Placed on the right to utilize the empty space */}
                   <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center -ml-[15%]">
                       <h2 className="text-[#FFFFFF] text-4xl md:text-5xl lg:text-7xl font-heading font-extrabold uppercase tracking-tighter leading-[0.9]">
                           <span className="text-3xl md:text-4xl lg:text-6xl text-[#ffffff]/90">MINELAB</span><br />MINECRAFT
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
                       <span className="text-[#6B6B6B] text-xs font-medium pb-1">{liveMetrics.ram_mb.toFixed(0)} MB / {maxRamMb} MB</span>
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
                      <span className="text-3xl font-bold text-[#E5E5E5]">{liveMetrics.cpu}%</span>
                    </div>
                    <div className="h-[50px] w-full mt-auto">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={metricsHistory}>
                           <XAxis dataKey="time" hide />
                           <YAxis hide domain={[0, 'dataMax + 10']} />
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
                       <span className="text-4xl font-bold text-[#E5E5E5]">{liveMetrics.players_online}</span>
                    </div>
                 </div>
            </div>

            {/* Server Information */}
            <div className="bg-[#171717] border border-[#2A2A2A] shadow-sm rounded-xl p-6 flex flex-col">
                <h3 className="text-[#FFFFFF] text-lg font-extrabold mb-6 uppercase tracking-tight">Información del Servidor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                   <div className="flex flex-col gap-1">
                      <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Estado</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest w-fit ${isOnline ? 'bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]' : isTransitioning ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' : 'bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]'}`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#22C55E] animate-pulse shadow-[0_0_8px_#22C55E]' : isTransitioning ? 'bg-amber-500 animate-pulse' : 'bg-[#EF4444]'} `}></span> 
                         {isOnline ? 'ONLINE' : isTransitioning ? status : 'OFFLINE'}
                      </span>
                   </div>
                   
                   <div className="flex flex-col gap-1">
                      <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Dirección IP</span>
                      <div className="flex items-center gap-2">
                         <span className="text-[#E5E5E5] font-mono text-sm">{server?.ip || 'Pendiente'}</span>
                      </div>
                   </div>

                   <div className="flex flex-col gap-1">
                      <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Puerto</span>
                      <div className="flex items-center gap-2">
                         <span className="text-[#E5E5E5] font-mono text-sm">{server?.port || 'Pendiente'}</span>
                      </div>
                   </div>

                   <div className="flex flex-col gap-1">
                      <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Versión</span>
                      <span className="text-[#E5E5E5] text-sm font-medium">{server?.mc_version || '1.21.1'}</span>
                   </div>

                   <div className="flex flex-col gap-1">
                      <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Software</span>
                      <span className="text-[#E5E5E5] text-sm font-medium capitalize">{server?.server_type || 'Vanilla'}</span>
                   </div>
                </div>
            </div>

            {/* Activity Log */}
            <div className="bg-[#171717] border border-[#2A2A2A] shadow-sm rounded-xl p-6 flex flex-col min-h-[300px]">
              <h3 className="text-[#FFFFFF] text-lg font-extrabold mb-6 uppercase tracking-tight">Actividad reciente</h3>
              
              {activities.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#121212] border border-dashed border-[#2A2A2A] rounded-xl">
                   <Activity size={32} className="text-[#2A2A2A] mb-3" />
                   <p className="text-[#E5E5E5] font-medium mb-1">No hay actividad disponible todavía</p>
                   <p className="text-[#6B6B6B] text-sm">Los eventos del servidor se mostrarán aquí en tiempo real.</p>
                </div>
              ) : (
                <div className=" flex flex-col gap-3">
                  {activities.map((act) => (
                    <div key={act.id || act.created_at} className="flex items-center justify-between p-4 bg-[#121212] border border-[#2A2A2A] rounded-lg">
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
              )}
            </div>
          </>
        )}

        {activeTab === 'console' && (
           <ConsoleView server={server} />
        )}

        {activeTab === 'files' && (
           <Suspense fallback={<div className="flex items-center justify-center p-12 text-[#6B6B6B]"><Loader2 className="animate-spin" size={24} /></div>}>
             <FileManagerView server={server} />
           </Suspense>
        )}

        {activeTab === 'settings' && (
           <SettingsView planStatus={planStatus} user={user} server={server} onServerUpdate={onServerUpdate} memberRole={memberRole} />
        )}

        {activeTab === 'players' && (
           <PlayersView server={server} />
        )}

        {activeTab === 'configuracion' && (
           <ConfigView server={server} />
        )}

        {activeTab === 'review' && (
           <ReviewView user={user} planStatus={planStatus} />
        )}

        {activeTab === 'backups' && (
           <BackupsView server={server} />
        )}

        {activeTab === 'historial' && (
           <AuditLogView server={server} />
        )}

        {activeTab === 'mods' && (
           <CatalogView type="mods" server={server} user={user} />
        )}

        {activeTab === 'plugins' && (
           <CatalogView type="plugins" server={server} user={user} />
        )}

        {activeTab === 'modpacks' && (
           <CatalogView type="modpacks" server={server} user={user} />
        )}

      </div>
    </main>
  );
};

export default MainContent;
