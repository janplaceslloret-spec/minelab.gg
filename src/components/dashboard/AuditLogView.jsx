import React, { useEffect, useState } from 'react';
import { History, RefreshCw, Loader2, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const TOOL_LABELS = {
  CHANGE_VERSION: 'Cambio de versión',
  INSTALL_PLUGIN: 'Instalar plugin',
  UNINSTALL_PLUGIN: 'Desinstalar plugin',
  INSTALL_MODS: 'Instalar mods',
  INSTALL_MODPACK: 'Instalar modpack',
  UNINSTALL_MOD: 'Desinstalar mod',
  CONSOLA: 'Comando consola',
  READ_LOG: 'Leer log',
  PLAYER_MANAGEMENT: 'Gestión jugadores',
  APAGAR_ENCENDER_REINICIAR: 'Estado del servidor',
  UPDATE_SERVER_CONFIG: 'Editar config',
  EDIT_PLUGIN_CONFIG: 'Editar config plugin',
  SETUP_RANKS: 'Configurar rangos',
  DIAGNOSE_AND_FIX: 'Diagnóstico',
  DELETE_WORLD: 'Borrar mundo',
};

function timeAgo(iso) {
  if (!iso) return '—';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `hace ${s}s`;
  if (s < 3600) return `hace ${Math.floor(s / 60)}m`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)}h`;
  return `hace ${Math.floor(s / 86400)}d`;
}

const Row = ({ action, expanded, onToggle }) => {
  const label = TOOL_LABELS[action.tool] || action.tool;
  return (
    <div className={`border-b border-[#2A2A2A] last:border-0 ${expanded ? 'bg-[#1A1A1A]' : 'hover:bg-[#161616]'} transition-colors`}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left"
      >
        {action.ok ? (
          <CheckCircle2 size={14} className="text-[#22C55E] shrink-0" />
        ) : (
          <XCircle size={14} className="text-red-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold truncate">{label}</p>
          <p className="text-[#6B6B6B] text-[11px] mt-0.5">{timeAgo(action.created_at)} · <code className="text-[#8B8B8B]">{action.tool}</code></p>
        </div>
        <ChevronDown size={14} className={`text-[#6B6B6B] transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {action.args && (
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider mb-1">Argumentos</p>
              <pre className="text-[11px] text-[#B3B3B3] bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-2 overflow-x-auto">{JSON.stringify(action.args, null, 2)}</pre>
            </div>
          )}
          {action.result && (
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider mb-1">Resultado</p>
              <pre className="text-[11px] text-[#B3B3B3] bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-2 overflow-x-auto whitespace-pre-wrap break-words max-h-40 overflow-y-auto">{action.result}</pre>
            </div>
          )}
          <p className="text-[10px] text-[#4B4B4B]">{new Date(action.created_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default function AuditLogView({ server }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    if (!server?.id) return;
    setLoading(true);
    setError(null);
    try {
      // Read directly from Supabase with RLS — owner only sees their server's actions
      const { data, error: err } = await supabase
        .from('agent_actions')
        .select('*')
        .eq('server_id', server.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (err) {
        // Si la tabla no existe, mostramos un mensaje suave
        if (err.code === 'PGRST205' || /does not exist/i.test(err.message || '')) {
          setError('historial');
        } else {
          setError(err.message);
        }
        setActions([]);
      } else {
        setActions(data || []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [server?.id]);

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#FFFFFF] text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <History className="text-[#22C55E]" size={24} /> Historial de acciones
          </h2>
          <p className="text-[#B3B3B3] text-sm mt-1">
            Todas las acciones que el asistente IA ha ejecutado en tu servidor.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#B3B3B3] text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Refrescar
        </button>
      </div>

      <div className="bg-[#171717] border border-[#2A2A2A] rounded-xl overflow-hidden">
        {loading && actions.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-[#6B6B6B]">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-sm">Cargando historial…</span>
          </div>
        ) : error === 'historial' ? (
          <div className="px-6 py-12 text-center">
            <History size={32} className="text-[#6B6B6B] mx-auto mb-3 opacity-50" />
            <p className="text-[#B3B3B3] text-sm font-medium">Sistema de historial inicializándose</p>
            <p className="text-[#6B6B6B] text-xs mt-2 max-w-md mx-auto">
              El registro de acciones del asistente estará disponible en breve. Mientras tanto, puedes ver lo que hace el asistente directamente en el chat.
            </p>
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <XCircle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-300 text-sm">No se pudo cargar el historial</p>
            <p className="text-[#6B6B6B] text-xs mt-2 max-w-md mx-auto">{String(error).slice(0, 200)}</p>
          </div>
        ) : actions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <History size={32} className="text-[#6B6B6B] mx-auto mb-3 opacity-50" />
            <p className="text-[#B3B3B3] text-sm font-medium">Aún no hay acciones registradas</p>
            <p className="text-[#6B6B6B] text-xs mt-2">Pide algo al asistente IA y aparecerá aquí.</p>
          </div>
        ) : (
          <div>
            {actions.map((a) => (
              <Row
                key={a.id}
                action={a}
                expanded={expandedId === a.id}
                onToggle={() => setExpandedId(expandedId === a.id ? null : a.id)}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-[#6B6B6B] text-xs">
        Solo verás las últimas 50 acciones. Para auditoría completa, contacta soporte.
      </p>
    </div>
  );
}
