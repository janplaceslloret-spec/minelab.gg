import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Wrench } from 'lucide-react';
import { supabase } from '../../supabaseClient';

/**
 * Banner proactivo de incidencias.
 * Suscrito a server_incidents (RLS owner-only) por server_id.
 *
 * SAFETY: el watchdog del agente sólo INSERTa incidencias. Cualquier
 * acción correctiva pasa por este botón ("Sí, arréglalo"), que envía
 * un mensaje sintético al chat — el LLM decide qué tool llamar.
 */
const SEVERITY_STYLES = {
  crit: 'border-red-500/40 bg-red-500/10 text-red-300',
  warn: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200',
  info: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
};

const IncidentBanner = ({ activeServer, onFixRequest }) => {
  const [incidents, setIncidents] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!activeServer?.id) return;

    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from('server_incidents')
        .select('*')
        .eq('server_id', activeServer.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      if (!cancelled && data) setIncidents(data);
    };
    load();

    const channel = supabase
      .channel(`incidents-${activeServer.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'server_incidents',
          filter: `server_id=eq.${activeServer.id}`,
        },
        (payload) => {
          const row = payload.new || payload.old;
          if (!row) return;
          setIncidents((prev) => {
            const without = prev.filter((i) => i.id !== row.id);
            if (payload.eventType === 'DELETE') return without;
            if (payload.new?.status === 'open') return [payload.new, ...without];
            return without;
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [activeServer?.id]);

  if (!incidents.length) return null;

  const handleFix = async (incident) => {
    setBusyId(incident.id);
    try {
      await supabase
        .from('server_incidents')
        .update({ status: 'resolving' })
        .eq('id', incident.id);
      if (onFixRequest && incident.suggested_message) {
        onFixRequest(incident.suggested_message);
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDismiss = async (incident) => {
    setBusyId(incident.id);
    try {
      await supabase
        .from('server_incidents')
        .update({ status: 'dismissed', resolved_at: new Date().toISOString() })
        .eq('id', incident.id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="px-4 pt-3 flex flex-col gap-2">
      {incidents.map((inc) => {
        const cls = SEVERITY_STYLES[inc.severity] || SEVERITY_STYLES.info;
        const disabled = busyId === inc.id;
        return (
          <div
            key={inc.id}
            className={`border rounded-xl p-3 ${cls} text-sm flex flex-col gap-2`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold leading-tight">{inc.title}</div>
                {inc.description && (
                  <div className="text-xs opacity-90 mt-1">{inc.description}</div>
                )}
              </div>
              <button
                onClick={() => handleDismiss(inc)}
                disabled={disabled}
                className="opacity-60 hover:opacity-100 transition disabled:opacity-30"
                aria-label="Descartar"
              >
                <X size={14} />
              </button>
            </div>
            {inc.suggested_message && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFix(inc)}
                  disabled={disabled}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22C55E] text-[#0B0B0B] font-semibold text-xs hover:bg-[#16a34a] transition disabled:opacity-50"
                >
                  <Wrench size={12} /> Sí, arréglalo
                </button>
                <button
                  onClick={() => handleDismiss(inc)}
                  disabled={disabled}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:bg-white/5 transition disabled:opacity-50"
                >
                  Ahora no
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default IncidentBanner;
