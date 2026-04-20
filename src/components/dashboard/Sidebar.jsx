import React from 'react';
import { LayoutDashboard, Terminal, FolderOpen, Blocks, Users, DatabaseBackup, Settings, LogOut, Star } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ viewState = 'dashboard', planStatus = 'none', onCreateServer, activeTab = 'overview', onTabChange, user, server, onServerAction, isActionLoading }) => {
  const status = server?.status_server || 'offline';
  const canStart = status === 'stopped' || status === 'error' || status === 'offline';
  const canStop = status === 'running';
  const canRestart = status === 'running';
  
  const navigate = useNavigate();

  const generalItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: activeTab === 'overview', id: 'overview' },
    { icon: <Terminal size={20} />, label: 'Consola', active: activeTab === 'console', id: 'console' },
  ];

  const serverItems = [
    { icon: <FolderOpen size={20} />, label: 'Archivos', active: activeTab === 'files', id: 'files' },
    { icon: <Users size={20} />, label: 'Jugadores', active: activeTab === 'players', id: 'players' },
    { icon: <Settings size={20} />, label: 'Configuración', active: activeTab === 'configuracion', id: 'configuracion' },
    { icon: <DatabaseBackup size={20} />, label: 'Backups', active: activeTab === 'backups', id: 'backups', disabled: true },
  ];

  const accountItems = [
    { icon: <Settings size={20} />, label: 'Ajustes', active: activeTab === 'settings', id: 'settings' },
    { icon: <Star size={20} />, label: 'Dejar reseña', active: activeTab === 'review', id: 'review' },
  ];

  // If viewState is wizard or there is no plan, limit the exposed items.
  const isLimited = viewState !== 'dashboard' || planStatus === 'none';

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
            <div className="flex flex-col gap-0.5">
               <span className="text-white text-sm font-bold truncate uppercase tracking-tight">{server.server_name || "Servidor"}</span>
               <span className="text-[#6B6B6B] font-mono text-[10px] tracking-widest">{server.ip ? `${server.ip}:${server.port}` : "IP PENDIENTE"}</span>
            </div>
            
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
               onClick={onCreateServer ? onCreateServer : () => navigate('/panel?wizard=true')}
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
              <span className="text-[#6B6B6B] text-[10px] uppercase tracking-wider font-bold">
                {planStatus === 'none' ? 'Sin Plan Activo' : planStatus.replace(/_/g, ' ')}
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
