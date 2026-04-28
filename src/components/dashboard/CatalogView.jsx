import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Download, CheckCircle2, Loader2, Package, Wrench, Puzzle, AlertCircle, ExternalLink, Sparkles, RefreshCw } from 'lucide-react';

const N8N_ASISTENTE = 'https://snack55-n8n1.q7pa8v.easypanel.host/webhook/asistente';
const CATALOG_API = 'https://api.fluxoai.co/api/catalog';

const TYPE_CONFIG = {
  mods:     { title: 'Mods', subtitle: 'Catálogo en vivo · Modrinth + CurseForge combinados · 200.000+ mods', icon: <Wrench size={28} className="text-[#22C55E]" />, apiType: 'mod', installVerb: 'el mod' },
  plugins:  { title: 'Plugins', subtitle: 'Catálogo en vivo · todos los plugins de Modrinth + CurseForge para Paper/Spigot', icon: <Puzzle size={28} className="text-[#22C55E]" />, apiType: 'plugin', installVerb: 'el plugin' },
  modpacks: { title: 'Modpacks', subtitle: 'Modpacks completos · ATM, RLCraft, Vault Hunters y miles más · 1-click install', icon: <Package size={28} className="text-[#22C55E]" />, apiType: 'modpack', installVerb: 'el modpack' },
};

