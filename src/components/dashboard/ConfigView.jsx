import React, { useState } from 'react';
import {
  Settings, RefreshCw, PowerOff, Power, Globe,
  Trash2, Loader2, CheckCircle2, XCircle, X, Search,
  ChevronRight, ChevronDown, Check
} from 'lucide-react';

const WEBHOOK = 'https://snack55-n8n1.q7pa8v.easypanel.host/webhook/asistente';

/* ─── Version data ─── */
const ALL_VERSIONS = [
  '1.21.4','1.21.3','1.21.1','1.21',
  '1.20.6','1.20.4','1.20.2','1.20.1','1.20',
  '1.19.4','1.19.3','1.19.2','1.19.1','1.19',
  '1.18.2','1.18.1','1.18',
  '1.17.1','1.17',
  '1.16.5','1.16.4','1.16.3','1.16.2','1.16.1','1.16',
  '1.15.2','1.15.1','1.15',
  '1.14.4','1.14.3','1.14.2','1.14.1','1.14',
  '1.13.2','1.13.1','1.13',
  '1.12.2',
];

// versions supported per software (Paper/Fabric/Forge don't go all the way back equally)
const SOFTWARE_VERSIONS = {
  VANILLA: ALL_VERSIONS,
  PAPER: ALL_VERSIONS.filter(v => {
    const [, minor] = v.split('.').map(Number);
    return minor >= 12;
  }),
  FABRIC: ALL_VERSIONS.filter(v => {
    const [, minor] = v.split('.').map(Number);
    return minor >= 14;
  }),
  FORGE: ALL_VERSIONS.filter(v => {
    const [, minor] = v.split('.').map(Number);
    return minor >= 12;
  }),
};

const SOFTWARE = [
  {
    id: 'VANILLA',
    label: 'Vanilla',
    description: 'Servidor oficial de Mojang sin modificaciones.',
    emoji: '🟩',
    color: 'text-[#22C55E]',
    border: 'border-[#22C55E]/30',
    bg: 'bg-[#22C55E]/8',
    ring: 'ring-[#22C55E]/40',
  },
  {
    id: 'PAPER',
    label: 'Paper',
    description: 'Alto rendimiento, compatible con plugins Bukkit/Spigot.',
    emoji: '📄',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/8',
    ring: 'ring-blue-400/40',
  },
  {
    id: 'FABRIC',
    label: 'Fabric',
    description: 'Framework ligero ideal para mods modernos.',
    emoji: '🧵',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/8',
    ring: 'ring-purple-400/40',
  },
  {
    id: 'FORGE',
    label: 'Forge',
    description: 'El estándar para mods complejos y modpacks.',
    emoji: '⚙️',
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/8',
    ring: 'ring-orange-400/40',
  },
];

