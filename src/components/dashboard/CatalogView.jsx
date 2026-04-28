import React, { useState, useMemo } from 'react';
import { Search, Download, CheckCircle2, XCircle, Loader2, Package, Wrench, Puzzle, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';
import { MODS_CATALOG, PLUGINS_CATALOG, MODPACKS_CATALOG, filterByVersion } from '../../data/catalog';

const N8N_ASISTENTE = 'https://snack55-n8n1.q7pa8v.easypanel.host/webhook/asistente';

const TYPE_CONFIG = {
  mods:     { title: 'Mods', subtitle: 'Mods curados de Modrinth/CurseForge — los más populares para Fabric, Forge y NeoForge', catalog: MODS_CATALOG, icon: <Wrench size={28} className="text-[#22C55E]" />, accent: 'green' },
  plugins:  { title: 'Plugins', subtitle: 'Plugins esenciales para tu server Paper/Spigot — 1 click y los tienes activos', catalog: PLUGINS_CATALOG, icon: <Puzzle size={28} className="text-[#22C55E]" />, accent: 'green' },
  modpacks: { title: 'Modpacks', subtitle: 'Modpacks completos pre-configurados — desde Vanilla+ hasta hardcore extremo', catalog: MODPACKS_CATALOG, icon: <Package size={28} className="text-[#22C55E]" />, accent: 'green' },
};

const BADGE_COLORS = {
  green:  'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30',
  violet: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  orange: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  blue:   'bg-blue-500/15 text-blue-300 border-blue-500/30',
  red:    'bg-red-500/15 text-red-300 border-red-500/30',
  gray:   'bg-white/5 text-white/60 border-white/10',
};

const CatalogCard = ({ item, server, user, onInstall, installState }) => {
  const isInstalling = installState?.id === item.id && installState?.status === 'installing';
  const isInstalled = installState?.id === item.id && installState?.status === 'installed';
  const isFailed = installState?.id === item.id && installState?.status === 'failed';
  const compatible = item._compatible !== false; // undefined = sin info → asumir compatible

  return (
    <div className="bg-[#0F0F0F] border border-[#1F1F1F] rounded-2xl overflow-hidden hover:border-[#22C55E]/30 transition-all flex flex-col group">
      {/* Image header */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-[#1F2937] to-[#0F0F0F] overflow-hidden flex items-center justify-center">
        <img
          src={item.image}
          alt={item.name}
          className="w-24 h-24 rounded-xl object-cover shadow-[0_8px_24px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div className="hidden w-24 h-24 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 items-center justify-center">
          <Package size={40} className="text-[#22C55E]/60" />
        </div>
        {item.badge && (
          <span className={`absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${BADGE_COLORS[item.badgeColor] || BADGE_COLORS.gray}`}>
            {item.badge}
          </span>
        )}
        {!compatible && (
          <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
            No compatible
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-black text-base leading-tight">{item.name}</h3>
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold shrink-0">{item.category}</span>
        </div>

        <p className="text-white/55 text-xs leading-relaxed flex-1">{item.description}</p>

        <div className="flex items-center gap-2 flex-wrap">
          {(item.tags || []).slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] text-white/40 px-2 py-0.5 rounded bg-white/5 border border-white/5">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-[#1F1F1F]">
          <span>📦 {item.estimatedSize}</span>
          {item.recommendedRam && <span>🧠 RAM rec: {item.recommendedRam}GB</span>}
        </div>

        {/* CTA */}
        <button
          onClick={() => onInstall(item)}
          disabled={isInstalling || !compatible || !server?.id}
          className={`mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all
            ${isInstalled ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 cursor-default' :
              isFailed ? 'bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20' :
              !compatible ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed' :
              'bg-[#22C55E] hover:bg-[#1faa50] text-[#0A0A0A] shadow-[0_4px_16px_rgba(34,197,94,0.25)] hover:shadow-[0_6px_24px_rgba(34,197,94,0.4)]'
            }`}
        >
          {isInstalling ? (<><Loader2 size={14} className="animate-spin" /> Instalando…</>) :
           isInstalled ? (<><CheckCircle2 size={14} /> Instalado</>) :
           isFailed ? (<><AlertCircle size={14} /> Reintentar</>) :
           !compatible ? 'No compatible con tu versión' :
           (<><Download size={14} /> Instalar</>)}
        </button>
      </div>
    </div>
  );
};

const CatalogView = ({ type = 'mods', server, user }) => {
  const cfg = TYPE_CONFIG[type];
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [installState, setInstallState] = useState({ id: null, status: null });
  const [error, setError] = useState('');

  const items = useMemo(() => {
    const filtered = filterByVersion(cfg.catalog, server?.mc_version);
    return filtered.filter(item => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (item.name + ' ' + item.description + ' ' + (item.tags || []).join(' ')).toLowerCase().includes(q);
      }
      return true;
    });
  }, [cfg.catalog, server?.mc_version, search, activeCategory]);

  const categories = useMemo(() => {
    const s = new Set(cfg.catalog.map(i => i.category));
    return ['all', ...Array.from(s)];
  }, [cfg.catalog]);

  const handleInstall = async (item) => {
    if (!server?.id || !user) {
      setError('Necesitas tener un servidor activo para instalar.');
      return;
    }
    setError('');
    setInstallState({ id: item.id, status: 'installing' });
    try {
      const r = await fetch(N8N_ASISTENTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_id: server.id,
          user_key: `catalog-${user.id}-${Date.now()}`,
          message: item.installMessage,
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json().catch(() => ({}));
      // n8n devuelve { output: "..." } cuando la IA termina la tool call.
      // Lo damos por instalado tras respuesta 200.
      setInstallState({ id: item.id, status: 'installed' });
    } catch (e) {
      console.error('[catalog/install]', e);
      setInstallState({ id: item.id, status: 'failed' });
      setError(`No se pudo instalar ${item.name}. Intenta desde el chat IA.`);
    }
  };

  if (!server) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Package size={40} className="text-white/30" />
        <p className="text-white/60 text-sm">Necesitas seleccionar un servidor para ver el catálogo.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-[#22C55E]/8 via-[#0F0F0F] to-[#0F0F0F] border border-[#22C55E]/15 rounded-2xl p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#22C55E]/5 rounded-full blur-[80px] -z-0"></div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center shrink-0">
            {cfg.icon}
          </div>
          <div className="flex-1">
            <h1 className="font-heading text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
              {cfg.title}
            </h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-2xl">{cfg.subtitle}</p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <Sparkles size={12} className="text-[#22C55E]" />
              <span className="text-white/50">Compatible con tu server: <span className="text-[#22C55E] font-bold">{server.server_type} {server.mc_version}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Buscar ${cfg.title.toLowerCase()}…`}
            className="w-full bg-[#0F0F0F] border border-[#1F1F1F] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#22C55E]/40 focus:ring-1 focus:ring-[#22C55E]/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border
                ${activeCategory === cat
                  ? 'bg-[#22C55E] text-[#0A0A0A] border-[#22C55E]'
                  : 'bg-[#0F0F0F] text-white/60 border-[#1F1F1F] hover:border-white/20'}`}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Search size={32} className="text-white/20" />
          <p className="text-white/50 text-sm">No encontramos {cfg.title.toLowerCase()} con esos filtros.</p>
          <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="text-[#22C55E] text-xs font-bold uppercase tracking-wider hover:underline">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => (
            <CatalogCard
              key={item.id}
              item={item}
              server={server}
              user={user}
              onInstall={handleInstall}
              installState={installState}
            />
          ))}
        </div>
      )}

      {/* Footer hint */}
      <div className="mt-4 flex items-center gap-3 bg-[#0F0F0F] border border-[#1F1F1F] rounded-xl px-5 py-4 text-white/55 text-xs">
        <ExternalLink size={14} className="text-[#22C55E] shrink-0" />
        <span>
          ¿No encuentras lo que buscas? Usa el <strong className="text-white">chat IA</strong> a la derecha y di
          "<em>instálame [nombre]</em>". Soporta cualquier mod o plugin de CurseForge / Modrinth / Hangar.
        </span>
      </div>
    </div>
  );
};

export default CatalogView;
