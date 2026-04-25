import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { DatabaseBackup, Plus, RotateCcw, Trash2, Loader2, AlertTriangle, Shield } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://api.fluxoai.co';

const fmtSize = (b) => {
  if (!b) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0, n = b;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(1)} ${u[i]}`;
};
const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return iso; }
};

const BackupsView = ({ server }) => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(null); // 'create' | 'restore:<id>' | 'delete:<id>' | null
  const [progressMsg, setProgressMsg] = useState(null);

  const reload = useCallback(async () => {
    if (!server?.id) return;
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${API}/api/backups?server_id=${server.id}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setBackups(data.backups || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [server?.id]);

  useEffect(() => { reload(); }, [reload]);

  // Subscribe to workflow_progress so UI reflects backup progress in real time
  useEffect(() => {
    if (!server?.id) return;
    const ch = supabase
      .channel(`backup-progress-${server.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'workflow_progress', filter: `server_id=eq.${server.id}` },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          if (row.workflow_type !== 'backup_create' && row.workflow_type !== 'backup_restore') return;
          setProgressMsg(row.message || null);
          if (row.status === 'completed') {
            setTimeout(() => { setProgressMsg(null); setBusy(null); reload(); }, 800);
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [server?.id, reload]);

  const createBackup = async () => {
    if (!server?.id || busy) return;
    setBusy('create');
    setProgressMsg('Iniciando backup...');
    try {
      const r = await fetch(`${API}/webhook/backup/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: server.id }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
    } catch (e) {
      setErr(e.message);
      setBusy(null);
      setProgressMsg(null);
    }
  };

  const restore = async (backup_id) => {
    if (!server?.id || busy) return;
    const ok = window.confirm(
      `¿Restaurar el backup ${backup_id}?\n\nEl servidor se parará y se sobrescribirá el mundo actual.\nSe crea una copia automática pre-restauración por seguridad.`
    );
    if (!ok) return;
    setBusy(`restore:${backup_id}`);
    setProgressMsg('Parando servidor y restaurando...');
    try {
      const r = await fetch(`${API}/webhook/backup/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: server.id, backup_id }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
    } catch (e) {
      setErr(e.message);
      setBusy(null);
      setProgressMsg(null);
    }
  };

  const del = async (backup_id) => {
    if (!server?.id || busy) return;
    const ok = window.confirm(`¿Borrar definitivamente el backup ${backup_id}? No se puede deshacer.`);
    if (!ok) return;
    setBusy(`delete:${backup_id}`);
    try {
      const r = await fetch(`${API}/api/backups/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_MC_API_KEY,
        },
        body: JSON.stringify({ server_id: server.id, backup_id }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await reload();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#171717] p-2.5 rounded-lg border border-[#2A2A2A]">
            <DatabaseBackup size={20} className="text-accent-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#E5E5E5]">Backups</h1>
            <p className="text-[#6B6B6B] text-sm">Copias de seguridad del mundo y la configuración</p>
          </div>
        </div>
        <button
          onClick={createBackup}
          disabled={!!busy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-green text-black font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy === 'create' ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Crear backup
        </button>
      </div>

      {progressMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" />{progressMsg}
        </div>
      )}
      {err && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle size={14} /> {err}
        </div>
      )}

      <div className="bg-[#171717] border border-[#2A2A2A] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center text-[#6B6B6B]">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : backups.length === 0 ? (
          <div className="py-16 text-center">
            <DatabaseBackup size={32} className="text-[#3A3A3A] mx-auto mb-3" />
            <p className="text-[#B3B3B3] text-sm">Aún no hay backups.</p>
            <p className="text-[#6B6B6B] text-xs mt-1">Crea el primero con el botón de arriba.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-[#6B6B6B] text-xs uppercase tracking-wider">
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left px-4 py-3 font-bold">ID</th>
                <th className="text-left px-4 py-3 font-bold">Fecha</th>
                <th className="text-left px-4 py-3 font-bold">Tamaño</th>
                <th className="text-left px-4 py-3 font-bold">Tipo</th>
                <th className="text-right px-4 py-3 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {backups.map(b => (
                <tr key={b.backup_id} className="border-b border-[#2A2A2A] last:border-0 hover:bg-[#1A1A1A]">
                  <td className="px-4 py-3 text-[#E5E5E5] font-mono text-xs">{b.backup_id}</td>
                  <td className="px-4 py-3 text-[#B3B3B3]">{fmtDate(b.created_at)}</td>
                  <td className="px-4 py-3 text-[#B3B3B3]">{fmtSize(b.size_bytes)}</td>
                  <td className="px-4 py-3">
                    {b.auto ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold tracking-widest">
                        <Shield size={10} /> Pre-restore
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase bg-[#2A2A2A] text-[#B3B3B3] font-bold tracking-widest">
                        Manual
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => restore(b.backup_id)}
                        disabled={!!busy}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-[#E5E5E5] text-xs font-bold hover:bg-[#3A3A3A] disabled:opacity-50"
                      >
                        {busy === `restore:${b.backup_id}` ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                        Restaurar
                      </button>
                      <button
                        onClick={() => del(b.backup_id)}
                        disabled={!!busy}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {busy === `delete:${b.backup_id}` ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-[#6B6B6B] text-xs mt-4">
        Los backups incluyen el mundo, <code className="text-[#B3B3B3]">server.properties</code>,
        listas de ops/whitelist/bans y la carpeta de plugins. No se incluyen los JARs
        (se pueden reinstalar) ni logs.
      </p>
    </div>
  );
};

export default BackupsView;
