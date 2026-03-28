import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Users, RefreshCw, Crown, ShieldOff, Wifi, WifiOff,
  UserX, UserCheck, ShieldX, X, Clock, ChevronRight,
  LogIn, LogOut, AlertCircle, Loader2
} from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

/* ─── Player Detail Modal ─── */
const PlayerModal = ({ player, server, onClose, onAction }) => {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [actionState, setActionState] = useState({});

  useEffect(() => {
    if (!player || !server?.id) return;
    setHistoryLoading(true);
    supabase
      .from('server_activity')
      .select('*')
      .eq('server_id', server.id)
      .in('type', ['player_join', 'player_leave'])
      .eq('player', player.name)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setHistory(data || []);
        setHistoryLoading(false);
      });
  }, [player, server?.id]);

  const handleAction = async (action) => {
    setActionState(prev => ({ ...prev, [action]: 'loading' }));
    try {
      const res = await fetch(`${API_BASE}/servers/${server.id}/player-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: player.name, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setActionState(prev => ({ ...prev, [action]: 'ok' }));
      setTimeout(() => {
        setActionState(prev => { const n = { ...prev }; delete n[action]; return n; });
        onAction(); // refresh parent list
      }, 1500);
    } catch (err) {
      setActionState(prev => ({ ...prev, [action]: 'err' }));
      setTimeout(() => setActionState(prev => { const n = { ...prev }; delete n[action]; return n; }), 2000);
    }
  };

  const ActionBtn = ({ action, label, color }) => {
    const state = actionState[action];
    const colors = {
      green: 'bg-green-500/10 text-green-400 border-green-500/25 hover:bg-green-500/20',
      red: 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20',
      yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25 hover:bg-yellow-500/20',
    };
    const feedbackClass = state === 'ok'
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : state === 'err'
        ? 'bg-red-500/20 text-red-400 border-red-500/30'
        : colors[color] || colors.green;

    return (
      <button
        onClick={() => handleAction(action)}
        disabled={!!state}
        className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${feedbackClass}`}
      >
        {state === 'loading' && <Loader2 size={12} className="animate-spin" />}
        {state === 'ok' ? '✓ Ejecutado' : state === 'err' ? '✗ Error' : label}
      </button>
    );
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const lastSeen = history.find(h => h.type === 'player_leave' || h.type === 'player_join');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[#0F0F0F] border border-[#2A2A2A] rounded-2xl flex flex-col overflow-hidden shadow-2xl max-h-[85vh]"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fadeScaleIn 0.18s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A]">
          <span className="text-[#6B6B6B] text-xs font-bold uppercase tracking-wider">Jugador</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[#6B6B6B] hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Player Card */}
        <div className="px-6 py-6 flex items-start gap-4 border-b border-[#2A2A2A]">
          <div className="relative">
            <img
              src={player.skinUrl}
              alt={player.name}
              className={`w-16 h-16 rounded-xl border border-[#2A2A2A] ${!player.online ? 'grayscale opacity-60' : ''}`}
              onError={e => { e.target.src = 'https://mc-heads.net/avatar/steve'; }}
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0F0F0F] ${player.online ? 'bg-[#22C55E]' : 'bg-[#4B4B4B]'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white text-xl font-extrabold">{player.name}</h2>
              {player.op && (
                <span className="px-1.5 py-0.5 rounded bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 text-[9px] font-bold flex items-center gap-0.5">
                  <Crown size={8} /> OP
                </span>
              )}
              {player.banned && (
                <span className="px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/25 text-red-400 text-[9px] font-bold flex items-center gap-0.5">
                  <ShieldOff size={8} /> BAN
                </span>
              )}
            </div>
            <p className="text-[#6B6B6B] font-mono text-[10px] truncate mb-2">{player.uuid}</p>
            <div className="flex items-center gap-2">
              {player.online ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold">
                  <Wifi size={9} /> ONLINE AHORA
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#6B6B6B] text-[10px] font-bold">
                  <WifiOff size={9} /> OFFLINE
                </span>
              )}
              {lastSeen && (
                <span className="text-[#6B6B6B] text-[10px] flex items-center gap-1">
                  <Clock size={9} />
                  {formatDate(lastSeen.created_at)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-b border-[#2A2A2A]">
          <p className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider mb-3">Acciones</p>
          <div className="grid grid-cols-3 gap-2">
            {player.online && <ActionBtn action="kick" label="⚡ Kick" color="yellow" />}
            {!player.banned
              ? <ActionBtn action="ban" label="🔨 Ban" color="red" />
              : <ActionBtn action="pardon" label="✅ Unban" color="green" />
            }
            {!player.op
              ? <ActionBtn action="op" label="⭐ OP" color="green" />
              : <ActionBtn action="deop" label="↩ DeOP" color="yellow" />
            }
          </div>
        </div>

        {/* Activity History */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider mb-3">
            Historial de conexiones
          </p>

          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#22C55E]/30 border-t-[#22C55E] rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock size={24} className="text-[#2A2A2A] mb-2" />
              <p className="text-[#6B6B6B] text-sm">Sin historial registrado</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {history.map(ev => (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#171717] border border-[#2A2A2A]"
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    ev.type === 'player_join'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {ev.type === 'player_join' ? <LogIn size={11} /> : <LogOut size={11} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#E5E5E5] text-xs font-medium">
                      {ev.type === 'player_join' ? 'Se unió al servidor' : 'Salió del servidor'}
                    </p>
                    <p className="text-[#6B6B6B] text-[10px]">{formatDate(ev.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

/* ─── Main Players View ─── */
const PlayersView = ({ server }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  // metrics-based online player names
  const [onlineFromMetrics, setOnlineFromMetrics] = useState(new Set());

  // Fetch online player list from latest server_metrics players_online count
  // and from server_activity to identify who's currently online
  useEffect(() => {
    if (!server?.id) return;

    const fetchOnline = async () => {
      // Get recent join/leave pairs to determine who's online
      const { data } = await supabase
        .from('server_activity')
        .select('type, player, created_at')
        .eq('server_id', server.id)
        .in('type', ['player_join', 'player_leave'])
        .order('created_at', { ascending: false })
        .limit(100);

      if (!data) return;

      // Build online set: if most recent event per player is 'player_join', they're online
      const latestByPlayer = {};
      for (const ev of data) {
        if (ev.player && !latestByPlayer[ev.player]) {
          latestByPlayer[ev.player] = ev.type;
        }
      }

      const onlineSet = new Set(
        Object.entries(latestByPlayer)
          .filter(([, type]) => type === 'player_join')
          .map(([name]) => name)
      );
      setOnlineFromMetrics(onlineSet);
    };

    fetchOnline();

    // Re-check every 15 seconds
    const interval = setInterval(fetchOnline, 15000);
    return () => clearInterval(interval);
  }, [server?.id]);

  const fetchPlayers = useCallback(async () => {
    if (!server?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/servers/${server.id}/players`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPlayers(data.players || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [server?.id]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Merge online status from Supabase activity
  const enrichedPlayers = players.map(p => ({
    ...p,
    online: onlineFromMetrics.has(p.name) || p.online,
  }));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#22C55E]/30 border-t-[#22C55E] rounded-full animate-spin" />
          <span className="text-[#6B6B6B] text-sm">Cargando jugadores...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle size={32} className="text-red-400/50" />
          <p className="text-[#E5E5E5] font-medium">Error al cargar jugadores</p>
          <p className="text-[#6B6B6B] text-sm max-w-xs">{error}</p>
          <button
            onClick={fetchPlayers}
            className="mt-2 px-4 py-2 rounded-lg bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 text-sm font-bold hover:bg-[#22C55E]/20 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const onlineCount = enrichedPlayers.filter(p => p.online).length;

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-extrabold uppercase tracking-tight">Jugadores</h2>
            <p className="text-[#6B6B6B] text-xs mt-0.5">
              <span className="text-[#22C55E] font-bold">{onlineCount}</span> online · {enrichedPlayers.length} total
            </p>
          </div>
          <button
            onClick={fetchPlayers}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#171717] border border-[#2A2A2A] text-[#B3B3B3] hover:text-white hover:border-[#3A3A3A] transition-all text-xs font-bold"
          >
            <RefreshCw size={12} />
            Actualizar
          </button>
        </div>

        {enrichedPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-16 bg-[#171717] border border-dashed border-[#2A2A2A] rounded-xl">
            <Users size={32} className="text-[#2A2A2A] mb-3" />
            <p className="text-[#E5E5E5] font-medium mb-1">Sin jugadores registrados</p>
            <p className="text-[#6B6B6B] text-sm">Cuando alguien se una al servidor aparecerá aquí.</p>
          </div>
        ) : (
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[48px_1fr_110px_130px_28px] items-center px-4 py-3 border-b border-[#2A2A2A] bg-[#121212]">
              <div />
              <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Jugador</span>
              <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Estado</span>
              <span className="text-[#6B6B6B] text-[10px] font-bold uppercase tracking-wider">Roles</span>
              <div />
            </div>

            {enrichedPlayers.map((player, i) => (
              <div
                key={player.uuid || player.name}
                onClick={() => setSelectedPlayer(player)}
                className={`grid grid-cols-[48px_1fr_110px_130px_28px] items-center px-4 py-3 gap-2 cursor-pointer transition-colors ${
                  i < enrichedPlayers.length - 1 ? 'border-b border-[#2A2A2A]' : ''
                } ${player.online ? 'hover:bg-white/[0.04]' : 'hover:bg-white/[0.02] opacity-80'}`}
              >
                {/* Avatar */}
                <div className="relative flex items-center justify-center">
                  <img
                    src={player.skinUrl}
                    alt={player.name}
                    className={`w-9 h-9 rounded-md border border-[#2A2A2A] ${!player.online ? 'grayscale opacity-60' : ''}`}
                    onError={e => { e.target.src = 'https://mc-heads.net/avatar/steve'; }}
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#171717] ${player.online ? 'bg-[#22C55E]' : 'bg-[#4B4B4B]'}`} />
                </div>

                {/* Name + UUID */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[#E5E5E5] font-bold text-sm truncate">{player.name}</span>
                  <span className="text-[#6B6B6B] font-mono text-[9px] truncate">{player.uuid}</span>
                </div>

                {/* Online status */}
                <div>
                  {player.online ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold">
                      <Wifi size={9} /> ONLINE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#6B6B6B] text-[10px] font-bold">
                      <WifiOff size={9} /> OFFLINE
                    </span>
                  )}
                </div>

                {/* Roles badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {player.op && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 text-[9px] font-bold">
                      <Crown size={8} /> OP
                    </span>
                  )}
                  {player.banned && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/25 text-red-400 text-[9px] font-bold">
                      <ShieldOff size={8} /> BAN
                    </span>
                  )}
                </div>

                {/* Arrow hint */}
                <ChevronRight size={14} className="text-[#3A3A3A]" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={enrichedPlayers.find(p => p.name === selectedPlayer.name) || selectedPlayer}
          server={server}
          onClose={() => setSelectedPlayer(null)}
          onAction={() => {
            setSelectedPlayer(null);
            fetchPlayers();
          }}
        />
      )}
    </>
  );
};

export default PlayersView;
