import React, { useState, useEffect, useRef } from 'react';
import {
  Settings, RefreshCw, PowerOff, Power, Globe,
  Trash2, Loader2, CheckCircle2, XCircle, X, Search,
  ChevronRight, Check, ArrowRight, Gamepad2, Sparkles, AlertTriangle
} from 'lucide-react';

const WEBHOOK = 'https://snack55-n8n1.q7pa8v.easypanel.host/webhook/asistente';
const VERSION_WEBHOOK = 'https://api.fluxoai.co/webhook/cambiar-version';
const VERSIONS_API = 'https://api.fluxoai.co/api/versions';

const SOFTWARE = [
  {
    id: 'PAPER',
    label: 'Paper',
    description: 'Alto rendimiento, soporta plugins Bukkit/Spigot.',
    emoji: '📄',
    color: 'text-[#22C55E]',
    border: 'border-[#22C55E]/40',
    bg: 'bg-[#22C55E]/10',
    ring: 'ring-[#22C55E]/40',
    glow: 'shadow-[0_0_24px_rgba(34,197,94,0.18)]',
  },
  {
    id: 'FABRIC',
    label: 'Fabric',
    description: 'Framework ligero, ideal para mods modernos.',
    emoji: '🧵',
    color: 'text-purple-300',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
    ring: 'ring-purple-400/40',
    glow: 'shadow-[0_0_24px_rgba(168,85,247,0.18)]',
  },
  {
    id: 'FORGE',
    label: 'Forge',
    description: 'Estándar para mods complejos y modpacks.',
    emoji: '⚙️',
    color: 'text-orange-300',
    border: 'border-orange-500/40',
    bg: 'bg-orange-500/10',
    ring: 'ring-orange-400/40',
    glow: 'shadow-[0_0_24px_rgba(249,115,22,0.18)]',
  },
  {
    id: 'NEOFORGE',
    label: 'NeoForge',
    description: 'Fork moderno de Forge, mejor mantenido.',
    emoji: '🔥',
    color: 'text-rose-300',
    border: 'border-rose-500/40',
    bg: 'bg-rose-500/10',
    ring: 'ring-rose-400/40',
    glow: 'shadow-[0_0_24px_rgba(244,63,94,0.18)]',
  },
  {
    id: 'VANILLA',
    label: 'Vanilla',
    description: 'Servidor oficial Mojang, sin modificaciones.',
    emoji: '🟩',
    color: 'text-emerald-300',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-400/40',
    glow: 'shadow-[0_0_24px_rgba(16,185,129,0.18)]',
  },
];

/* ─── Session-level cache shared across modal opens ─── */
const versionsCache = new Map(); // softwareId -> { versions, fetchedAt }
const VERSIONS_TTL_MS = 30 * 60 * 1000; // 30 min in browser

