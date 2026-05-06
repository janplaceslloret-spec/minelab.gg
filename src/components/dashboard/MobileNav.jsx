import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Terminal, FolderOpen, Users, Settings, DatabaseBackup,
  History, Puzzle, Wrench, Package, Star, LogOut, MoreHorizontal, X,
  ChevronDown, Play, RotateCw, Square, Plus
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

/**
 * Navegación móvil para el panel.
 * - Bottom fixed bar con 4 tabs principales (Dashboard, Consola, Catálogo, Más)
 * - El botón "Más" abre un drawer full-screen con todas las tabs + control del server + perfil
 * - Solo visible en md:hidden — el sidebar desktop se mantiene intacto en md+
 */
const MobileNav = ({
  viewState = 'dashboard', planStatus = 'none', activeTab = 'overview', onTabChange,
  user, server, sharedServers = [], onSwitchServer, onServerAction, isActionLoading,
  memberRole = 'owner', isOwner = false, allOwnerServers = [], onCreateServer,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [serverPickerOpen, setServerPickerOpen] = useState(false);
  const navigate = useNavigate();

  // Bloquear scroll del body cuando drawer abierto
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [drawerOpen]);

  const status = server?.status_server || 'offline';
  const canStart = status === 'stopped' || status === 'error' || status === 'offline';
  const canStop = status === 'running';
  const canRestart = status === 'running';

  const effectiveRole = isOwner ? 'owner' : memberRole;
  const canAccessFiles = effectiveRole === 'owner' || effectiveRole === 'admin';
  const canControlServer = effectiveRole === 'owner' || effectiveRole === 'admin' || effectiveRole === 'member';

  const serverType = String(server?.server_type || '').toLowerCase();
  const isPaperLike = ['paper', 'spigot', 'vanilla'].includes(serverType);
  const isModded = ['fabric', 'forge', 'neoforge'].includes(serverType);

  // Catalog tab dinámica según server type (1 sola tab inteligente para bottom nav)
  const catalogTab = isPaperLike
    ? { id: 'plugins', label: 'Plugins', icon: <Puzzle size={20} /> }
    : isModded
    ? { id: 'mods', label: 'Mods', icon: <Wrench size={20} /> }
    : { id: 'files', label: 'Archivos', icon: <FolderOpen size={20} /> };

  // Bottom nav: 4 slots (Dashboard, Consola, Catalog dinámica, Más)
  const bottomTabs = [
    { id: 'overview', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
    { id: 'console', label: 'Consola', icon: <Terminal size={20} /> },
    catalogTab,
    { id: '__more__', label: 'Más', icon: <MoreHorizontal size={20} />, isMore: true },
  ];

  const isLimited = viewState !== 'dashboard' || (planStatus === 'none' && sharedServers.length === 0);

  // Lista completa de tabs para el drawer
  const drawerSections = isLimited ? [] : [
    {
      title: 'Servidor',
      items: [
        { icon: <FolderOpen size={20} />, label: 'Archivos', id: 'files', hidden: !canAccessFiles },
        { icon: <Users size={20} />, label: 'Jugadores', id: 'players', hidden: !canAccessFiles },
        { icon: <Settings size={20} />, label: 'Configuración', id: 'configuracion', hidden: !canAccessFiles },
        { icon: <DatabaseBackup size={20} />, label: 'Backups', id: 'backups', hidden: !canAccessFiles },
        { icon: <History size={20} />, label: 'Historial IA', id: 'historial', hidden: !canAccessFiles },
        { icon: <Puzzle size={20} />, label: 'Plugins', id: 'plugins', hidden: !isPaperLike },
        { icon: <Wrench size={20} />, label: 'Mods', id: 'mods', hidden: !isModded },
        { icon: <Package size={20} />, label: 'Modpacks', id: 'modpacks', hidden: !isModded },
      ].filter(i => !i.hidden),
    },
    {
      title: 'Cuenta',
      items: [
        { icon: <Settings size={20} />, label: 'Ajustes', id: 'settings' },
        { icon: <Star size={20} />, label: 'Dejar reseña', id: 'review' },
      ],
    },
  ];

  // Para owner: lista completa de servers; para user normal: own + shared
  const allServers = isOwner && allOwnerServers.length > 0
    ? allOwnerServers.map(s => ({ ...s, _own: s.id === server?.id }))
    : [
        ...(server ? [{ ...server, _own: true }] : []),
        ...sharedServers.filter(s => s.id !== server?.id).map(s => ({ ...s, _own: false })),
      ];

  return (
    <>
      {/* Bottom fixed nav bar — solo visible en mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0F0F0F]/95 backdrop-blur-xl border-t border-white/10 flex items-stretch safe-bottom">
        {bottomTabs.map((tab) => {
          const isActive = !tab.isMore && activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.isMore) setDrawerOpen(true);
                else {
                  onTabChange?.(tab.id);
                  setDrawerOpen(false);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 transition-all active:scale-95 ${
                isActive ? 'text-[#22C55E]' : 'text-white/60 hover:text-white/90'
              }`}
            >
              <span className={isActive ? 'drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]' : ''}>{tab.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Drawer "Más" — full-screen overlay */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-[55] bg-[#0F0F0F] flex flex-col animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
            <span className="font-heading font-extrabold text-2xl tracking-tighter text-white uppercase">MENÚ</span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Cerrar"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95"
            >
              <X size={22} strokeWidth={2.4} />
            </button>
          </div>

          {/* Server info + switcher + actions */}
          {!isLimited && server && (
            <div className="px-5 py-4 border-b border-white/10 flex flex-col gap-3">
              {/* Role / OWNER badge */}
              {isOwner ? (
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold tracking-widest bg-emerald-500/10 border-emerald-500/30 text-emerald-400">Owner View</span>
                </div>
              ) : memberRole !== 'owner' && (
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold tracking-widest ${
                    memberRole === 'admin' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    memberRole === 'member' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                    'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                  }`}>{memberRole === 'admin' ? 'Admin' : memberRole === 'member' ? 'Miembro' : 'Espectador'}</span>
                </div>
              )}

              {/* Server name + switcher */}
              <button
                type="button"
                onClick={() => allServers.length > 1 && setServerPickerOpen(o => !o)}
                className={`w-full flex items-center justify-between gap-2 text-left ${allServers.length > 1 ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="text-white text-base font-bold truncate uppercase tracking-tight">{server.server_name || 'Servidor'}</span>
                  <span className="text-white/50 font-mono text-[11px] tracking-widest">{server.slug ? `${server.slug}.minelab.gg` : (server.ip ? `${server.ip}:${server.port}` : 'IP PENDIENTE')}</span>
                </div>
                {allServers.length > 1 && (
                  <ChevronDown size={16} className={`text-white/60 shrink-0 transition-transform ${serverPickerOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Server picker (mobile) */}
              {serverPickerOpen && allServers.length > 1 && (
                <div className="mt-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                  {allServers.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { onSwitchServer?.(s); setServerPickerOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${s.id === server.id ? 'bg-[#22C55E]/5' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${s.status_server === 'running' ? 'bg-[#22C55E]' : 'bg-white/20'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{s.server_name || 'Servidor'}</p>
                        <p className="text-[10px] text-white/40 truncate">{s.ip ? `${s.ip}:${s.port}` : '—'}</p>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setDrawerOpen(false); navigate('/configurar?plan=6gb&billing=monthly'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-t border-white/10"
                  >
                    <Plus size={16} className="text-[#22C55E]" />
                    <span className="text-[#22C55E] text-sm font-bold uppercase">Añadir servidor</span>
                  </button>
                </div>
              )}

              {/* START / RESTART / STOP */}
              {canControlServer && (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onServerAction?.('start')}
                    disabled={!canStart || isActionLoading}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                      canStart && !isActionLoading
                        ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 active:scale-95'
                        : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                    }`}
                  ><Play size={14} /> Start</button>
                  <button
                    onClick={() => onServerAction?.('restart')}
                    disabled={!canRestart || isActionLoading}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                      canRestart && !isActionLoading
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 active:scale-95'
                        : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                    }`}
                  ><RotateCw size={14} /> Restart</button>
                  <button
                    onClick={() => onServerAction?.('stop')}
                    disabled={!canStop || isActionLoading}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                      canStop && !isActionLoading
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30 active:scale-95'
                        : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                    }`}
                  ><Square size={14} /> Stop</button>
                </div>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
            {drawerSections.map(section => (
              <div key={section.title} className="flex flex-col gap-1">
                <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] px-2 mb-1">{section.title}</p>
                {section.items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { onTabChange?.(item.id); setDrawerOpen(false); }}
                      className={`flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all font-medium text-sm active:scale-[0.98] ${
                        isActive
                          ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30'
                          : 'text-white/80 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className={isActive ? 'text-[#22C55E]' : 'text-white/60'}>{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Crear nuevo servidor */}
            {!isLimited && (
              <button
                type="button"
                onClick={() => { setDrawerOpen(false); onCreateServer ? onCreateServer() : navigate('/configurar?plan=6gb&billing=monthly'); }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black font-heading font-black uppercase tracking-tight text-sm active:scale-[0.98] transition-all"
              >
                <Plus size={18} strokeWidth={2.5} /> Nuevo servidor
              </button>
            )}
          </div>

          {/* Profile + logout */}
          <div className="px-5 pt-3 pb-5 border-t border-white/10 bg-[#0F0F0F] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold">
              {(user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}</p>
              <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5">
                {isOwner && <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[8px] tracking-widest">OWNER</span>}
                {planStatus === 'none' ? (isOwner ? 'Acceso Total' : 'Sin Plan') : planStatus.replace(/_/g, ' ')}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                localStorage.removeItem('minelab-forced-token');
                await supabase.auth.signOut();
                setDrawerOpen(false);
                navigate('/');
              }}
              aria-label="Cerrar sesión"
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/70 border border-white/10 flex items-center justify-center transition-all active:scale-95"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
