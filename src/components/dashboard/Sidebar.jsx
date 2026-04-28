import React, { useState } from 'react';
import { LayoutDashboard, Terminal, FolderOpen, Blocks, Users, DatabaseBackup, Settings, LogOut, Star, ChevronDown, Share2, History, Wrench, Puzzle, Package } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ viewState = 'dashboard', planStatus = 'none', onCreateServer, activeTab = 'overview', onTabChange, user, server, sharedServers = [], onSwitchServer, onServerAction, isActionLoading, memberRole = 'owner', isOwner = false, allOwnerServers = [] }) => {
  const [serverPickerOpen, setServerPickerOpen] = useState(false);
  const status = server?.status_server || 'offline';
  // Para OWNER: mostramos TODOS los servers (allOwnerServers contiene la lista completa)
  // Para users normales: own + invited (sharedServers).
  const allServers = isOwner && allOwnerServers.length > 0
    ? allOwnerServers.map(s => ({ ...s, _own: s.id === server?.id, _ownerView: true }))
    : [
        ...(server ? [{ ...server, _own: true }] : []),
        ...sharedServers.filter(s => s.id !== server?.id).map(s => ({ ...s, _own: false })),
      ];
  const canStart = status === 'stopped' || status === 'error' || status === 'offline';
  const canStop = status === 'running';
  const canRestart = status === 'running';

  // Role-based permissions. isOwner (global) tiene acceso total a todo, sobreescribe memberRole.
  const effectiveRole = isOwner ? 'owner' : memberRole;
  const canControlServer = effectiveRole === 'owner' || effectiveRole === 'admin' || effectiveRole === 'member';
  const canAccessFiles    = effectiveRole === 'owner' || effectiveRole === 'admin';
  const canAccessPlayers  = effectiveRole === 'owner' || effectiveRole === 'admin';
  const canAccessConfig   = effectiveRole === 'owner' || effectiveRole === 'admin';
  const canAccessSettings = effectiveRole === 'owner' || effectiveRole === 'admin';
  
  const navigate = useNavigate();

  const generalItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: activeTab === 'overview', id: 'overview' },
    { icon: <Terminal size={20} />, label: 'Consola', active: activeTab === 'console', id: 'console' },
  ];

  // Visibilidad de catálogos según server_type
  const serverType = String(server?.server_type || '').toLowerCase();
  const isPaperLike = ['paper', 'spigot', 'vanilla'].includes(serverType);
  const isModded = ['fabric', 'forge', 'neoforge'].includes(serverType);

  const serverItems = [
    { icon: <FolderOpen size={20} />, label: 'Archivos', active: activeTab === 'files', id: 'files', hidden: !canAccessFiles },
    { icon: <Users size={20} />, label: 'Jugadores', active: activeTab === 'players', id: 'players', hidden: !canAccessPlayers },
    { icon: <Settings size={20} />, label: 'Configuración', active: activeTab === 'configuracion', id: 'configuracion', hidden: !canAccessConfig },
    { icon: <DatabaseBackup size={20} />, label: 'Backups', active: activeTab === 'backups', id: 'backups', hidden: !canAccessFiles },
    { icon: <History size={20} />, label: 'Historial IA', active: activeTab === 'historial', id: 'historial', hidden: !canAccessFiles },
    // Catálogos 1-click (visibilidad por server type)
    { icon: <Puzzle size={20} />, label: 'Plugins', active: activeTab === 'plugins', id: 'plugins', hidden: !isPaperLike },
    { icon: <Wrench size={20} />, label: 'Mods', active: activeTab === 'mods', id: 'mods', hidden: !isModded },
    { icon: <Package size={20} />, label: 'Modpacks', active: activeTab === 'modpacks', id: 'modpacks', hidden: !isModded },
  ].filter(i => !i.hidden);

  const accountItems = [
    { icon: <Settings size={20} />, label: 'Ajustes', active: activeTab === 'settings', id: 'settings' },
    { icon: <Star size={20} />, label: 'Dejar reseña', active: activeTab === 'review', id: 'review' },
  ];

  // If viewState is wizard or there is no plan AND no shared servers, limit the exposed items.
  const isLimited = viewState !== 'dashboard' || (planStatus === 'none' && sharedServers.length === 0);

  return (
    <aside className="w-[240px] bg-[#0F0F0F] border-r border-[#2A2A2A] h-screen sticky top-0 flex flex-col pt-6 z-20 shrink-0 hidden md:flex">
      <div
        onClick={() => navigate('/')}
        className="px-6 mb-2 mt-2 flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
      >
        <span className="font-heading font-extrabold text-4xl tracking-tighter text-[#FFFFFF] uppercase leading-none">MINELAB</span>
      </div>

      {!isLimited && server && (
         <div className="px-6 flex flex-col gap-3 mb-8">
            {/* Role badge — owner global ve "OWNER VIEW", invited members ven su rol */}
            {isOwner ? (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold tracking-widest bg-emerald-500/10 border-emerald-500/30 text-emerald-400">Owner View</span>
              </div>
            ) : memberRole !== 'owner' && (
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold tracking-widest ${
                  memberRole === 'admin'  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  memberRole === 'member' ? 'bg-blue-500/10  border-blue-500/20  text-blue-400'  :
                                           'bg-zinc-500/10  border-zinc-500/20  text-zinc-400'
                }`}>{memberRole === 'admin' ? 'Admin' : memberRole === 'member' ? 'Miembro' : 'Espectador'}</span>
              </div>
            )}
            {/* Server name + switcher */}
            <div className="relative">
              <button
                onClick={() => allServers.length > 1 && setServerPickerOpen(o => !o)}
                className={`w-full flex items-center justify-between gap-2 text-left ${allServers.length > 1 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-white text-sm font-bold truncate uppercase tracking-tight">{server.server_name || "Servidor"}</span>
                  <span className="text-[#6B6B6B] font-mono text-[10px] tracking-widest">{server.ip ? `${server.ip}:${server.port}` : "IP PENDIENTE"}</span>
                </div>
                {allServers.length > 1 && (
                  <ChevronDown size={14} className={`text-[#6B6B6B] shrink-0 transition-transform ${serverPickerOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Server picker dropdown */}
              {serverPickerOpen && allServers.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl z-30 overflow-hidden">
                  {allServers.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { onSwitchServer?.(s); setServerPickerOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#2A2A2A] transition-colors ${s.id === server.id ? 'bg-[#22C55E]/5' : ''}`}
                    >
                      {!s._own && <Share2 size={12} className="text-[#22C55E] shrink-0" title="Compartido contigo" />}
                      <div className="flex flex-col min-w-0">
                        <span className="text-white text-xs font-bold truncate uppercase">{s.server_name || 'Servidor'}</span>
                        {!s._own && <span className="text-[#6B6B6B] text-[9px]">Compartido</span>}
                      </div>
                      {s.id === server.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />}
                    </button>
                  ))}
                  <button
                    onClick={() => { setServerPickerOpen(false); navigate('/configurar?plan=6gb&billing=monthly'); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left border-t border-[#2A2A2A] text-[#22C55E] hover:bg-[#22C55E]/[0.05] transition-colors"
                  >
                    <span className="w-5 h-5 rounded bg-[#22C55E]/15 border border-[#22C55E]/40 flex items-center justify-center shrink-0">
                      <span className="text-[#22C55E] text-xs font-black">+</span>
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider">Añadir servidor</span>
                  </button>
                </div>
              )}
            </div>
            
            {canControlServer && (
            <div className="flex items-center gap-1.5 w-full grid grid-cols-3">
                 <button
                   onClick={() => onServerAction('start')}
                   disabled={!canStart || isActionLoading}
                   className={`w-full py-1.5 rounded text-[9px] font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-1 uppercase ${
                     canStart && !isActionLoading
                       ? 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.2)] shadow-[0_4px_10px_rgba(34,197,94,0.05)]'
                       : 'bg-[rgba(255,255,255,0.02)] text-white/30 cursor-not-allowed'
                   }`}
                   title="Start"
                 >
                   START
                 </button>
                 <button
                   onClick={() => onServerAction('restart')}
                   disabled={!canRestart || isActionLoading}
                   className={`w-full py-1.5 rounded text-[9px] font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-1 uppercase ${
                     canRestart && !isActionLoading
                       ? 'bg-[rgba(234,179,8,0.1)] text-[#EAB308] hover:bg-[rgba(234,179,8,0.2)] shadow-[0_4px_10px_rgba(234,179,8,0.05)]'
                       : 'bg-[rgba(255,255,255,0.02)] text-white/30 cursor-not-allowed'
                   }`}
                   title="Restart"
                 >
                   RESTART
                 </button>
                 <button
                   onClick={() => onServerAction('stop')}
                   disabled={!canStop || isActionLoading}
                   className={`w-full py-1.5 rounded text-[9px] font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-1 uppercase ${
                     canStop && !isActionLoading
                       ? 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] shadow-[0_4px_10px_rgba(239,68,68,0.05)]'
                       : 'bg-[rgba(255,255,255,0.02)] text-white/30 cursor-not-allowed'
                   }`}
                   title="Stop"
                 >
                   STOP
                 </button>
            </div>
            )}
         </div>
      )}

      <div className="flex-1 flex flex-col gap-6 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pb-4">
        
        {/* GENERAL SECTION */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider mb-1 px-4">General</span>
          {(isLimited ? generalItems.filter(i => i.id === 'overview') : generalItems).map((item, index) => (
            <button
              key={index}
              onClick={() => { if (!item.disabled && onTabChange) onTabChange(item.id); }}
              disabled={item.disabled}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group ${
                item.disabled ? 'opacity-40 cursor-not-allowed' : ''
              } ${
                item.active 
                ? 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border border-[rgba(34,197,94,0.3)] shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                : 'text-[#B3B3B3] hover:text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
              }`}
            >
              <span className={item.active ? 'text-[#22C55E]' : 'text-[#6B6B6B] group-hover:text-[#B3B3B3]'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* SERVIDOR SECTION */}
        {!isLimited && (
           <div className="flex flex-col gap-1">
             <span className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider mb-1 px-4">Servidor</span>
             {serverItems.map((item, index) => (
               <button
                 key={index}
                 onClick={() => { if (!item.disabled && onTabChange) onTabChange(item.id); }}
                 disabled={item.disabled}
                 className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group ${
                   item.disabled ? 'opacity-40 cursor-not-allowed' : ''
                 } ${
                   item.active 
                   ? 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border border-[rgba(34,197,94,0.3)] shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                   : 'text-[#B3B3B3] hover:text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
                 }`}
               >
                 <span className={item.active ? 'text-[#22C55E]' : 'text-[#6B6B6B] group-hover:text-[#B3B3B3]'}>{item.icon}</span>
                 {item.label}
               </button>
             ))}
           </div>
        )}

        {/* CUENTA SECTION */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider mb-1 px-4">Cuenta</span>
          {accountItems.map((item, index) => (
            <button
              key={index}
              onClick={() => { if (!item.disabled && onTabChange) onTabChange(item.id); }}
              disabled={item.disabled}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group ${
                item.disabled ? 'opacity-40 cursor-not-allowed' : ''
              } ${
                item.active 
                ? 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border border-[rgba(34,197,94,0.3)] shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                : 'text-[#B3B3B3] hover:text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
              }`}
            >
              <span className={item.active ? 'text-[#22C55E]' : 'text-[#6B6B6B] group-hover:text-[#B3B3B3]'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {viewState === 'dashboard' && (
          <div className="pt-4 mt-2 border-t border-[#2A2A2A]">
            <button
               onClick={onCreateServer ? onCreateServer : () => navigate('/configurar?plan=6gb&billing=monthly')}
               className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-sm bg-white hover:bg-white/90 text-black shadow-lg"
            >
              Nuevo Servidor
            </button>
          </div>
        )}
      </div>

      <div className="p-4 mt-auto border-t border-[#2A2A2A]">
        <div className="flex flex-col gap-3 px-2 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#171717] border border-[#2A2A2A] flex items-center justify-center text-[#FFFFFF] font-bold text-sm">
              {(user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-[#FFFFFF] text-sm font-semibold truncate max-w-[120px]">
                 {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Minelab User'}
              </span>
              <span className="text-[#6B6B6B] text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5">
                {isOwner && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[8px] tracking-widest">OWNER</span>
                )}
                {planStatus === 'none' ? (isOwner ? 'Acceso Total' : 'Sin Plan Activo') : planStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <button 
            onClick={async () => {
              localStorage.removeItem('minelab-forced-token');
              await supabase.auth.signOut();
              navigate('/');
            }}
            className="w-full text-xs text-center py-2 rounded-lg bg-[#2A2A2A] hover:bg-red-500/20 hover:text-red-400 text-[#B3B3B3] transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