/* ─── Version change modal ─── */
const VersionModal = ({ server, onClose }) => {
  const [selectedSoftware, setSelectedSoftware] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('idle');
  const [versionsBySw, setVersionsBySw] = useState({});  // softwareId -> string[]
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState(null);
  const abortRef = useRef(null);

  // Fetch versions when software changes
  useEffect(() => {
    if (!selectedSoftware) return;
    const swId = selectedSoftware;
    const cached = versionsCache.get(swId);
    const now = Date.now();
    if (cached && (now - cached.fetchedAt) < VERSIONS_TTL_MS) {
      setVersionsBySw(prev => ({ ...prev, [swId]: cached.versions }));
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setVersionsLoading(true);
    setVersionsError(null);
    fetch(`${VERSIONS_API}?software=${swId.toLowerCase()}`, { signal: ac.signal })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(j => {
        const list = Array.isArray(j.versions) ? j.versions : [];
        versionsCache.set(swId, { versions: list, fetchedAt: now });
        setVersionsBySw(prev => ({ ...prev, [swId]: list }));
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setVersionsError('No se pudo cargar la lista de versiones. Reintenta en unos segundos.');
      })
      .finally(() => {
        if (!ac.signal.aborted) setVersionsLoading(false);
      });
    return () => ac.abort();
  }, [selectedSoftware]);

  const allVersionsForSw = (selectedSoftware && versionsBySw[selectedSoftware]) || [];
  const versions = allVersionsForSw.filter(v => !search || v.toLowerCase().includes(search.toLowerCase()));

  const sw = SOFTWARE.find(s => s.id === selectedSoftware);

  const confirm = async () => {
    setState('loading');
    try {
      const res = await fetch(VERSION_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `CAMBIAR VERSION A ${selectedSoftware} ${selectedVersion}`,
          server_id: server?.id,
        }),
      });
      if (!res.ok) throw new Error();
      setState('ok');
      setTimeout(onClose, 2000);
    } catch {
      setState('err');
      setTimeout(() => setState('idle'), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#0A0A0A] border border-[#22C55E]/15 rounded-3xl flex flex-col overflow-hidden shadow-[0_30px_80px_-20px_rgba(34,197,94,0.25)] max-h-[92vh]"
        style={{ animation: 'fadeScaleIn 0.22s cubic-bezier(0.2,0.8,0.2,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero header */}
        <div className="relative px-8 pt-8 pb-6 border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/8 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.25em] mb-2">
                ◆ Cambio de versión
              </p>
              <h2 className="text-white font-black text-3xl uppercase tracking-tight leading-none">
                ELIGE TU<br />
                <span className="text-[#22C55E]">SOFTWARE</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-[#B3B3B3] hover:text-white transition-colors border border-white/5"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-7 px-8 py-7 overflow-y-auto flex-1">

          {/* Step 1: Software */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.2em]">01</span>
              <span className="text-[10px] uppercase font-black text-[#6B6B6B] tracking-[0.2em]">Software</span>
              <div className="flex-1 h-px bg-gradient-to-r from-[#2A2A2A] via-[#1A1A1A] to-transparent" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SOFTWARE.map(s => {
                const isSelected = selectedSoftware === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSoftware(s.id); setSelectedVersion(null); setSearch(''); }}
                    className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? `${s.border} ${s.bg} ${s.glow}`
                        : 'border-[#1F1F1F] bg-[#111] hover:border-[#2A2A2A] hover:bg-[#141414]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-3xl leading-none">{s.emoji}</span>
                      {isSelected && (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${s.bg} border ${s.border}`}>
                          <Check size={11} className={s.color} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p className={`font-black text-base uppercase tracking-tight ${isSelected ? s.color : 'text-white'}`}>{s.label}</p>
                    <p className="text-[#6B6B6B] text-[11px] leading-snug">{s.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Version */}
          {selectedSoftware && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[10px] uppercase font-black tracking-[0.2em] ${sw?.color}`}>02</span>
                <span className="text-[10px] uppercase font-black text-[#6B6B6B] tracking-[0.2em]">
                  Versión <span className={`ml-1 ${sw?.color}`}>{sw?.label}</span>
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-[#2A2A2A] via-[#1A1A1A] to-transparent" />
              </div>

              <div className="relative mb-3">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
                <input
                  type="text"
                  placeholder="Buscar versión..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#111] border border-[#1F1F1F] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-[#4B4B4B] focus:outline-none focus:border-[#22C55E]/40 transition-colors"
                />
              </div>

              {versionsLoading && allVersionsForSw.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-10 text-[#8B8B8B]">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs uppercase tracking-wider font-bold">Cargando versiones disponibles…</span>
                </div>
              ) : versionsError && allVersionsForSw.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <AlertTriangle size={20} className="text-[#EAB308]" />
                  <p className="text-[#EAB308] text-xs">{versionsError}</p>
                </div>
              ) : versions.length === 0 ? (
                <p className="text-[#6B6B6B] text-sm text-center py-8">
                  {search ? `Ninguna versión coincide con "${search}".` : 'No hay versiones disponibles.'}
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-[260px] overflow-y-auto pr-1">
                    {versions.map(v => {
                      const isSelected = selectedVersion === v;
                      return (
                        <button
                          key={v}
                          onClick={() => setSelectedVersion(v)}
                          className={`px-2 py-2.5 rounded-lg border text-xs font-black text-center transition-all ${
                            isSelected
                              ? `${sw?.border} ${sw?.bg} ${sw?.color} ring-1 ${sw?.ring}`
                              : 'border-[#1F1F1F] bg-[#111] text-[#B3B3B3] hover:border-[#2A2A2A] hover:text-white'
                          }`}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[#6B6B6B] uppercase tracking-wider mt-3 flex items-center gap-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-[#22C55E]" />
                    {allVersionsForSw.length} versiones disponibles · datos en vivo desde la fuente oficial
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-white/5 bg-[#070707]">
          <div className="text-sm">
            {selectedSoftware && selectedVersion ? (
              <span className="text-[#E5E5E5]">
                <span className="text-[#6B6B6B] uppercase text-[10px] tracking-wider mr-2">Instalando</span>
                <span className={`font-black uppercase ${sw?.color}`}>{sw?.label}</span>
                <span className="text-white font-mono ml-2">{selectedVersion}</span>
              </span>
            ) : (
              <span className="text-[#4B4B4B] text-xs uppercase tracking-wider">
                {!selectedSoftware ? '◆ Selecciona un software' : '◆ Selecciona una versión'}
              </span>
            )}
          </div>

          <button
            onClick={confirm}
            disabled={!selectedSoftware || !selectedVersion || state === 'loading' || state === 'ok'}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all ${
              state === 'ok'
                ? 'bg-[#22C55E] text-[#0A0A0A] shadow-[0_8px_24px_rgba(34,197,94,0.4)]'
                : state === 'err'
                  ? 'bg-red-500 text-white'
                  : (!selectedSoftware || !selectedVersion)
                    ? 'bg-white/[0.03] text-[#4B4B4B] border border-[#1F1F1F] cursor-not-allowed'
                    : 'bg-[#22C55E] text-[#0A0A0A] hover:bg-[#1eb754] shadow-[0_8px_24px_rgba(34,197,94,0.3)] hover:shadow-[0_12px_32px_rgba(34,197,94,0.45)]'
            }`}
          >
            {state === 'loading' && <Loader2 size={14} className="animate-spin" />}
            {state === 'ok' && <CheckCircle2 size={14} />}
            {state === 'err' && <XCircle size={14} />}
            {state === 'loading' ? 'Ejecutando...' : state === 'ok' ? 'Completado' : state === 'err' ? 'Error, reintenta' : 'Confirmar cambio'}
            {state === 'idle' && selectedSoftware && selectedVersion && <ArrowRight size={14} />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* ─── Action groups ─── */
const ACTIONS = [
  {
    group: 'Control del servidor',
    number: '02',
    items: [
      { id: 'encender', label: 'Encender servidor', message: 'ENCENDER SERVIDOR', description: 'Arranca el servidor si está apagado.', icon: Power, variant: 'green' },
      { id: 'reiniciar', label: 'Reiniciar servidor', message: 'REINICIAR SERVIDOR', description: 'Reinicia el servidor para aplicar cambios.', icon: RefreshCw, variant: 'green' },
      { id: 'apagar', label: 'Apagar servidor', message: 'APAGAR SERVIDOR', description: 'Apaga el servidor guardando los datos correctamente.', icon: PowerOff, variant: 'yellow' },
    ],
  },
  {
    group: 'Mundo',
    number: '03',
    items: [
      { id: 'regenerar_mundo', label: 'Regenerar mundo', message: 'REGENERAR MUNDO', description: 'Genera un nuevo mundo manteniendo la configuración.', icon: Globe, variant: 'yellow', confirm: true },
      { id: 'borrar_mundo', label: 'Borrar mundo', message: 'BORRAR MUNDO', description: 'Elimina el mundo permanentemente. No se puede deshacer.', icon: Trash2, variant: 'red', danger: true, confirm: true },
    ],
  },
  {
    group: 'Zona de peligro',
    number: '04',
    danger: true,
    items: [
      { id: 'eliminar_servidor', label: 'Eliminar servidor', message: 'ELIMINAR SERVIDOR', description: 'Borra el servidor y todos sus datos para siempre.', icon: Trash2, variant: 'red', danger: true, confirm: true },
    ],
  },
];

const VARIANT_STYLES = {
  green: {
    btn: 'bg-[#22C55E] text-[#0A0A0A] hover:bg-[#1eb754] shadow-[0_8px_20px_rgba(34,197,94,0.25)] hover:shadow-[0_12px_28px_rgba(34,197,94,0.4)]',
    icon: 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    card: 'border-[#1F1F1F] hover:border-[#22C55E]/25 hover:bg-[#131313]',
  },
  yellow: {
    btn: 'bg-[#EAB308] text-[#0A0A0A] hover:bg-[#d4a307] shadow-[0_8px_20px_rgba(234,179,8,0.25)] hover:shadow-[0_12px_28px_rgba(234,179,8,0.4)]',
    icon: 'bg-[#EAB308]/10 border-[#EAB308]/30 text-[#EAB308] shadow-[0_0_20px_rgba(234,179,8,0.15)]',
    card: 'border-[#1F1F1F] hover:border-[#EAB308]/25 hover:bg-[#131313]',
  },
  red: {
    btn: 'bg-[#EF4444] text-white hover:bg-[#dc2626] shadow-[0_8px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_12px_28px_rgba(239,68,68,0.5)]',
    icon: 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    card: 'border-[#EF4444]/15 hover:border-[#EF4444]/35 hover:bg-[#1a0e0e]',
  },
};

/* ─── Section header (numbered, holy.gg style) ─── */
const SectionHeader = ({ number, title, danger = false }) => (
  <div className="flex items-center gap-4 mb-5">
    <span className={`text-[11px] uppercase font-black tracking-[0.25em] ${danger ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
      {number}
    </span>
    <h3 className="text-white font-black text-lg uppercase tracking-tight">
      {title}
    </h3>
    <div className={`flex-1 h-px ${danger ? 'bg-gradient-to-r from-[#EF4444]/30 via-[#EF4444]/10 to-transparent' : 'bg-gradient-to-r from-[#22C55E]/20 via-[#1A1A1A] to-transparent'}`} />
  </div>
);

/* ─── Main view ─── */
const ConfigView = ({ server }) => {
  const [actionState, setActionState] = useState({});
  const [confirmPending, setConfirmPending] = useState(null);
  const [showVersionModal, setShowVersionModal] = useState(false);

  const runAction = async (action) => {
    if (action.confirm && confirmPending !== action.id) {
      setConfirmPending(action.id);
      return;
    }
    setConfirmPending(null);
    setActionState(prev => ({ ...prev, [action.id]: 'loading' }));
    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: action.message, server_id: server?.id }),
      });
      if (!res.ok) throw new Error();
      setActionState(prev => ({ ...prev, [action.id]: 'ok' }));
    } catch {
      setActionState(prev => ({ ...prev, [action.id]: 'err' }));
    } finally {
      setTimeout(() => setActionState(prev => { const n = { ...prev }; delete n[action.id]; return n; }), 3000);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-10">
        {/* Hero header — holy.gg style */}
        <div className="relative">
          <div className="absolute -inset-x-4 -top-4 h-32 bg-gradient-to-br from-[#22C55E]/8 via-transparent to-transparent blur-3xl pointer-events-none" />
          <div className="relative">
            <p className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.3em] mb-3 flex items-center gap-2">
              <Sparkles size={11} className="text-[#22C55E]" />
              Panel de control
            </p>
            <h1 className="text-white font-black text-4xl md:text-5xl uppercase tracking-[-0.02em] leading-[0.95]">
              CONFIGURACIÓN<br />
              <span className="text-[#22C55E]">DEL SERVIDOR</span>
            </h1>
            <p className="text-[#8B8B8B] text-sm mt-4 max-w-xl leading-relaxed">
              Gestiona las opciones avanzadas de{' '}
              <span className="text-white font-bold">{server?.server_name || 'tu servidor'}</span>.
              Cambios aplican en segundos.
            </p>
          </div>
        </div>

        {/* MEGA CTA — Cambiar versión (holy.gg flagship style) */}
        <div>
          <SectionHeader number="01" title="Versión & Software" />
          <button
            onClick={() => setShowVersionModal(true)}
            className="group relative w-full text-left bg-gradient-to-br from-[#0F0F0F] via-[#0F0F0F] to-[#0A1A0F] border-2 border-[#22C55E]/20 hover:border-[#22C55E]/50 rounded-2xl p-6 md:p-7 flex items-center gap-5 transition-all overflow-hidden hover:shadow-[0_20px_50px_-15px_rgba(34,197,94,0.35)]"
          >
            {/* Glow accent */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#22C55E]/15 transition-colors" />

            <div className="relative w-16 h-16 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/40 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(34,197,94,0.2)] group-hover:shadow-[0_0_40px_rgba(34,197,94,0.35)] transition-shadow">
              <Gamepad2 size={28} className="text-[#22C55E]" strokeWidth={2.2} />
            </div>

            <div className="relative flex-1 min-w-0">
              <p className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.25em] mb-1">
                Cambiar versión
              </p>
              <p className="text-white font-black text-xl md:text-2xl uppercase tracking-tight leading-tight mb-2">
                Vanilla · Paper · Fabric · Forge · NeoForge
              </p>
              <p className="text-[#8B8B8B] text-sm leading-relaxed">
                Cualquier software, cualquier versión moderna (1.12 → 1.21.11). Cambio en 1-2 minutos.
              </p>
            </div>

            <div className="relative shrink-0 hidden md:flex items-center gap-2 px-5 py-3 rounded-xl bg-[#22C55E] text-[#0A0A0A] text-xs font-black uppercase tracking-[0.15em] shadow-[0_8px_24px_rgba(34,197,94,0.3)] group-hover:shadow-[0_12px_32px_rgba(34,197,94,0.45)] transition-shadow">
              Configurar
              <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="relative md:hidden shrink-0">
              <ChevronRight size={20} className="text-[#22C55E]" />
            </div>
          </button>
        </div>

        {/* Action groups */}
        {ACTIONS.map(group => (
          <div key={group.group}>
            <SectionHeader number={group.number} title={group.group} danger={group.danger} />
            <div className="flex flex-col gap-3">
              {group.items.map(action => {
                const state = actionState[action.id];
                const isPending = confirmPending === action.id;
                const styles = VARIANT_STYLES[action.variant];
                const Icon = action.icon;

                return (
                  <div
                    key={action.id}
                    className={`bg-[#0F0F0F] border-2 rounded-2xl p-5 flex items-center gap-5 transition-all ${styles.card}`}
                  >
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${styles.icon}`}>
                      <Icon size={20} strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black text-base uppercase tracking-tight">{action.label}</p>
                      <p className="text-[#8B8B8B] text-sm mt-1 leading-relaxed">{action.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isPending && (
                        <button
                          onClick={() => setConfirmPending(null)}
                          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#B3B3B3] text-xs font-black uppercase tracking-[0.15em] hover:bg-white/10 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={() => runAction(action)}
                        disabled={state === 'loading'}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all ${
                          state === 'ok'
                            ? 'bg-[#22C55E] text-[#0A0A0A] shadow-[0_8px_20px_rgba(34,197,94,0.35)]'
                            : state === 'err'
                              ? 'bg-[#EF4444] text-white shadow-[0_8px_20px_rgba(239,68,68,0.35)]'
                              : isPending
                                ? 'bg-[#EF4444] text-white animate-pulse shadow-[0_0_24px_rgba(239,68,68,0.5)]'
                                : styles.btn
                        }`}
                      >
                        {state === 'loading' && <Loader2 size={12} className="animate-spin" />}
                        {state === 'ok' && <CheckCircle2 size={12} />}
                        {state === 'err' && <XCircle size={12} />}
                        {!state && !isPending && <ArrowRight size={12} strokeWidth={3} />}
                        {state === 'loading' ? 'Ejecutando...' : state === 'ok' ? 'Ejecutado' : state === 'err' ? 'Error' : isPending ? '¿Confirmar?' : action.label}
                      </button>
                    </div>
                  </div>
                );
              })}

              {group.danger && (
                <div className="flex items-start gap-2.5 mt-1 px-4 py-3 rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/15">
                  <AlertTriangle size={14} className="text-[#EF4444] mt-0.5 shrink-0" />
                  <p className="text-[#FCA5A5] text-xs leading-relaxed">
                    Las acciones de esta zona son <span className="font-black">irreversibles</span>. Asegúrate de tener un backup antes de continuar.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showVersionModal && (
        <VersionModal server={server} onClose={() => setShowVersionModal(false)} />
      )}
    </>
  );
};

export default ConfigView;