/* ─── Version change modal ─── */
const VersionModal = ({ server, onClose }) => {
  const [selectedSoftware, setSelectedSoftware] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | ok | err

  const versions = selectedSoftware
    ? (SOFTWARE_VERSIONS[selectedSoftware] || []).filter(v =>
        !search || v.includes(search)
      )
    : [];

  const sw = SOFTWARE.find(s => s.id === selectedSoftware);

  const confirm = async () => {
    setState('loading');
    try {
      const res = await fetch(WEBHOOK, {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0F0F0F] border border-[#2A2A2A] rounded-2xl flex flex-col overflow-hidden shadow-2xl max-h-[90vh]"
        style={{ animation: 'fadeScaleIn 0.18s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A]">
          <div>
            <h2 className="text-white font-extrabold text-base uppercase tracking-tight">Cambiar versión</h2>
            <p className="text-[#6B6B6B] text-xs mt-0.5">Elige el software y la versión del servidor</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[#6B6B6B] hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5 overflow-y-auto flex-1">

          {/* Step 1: Software */}
          <div>
            <p className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider mb-3">
              1. Selecciona el software
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SOFTWARE.map(s => {
                const isSelected = selectedSoftware === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSoftware(s.id); setSelectedVersion(null); setSearch(''); }}
                    className={`relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${s.border} ${s.bg} ring-1 ${s.ring}`
                        : 'border-[#2A2A2A] bg-[#171717] hover:border-[#3A3A3A] hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className="text-2xl leading-none mt-0.5">{s.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${isSelected ? s.color : 'text-[#E5E5E5]'}`}>{s.label}</p>
                      <p className="text-[#6B6B6B] text-[10px] mt-0.5 leading-relaxed">{s.description}</p>
                    </div>
                    {isSelected && (
                      <div className={`absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center ${s.bg} border ${s.border}`}>
                        <Check size={9} className={s.color} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Version */}
          {selectedSoftware && (
            <div>
              <p className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider mb-3">
                2. Selecciona la versión
                <span className={`ml-2 font-bold ${sw?.color}`}>{sw?.label}</span>
              </p>

              {/* Search */}
              <div className="relative mb-3">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
                <input
                  type="text"
                  placeholder="Buscar versión..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#171717] border border-[#2A2A2A] rounded-lg pl-8 pr-4 py-2 text-sm text-[#E5E5E5] placeholder-[#4B4B4B] focus:outline-none focus:border-[#3A3A3A] transition-colors"
                />
              </div>

              {versions.length === 0 ? (
                <p className="text-[#6B6B6B] text-sm text-center py-4">No se encontraron versiones.</p>
              ) : (
                <div className="grid grid-cols-5 gap-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {versions.map(v => {
                    const isSelected = selectedVersion === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setSelectedVersion(v)}
                        className={`px-3 py-2 rounded-lg border text-xs font-bold text-center transition-all ${
                          isSelected
                            ? `${sw?.border} ${sw?.bg} ${sw?.color} ring-1 ${sw?.ring}`
                            : 'border-[#2A2A2A] bg-[#171717] text-[#B3B3B3] hover:border-[#3A3A3A] hover:text-white'
                        }`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2A2A2A] bg-[#0A0A0A]">
          <div className="text-sm">
            {selectedSoftware && selectedVersion ? (
              <span className="text-[#E5E5E5]">
                <span className="text-[#6B6B6B]">Instalando: </span>
                <span className={`font-bold ${sw?.color}`}>{sw?.label}</span>
                <span className="text-white font-mono ml-1">{selectedVersion}</span>
              </span>
            ) : (
              <span className="text-[#4B4B4B] text-xs">
                {!selectedSoftware ? 'Selecciona un software para continuar' : 'Selecciona una versión'}
              </span>
            )}
          </div>

          <button
            onClick={confirm}
            disabled={!selectedSoftware || !selectedVersion || state === 'loading' || state === 'ok'}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg border text-sm font-bold uppercase tracking-wider transition-all ${
              state === 'ok'
                ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                : state === 'err'
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : (!selectedSoftware || !selectedVersion)
                    ? 'bg-white/[0.03] text-[#4B4B4B] border-[#2A2A2A] cursor-not-allowed'
                    : 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/25 hover:bg-[#22C55E]/20'
            }`}
          >
            {state === 'loading' && <Loader2 size={14} className="animate-spin" />}
            {state === 'ok' && <CheckCircle2 size={14} />}
            {state === 'err' && <XCircle size={14} />}
            {state === 'loading' ? 'Ejecutando...' : state === 'ok' ? 'Completado' : state === 'err' ? 'Error, reintenta' : 'Confirmar cambio'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

/* ─── Action row component ─── */
const ACTIONS = [
  {
    group: 'Control del servidor',
    items: [
      { id: 'encender', label: 'Encender servidor', message: 'ENCENDER SERVIDOR', description: 'Arranca el servidor si está apagado.', icon: Power, variant: 'green' },
      { id: 'reiniciar', label: 'Reiniciar servidor', message: 'REINICIAR SERVIDOR', description: 'Reinicia el servidor para aplicar cambios.', icon: RefreshCw, variant: 'green' },
      { id: 'apagar', label: 'Apagar servidor', message: 'APAGAR SERVIDOR', description: 'Apaga el servidor guardando los datos correctamente.', icon: PowerOff, variant: 'yellow' },
    ],
  },
  {
    group: 'Mundo',
    items: [
      { id: 'regenerar_mundo', label: 'Regenerar mundo', message: 'REGENERAR MUNDO', description: 'Genera un nuevo mundo manteniendo la configuración.', icon: Globe, variant: 'yellow', confirm: true },
      { id: 'borrar_mundo', label: 'Borrar mundo', message: 'BORRAR MUNDO', description: 'Elimina el mundo permanentemente. No se puede deshacer.', icon: Trash2, variant: 'red', danger: true, confirm: true },
    ],
  },
  {
    group: 'Zona de peligro',
    items: [
      { id: 'eliminar_servidor', label: 'Eliminar servidor', message: 'ELIMINAR SERVIDOR', description: 'Borra el servidor y todos sus datos para siempre.', icon: Trash2, variant: 'red', danger: true, confirm: true },
    ],
  },
];

const VARIANT_STYLES = {
  green: {
    btn: 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.3)] hover:bg-[rgba(34,197,94,0.2)] shadow-[0_4px_10px_rgba(34,197,94,0.05)]',
    icon: 'bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.2)] text-[#22C55E]',
    card: 'border-[#2A2A2A] hover:border-[#3A3A3A]',
  },
  yellow: {
    btn: 'bg-[rgba(234,179,8,0.1)] text-[#EAB308] border-[rgba(234,179,8,0.3)] hover:bg-[rgba(234,179,8,0.2)] shadow-[0_4px_10px_rgba(234,179,8,0.05)]',
    icon: 'bg-[rgba(234,179,8,0.08)] border-[rgba(234,179,8,0.2)] text-[#EAB308]',
    card: 'border-[#2A2A2A] hover:border-[rgba(234,179,8,0.2)]',
  },
  red: {
    btn: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.2)] shadow-[0_4px_10px_rgba(239,68,68,0.05)]',
    icon: 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)] text-[#EF4444]',
    card: 'border-[rgba(239,68,68,0.12)] hover:border-[rgba(239,68,68,0.25)]',
  },
};

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
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h2 className="text-white text-xl font-extrabold uppercase tracking-tight flex items-center gap-2">
            <Settings size={20} className="text-[#22C55E]" />
            Configuración del Servidor
          </h2>
          <p className="text-[#6B6B6B] text-xs mt-1">
            Gestiona las opciones avanzadas de <span className="text-[#E5E5E5] font-medium">{server?.server_name || 'tu servidor'}</span>.
          </p>
        </div>

        {/* Version change – special card */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider">Versión</span>
            <div className="flex-1 h-px bg-[#2A2A2A]" />
          </div>
          <div className="bg-[#171717] border border-[#2A2A2A] hover:border-[#3A3A3A] rounded-xl p-4 flex items-center gap-4 transition-colors">
            <div className="w-9 h-9 rounded-lg border bg-white/[0.03] border-[#2A2A2A] flex items-center justify-center text-xl shrink-0">
              🎮
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#E5E5E5] font-bold text-sm">Cambiar versión</p>
              <p className="text-[#6B6B6B] text-xs mt-0.5">Elige el software (Vanilla, Paper, Fabric, Forge) y la versión del servidor.</p>
            </div>
            <button
              onClick={() => setShowVersionModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.3)] hover:bg-[rgba(34,197,94,0.2)] shadow-[0_4px_10px_rgba(34,197,94,0.05)]"
            >
              Cambiar versión
              <ChevronRight size={11} />
            </button>
          </div>
        </div>

        {/* Action groups */}
        {ACTIONS.map(group => (
          <div key={group.group}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider">{group.group}</span>
              <div className="flex-1 h-px bg-[#2A2A2A]" />
            </div>
            <div className="flex flex-col gap-2">
              {group.items.map(action => {
                const state = actionState[action.id];
                const isPending = confirmPending === action.id;
                const styles = VARIANT_STYLES[action.variant];
                const Icon = action.icon;

                return (
                  <div
                    key={action.id}
                    className={`bg-[#171717] border rounded-xl p-4 flex items-center gap-4 transition-colors ${styles.card}`}
                  >
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${styles.icon}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#E5E5E5] font-bold text-sm">{action.label}</p>
                      <p className="text-[#6B6B6B] text-xs mt-0.5 leading-relaxed">{action.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isPending && (
                        <button
                          onClick={() => setConfirmPending(null)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#B3B3B3] text-xs font-bold hover:bg-white/10 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={() => runAction(action)}
                        disabled={state === 'loading'}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                          state === 'ok'
                            ? 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.3)]'
                            : state === 'err'
                              ? 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-[rgba(239,68,68,0.3)]'
                              : isPending
                                ? 'bg-[rgba(239,68,68,0.18)] text-[#EF4444] border-[rgba(239,68,68,0.4)] ring-1 ring-[rgba(239,68,68,0.3)] animate-pulse'
                                : styles.btn
                        }`}
                      >
                        {state === 'loading' && <Loader2 size={11} className="animate-spin" />}
                        {state === 'ok' && <CheckCircle2 size={11} />}
                        {state === 'err' && <XCircle size={11} />}
                        {state === 'loading' ? 'Ejecutando...' : state === 'ok' ? 'Ejecutado' : state === 'err' ? 'Error' : isPending ? '¿Confirmar?' : action.label}
                      </button>
                    </div>
                  </div>
                );
              })}
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