const SOURCE_BADGE = {
  modrinth: { label: 'Modrinth', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  curseforge: { label: 'CurseForge', cls: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
};

// Server type → loader que pasamos a Modrinth
const LOADER_MAP = {
  paper: 'paper', spigot: 'spigot', vanilla: '', purpur: 'purpur', folia: 'folia',
  fabric: 'fabric', forge: 'forge', neoforge: 'neoforge',
};

const CATEGORY_ICONS = {
  adventure: '🗺️', technology: '⚙️', tech: '⚙️', magic: '✨', utility: '🛠️',
  optimization: '⚡', storage: '📦', food: '🍞', cursed: '🧟', decoration: '🎨',
  worldgen: '🌍', mobs: '🐺', equipment: '⚔️', fabric: '🧵', forge: '🔨',
  neoforge: '🔧', library: '📚', social: '💬', 'kitchen-sink': '🥘',
  multiplayer: '👥', lightweight: '🪶', 'game-mechanics': '🎮',
};

const formatNum = (n) => {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
};

const CatalogCard = ({ item, server, onInstall, installState }) => {
  const isInstalling = installState?.id === item.project_id && installState?.status === 'installing';
  const isInstalled = installState?.id === item.project_id && installState?.status === 'installed';
  const isFailed = installState?.id === item.project_id && installState?.status === 'failed';
  const compatible = !server?.mc_version || (item.versions || []).includes(server.mc_version) || true; // permisive: Modrinth filtra ya server-side
  const cats = (item.categories || []).filter(c => !['fabric', 'forge', 'neoforge', 'paper', 'spigot', 'velocity', 'purpur'].includes(c)).slice(0, 3);

  return (
    <div className="bg-[#0F0F0F] border border-[#1F1F1F] rounded-2xl overflow-hidden hover:border-[#22C55E]/30 transition-all flex flex-col group">
      {/* Image header */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-[#1F2937] to-[#0F0F0F] overflow-hidden flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="w-24 h-24 rounded-xl object-cover shadow-[0_8px_24px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex'; }}
          />
        ) : null}
        <div className="fallback-icon hidden w-24 h-24 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 items-center justify-center" style={item.image ? { display: 'none' } : { display: 'flex' }}>
          <Package size={40} className="text-[#22C55E]/60" />
        </div>
        {item.downloads >= 1e6 && (
          <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
            🔥 Popular
          </span>
        )}
        {SOURCE_BADGE[item.source] && (
          <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full border ${SOURCE_BADGE[item.source].cls}`}>
            {SOURCE_BADGE[item.source].label}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-black text-base leading-tight line-clamp-2">{item.name}</h3>
          <a href={item.project_url} target="_blank" rel="noreferrer" className="text-white/30 hover:text-[#22C55E] shrink-0 transition-colors" title="Ver en Modrinth">
            <ExternalLink size={14} />
          </a>
        </div>

        <p className="text-white/55 text-xs leading-relaxed line-clamp-3 flex-1">{item.description}</p>

        <div className="flex items-center gap-1.5 flex-wrap">
          {cats.map(tag => (
            <span key={tag} className="text-[10px] text-white/50 px-2 py-0.5 rounded bg-white/5 border border-white/5 capitalize">
              {CATEGORY_ICONS[tag] || ''} {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-[#1F1F1F]">
          <span>⬇ {formatNum(item.downloads)}</span>
          <span>⭐ {formatNum(item.follows)}</span>
        </div>

        <button
          onClick={() => onInstall(item)}
          disabled={isInstalling || !server?.id}
          className={`mt-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all
            ${isInstalled ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 cursor-default' :
              isFailed ? 'bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20' :
              'bg-[#22C55E] hover:bg-[#1faa50] text-[#0A0A0A] shadow-[0_4px_16px_rgba(34,197,94,0.25)] hover:shadow-[0_6px_24px_rgba(34,197,94,0.4)]'
            }`}
        >
          {isInstalling ? (<><Loader2 size={14} className="animate-spin" /> Instalando…</>) :
           isInstalled ? (<><CheckCircle2 size={14} /> Instalado</>) :
           isFailed ? (<><AlertCircle size={14} /> Reintentar</>) :
           (<><Download size={14} /> Instalar</>)}
        </button>
      </div>
    </div>
  );
};

const CatalogView = ({ type = 'mods', server, user }) => {
  const cfg = TYPE_CONFIG[type];
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [stale, setStale] = useState(false);
  const [filterByVersion, setFilterByVersion] = useState(true);
  const [installState, setInstallState] = useState({ id: null, status: null });
  const debounceRef = useRef(null);
  const PAGE_SIZE = 20;

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [search]);

  // Fetch items when search/filter/server changes
  useEffect(() => {
    if (!server?.server_type) return;
    let aborted = false;
    setLoading(true);
    setError('');
    setItems([]);
    setOffset(0);

    const loader = LOADER_MAP[String(server.server_type).toLowerCase()] || '';
    const version = filterByVersion ? (server.mc_version || '') : '';
    const params = new URLSearchParams({
      type: cfg.apiType,
      q: debouncedSearch,
      offset: '0',
      limit: String(PAGE_SIZE),
    });
    if (loader) params.set('loader', loader);
    if (version) params.set('version', version);

    fetch(`${CATALOG_API}/search?${params}`)
      .then(r => r.json())
      .then(data => {
        if (aborted) return;
        if (data.error) throw new Error(data.error);
        setItems(data.items || []);
        setTotal(data.total || 0);
        setOffset(data.items?.length || 0);
        setStale(!!data.stale);
      })
      .catch(e => {
        if (aborted) return;
        console.error('[catalog]', e);
        setError('No se pudo cargar el catálogo. Intenta refrescar.');
      })
      .finally(() => { if (!aborted) setLoading(false); });

    return () => { aborted = true; };
  }, [type, debouncedSearch, server?.server_type, server?.mc_version, filterByVersion]);

  const loadMore = async () => {
    if (loadingMore || items.length >= total) return;
    setLoadingMore(true);
    const loader = LOADER_MAP[String(server.server_type).toLowerCase()] || '';
    const version = filterByVersion ? (server.mc_version || '') : '';
    const params = new URLSearchParams({
      type: cfg.apiType,
      q: debouncedSearch,
      offset: String(offset),
      limit: String(PAGE_SIZE),
    });
    if (loader) params.set('loader', loader);
    if (version) params.set('version', version);
    try {
      const r = await fetch(`${CATALOG_API}/search?${params}`);
      const data = await r.json();
      if (!data.error) {
        setItems(prev => [...prev, ...(data.items || [])]);
        setOffset(prev => prev + (data.items?.length || 0));
      }
    } catch (e) { console.error('[catalog/loadMore]', e); }
    finally { setLoadingMore(false); }
  };

  const handleInstall = async (item) => {
    if (!server?.id || !user) {
      setError('Necesitas tener un servidor activo para instalar.');
      return;
    }
    setError('');
    setInstallState({ id: item.project_id, status: 'installing' });
    try {
      const r = await fetch(N8N_ASISTENTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_id: server.id,
          user_key: `catalog-${user.id}-${Date.now()}`,
          message: `instálame ${cfg.installVerb} ${item.name}`,
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setInstallState({ id: item.project_id, status: 'installed' });
    } catch (e) {
      console.error('[catalog/install]', e);
      setInstallState({ id: item.project_id, status: 'failed' });
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
            <div className="mt-3 flex items-center gap-3 text-xs flex-wrap">
              <span className="flex items-center gap-1.5 text-white/50">
                <Sparkles size={12} className="text-[#22C55E]" />
                Tu server: <span className="text-[#22C55E] font-bold">{server.server_type} {server.mc_version}</span>
              </span>
              {total > 0 && (
                <span className="text-white/40">· <span className="text-white">{formatNum(total)}</span> resultados <span className="text-emerald-400/70">Modrinth</span> + <span className="text-orange-400/70">CurseForge</span></span>
              )}
              {stale && (
                <span className="text-amber-400/80 flex items-center gap-1.5">
                  <RefreshCw size={11} /> Datos en caché (catálogo lento)
                </span>
              )}
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
            placeholder={`Buscar en miles de ${cfg.title.toLowerCase()}…`}
            className="w-full bg-[#0F0F0F] border border-[#1F1F1F] rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#22C55E]/40 focus:ring-1 focus:ring-[#22C55E]/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-xs">
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => setFilterByVersion(v => !v)}
          className={`shrink-0 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap
            ${filterByVersion
              ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
              : 'bg-[#0F0F0F] text-white/40 border-[#1F1F1F] hover:border-white/20'}`}
        >
          {filterByVersion ? `✓ Solo ${server.mc_version}` : `Mostrar todas las versiones`}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#0F0F0F] border border-[#1F1F1F] rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[16/9] bg-[#1F1F1F]/50"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-[#1F1F1F]/50 rounded w-3/4"></div>
                <div className="h-3 bg-[#1F1F1F]/50 rounded"></div>
                <div className="h-3 bg-[#1F1F1F]/50 rounded w-1/2"></div>
                <div className="h-9 bg-[#1F1F1F]/50 rounded-xl mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Search size={32} className="text-white/20" />
          <p className="text-white/50 text-sm">
            {debouncedSearch ? `No encontramos ${cfg.title.toLowerCase()} con "${debouncedSearch}".` : `No hay ${cfg.title.toLowerCase()} disponibles para tu versión.`}
          </p>
          {(debouncedSearch || filterByVersion) && (
            <button onClick={() => { setSearch(''); setFilterByVersion(false); }} className="text-[#22C55E] text-xs font-bold uppercase tracking-wider hover:underline">
              Mostrar todos
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => (
              <CatalogCard
                key={item.project_id}
                item={item}
                server={server}
                onInstall={handleInstall}
                installState={installState}
              />
            ))}
          </div>
          {items.length < total && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F0F0F] border border-[#1F1F1F] hover:border-[#22C55E]/30 text-white font-bold text-sm transition-all disabled:opacity-50"
              >
                {loadingMore ? <><Loader2 size={14} className="animate-spin" /> Cargando…</> : <>Cargar más ({total - items.length} restantes)</>}
              </button>
            </div>
          )}
        </>
      )}

      {/* Footer hint */}
      <div className="mt-4 flex items-center gap-3 bg-[#0F0F0F] border border-[#1F1F1F] rounded-xl px-5 py-4 text-white/55 text-xs">
        <ExternalLink size={14} className="text-[#22C55E] shrink-0" />
        <span>
          Catálogo conectado en vivo a <a href="https://modrinth.com" target="_blank" rel="noreferrer" className="text-[#22C55E] hover:underline">Modrinth</a>.
          Si el {type === 'plugins' ? 'plugin' : type === 'modpacks' ? 'modpack' : 'mod'} que buscas está en CurseForge, usa el chat IA con
          "<em>instálame [nombre]</em>" — la IA lo busca y descarga.
        </span>
      </div>
    </div>
  );
};

export default CatalogView;
