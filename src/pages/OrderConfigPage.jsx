import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Check, ChevronRight, ArrowRight, Loader2, ServerCog, Globe,
  Tag, AlertTriangle, ChevronLeft, Box, Sparkles, Search, Wand2,
  Package, X, FileText
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const VERSIONS_API = 'https://api.fluxoai.co/api/versions';
const DRAFT_KEY = 'minelab-order-draft';

/* ═══ CATALOG ═══
 * Pricing v2 (lanzamiento 2026-04-27): subida de precios para sostener
 * el coste real de la VPS + soporte. Clientes anteriores quedan con su
 * tarifa congelada via grandfathering (Founder Member).
 * Annual = 11× monthly = 1 mes gratis.
 */
const PLANS = {
  '4gb': {
    id: '4gb',
    ram: 4,
    name: 'Pro 4 GB',
    monthly: 7.99,
    annual: 87.99,
    monthlyEq: 7.33,
    originalMonthly: 12,
    stripeMonthly: 'https://buy.stripe.com/14AbJ23PO9NB1dC0og3AY0e',
    stripeAnnual:  'https://buy.stripe.com/00w4gAbig6BpbSg4Ew3AY0j',
  },
  '6gb': {
    id: '6gb',
    ram: 6,
    name: 'Pro 6 GB',
    monthly: 10.99,
    annual: 120.99,
    monthlyEq: 10.08,
    originalMonthly: 15,
    popular: true,
    stripeMonthly: 'https://buy.stripe.com/00w00k2LK1h59K80og3AY0f',
    stripeAnnual:  'https://buy.stripe.com/eVq4gA5XWaRFaOcc6Y3AY0k',
  },
  '8gb': {
    id: '8gb',
    ram: 8,
    name: 'Pro 8 GB',
    monthly: 14.99,
    annual: 164.99,
    monthlyEq: 13.75,
    originalMonthly: 19,
    stripeMonthly: 'https://buy.stripe.com/00w8wQbigf7V9K86ME3AY0g',
    stripeAnnual:  'https://buy.stripe.com/fZu8wQ864aRF3lKb2U3AY0l',
  },
  '12gb': {
    id: '12gb',
    ram: 12,
    name: 'Pro 12 GB',
    monthly: 21.99,
    annual: 241.99,
    monthlyEq: 20.17,
    originalMonthly: 26,
    stripeMonthly: 'https://buy.stripe.com/14A3cw9a86Bp7C01sk3AY0h',
    stripeAnnual:  'https://buy.stripe.com/fZu8wQ9a8bVJ5tSb2U3AY0m',
  },
  '16gb': {
    id: '16gb',
    ram: 16,
    name: 'Pro 16 GB',
    monthly: 24.99,
    annual: 274.99,
    monthlyEq: 22.92,
    originalMonthly: 30,
    stripeMonthly: 'https://buy.stripe.com/3cI6oIfyw6Bp1dCc6Y3AY0i',
    stripeAnnual:  'https://buy.stripe.com/00w8wQeusgbZ7C09YQ3AY0n',
  },
};

/* ═══ Server templates ═══
 * Pre-configuran software + version + nombre sugerido + lista de mods/plugins
 * que el cliente pedirá al chat IA tras pagar (Phase 2: auto-instalación).
 */
const TEMPLATES = [
  {
    id: 'paper-smp',
    name: 'Paper SMP',
    tagline: 'Survival con plugins',
    description: 'Servidor estable con EssentialsX, LuckPerms y Vault listos. Ideal para comunidades sin mods.',
    software: 'paper',
    version: '1.21.4',
    suggestedName: 'SMP Survival',
    extras: ['EssentialsX', 'LuckPerms', 'Vault', 'WorldGuard'],
    extrasLabel: 'Plugins recomendados',
    badge: 'Más popular',
    accent: 'green',
    logo: 'https://avatars.githubusercontent.com/u/7608950',
  },
  {
    id: 'modpack',
    name: 'Modpack',
    tagline: 'Forge · Fabric · NeoForge',
    description: 'Busca cualquier modpack de CurseForge: RLCraft, ATM10, Cobblemon, Vault Hunters… Se instala solo.',
    isModpack: true,
    software: 'forge',
    badge: 'Trending',
    accent: 'orange',
    iconLucide: Package,
  },
  {
    id: 'custom',
    name: 'Personalizado',
    tagline: 'Configura todo a mano',
    description: 'Elige software, versión, plugins y mods desde cero. Para los que ya saben qué quieren.',
    custom: true,
    badge: null,
    accent: 'gray',
    iconLucide: ServerCog,
  },
];

const TEMPLATE_ACCENT = {
  green:  { border: 'border-[#22C55E]/40', bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]',   ring: 'ring-[#22C55E]/40',   glow: 'shadow-[0_0_24px_rgba(34,197,94,0.18)]' },
  pink:   { border: 'border-pink-500/40',  bg: 'bg-pink-500/10',  text: 'text-pink-300',     ring: 'ring-pink-400/40',    glow: 'shadow-[0_0_24px_rgba(236,72,153,0.18)]' },
  orange: { border: 'border-orange-500/40',bg: 'bg-orange-500/10',text: 'text-orange-300',   ring: 'ring-orange-400/40',  glow: 'shadow-[0_0_24px_rgba(249,115,22,0.18)]' },
  blue:   { border: 'border-sky-500/40',   bg: 'bg-sky-500/10',   text: 'text-sky-300',      ring: 'ring-sky-400/40',     glow: 'shadow-[0_0_24px_rgba(56,189,248,0.18)]' },
  gray:   { border: 'border-white/15',     bg: 'bg-white/[0.03]', text: 'text-white/80',     ring: 'ring-white/20',       glow: 'shadow-[0_0_18px_rgba(255,255,255,0.08)]' },
};

const SOFTWARES = [
  { id: 'paper',    label: 'Paper',    logo: 'https://avatars.githubusercontent.com/u/7608950',   tag: 'Recomendado',   desc: 'Plugins Bukkit/Spigot. Lo más estable.' },
  { id: 'fabric',   label: 'Fabric',   logo: 'https://avatars.githubusercontent.com/u/53422383',  tag: 'Mods modernos', desc: 'Loader ligero. Cobblemon, Sodium…' },
  { id: 'forge',    label: 'Forge',    logo: 'https://avatars.githubusercontent.com/u/588154',    tag: 'Modpacks',      desc: 'Estándar para mods complejos.' },
  { id: 'neoforge', label: 'NeoForge', logo: 'https://avatars.githubusercontent.com/u/131057723', tag: 'Forge moderno', desc: 'Fork moderno y mejor mantenido.' },
  { id: 'vanilla',  label: 'Vanilla',  logo: 'https://avatars.githubusercontent.com/u/1162641',   tag: 'Oficial Mojang',desc: 'Sin modificaciones.' },
];

const FEATURES = (ram) => [
  `${ram} GB RAM ECC dedicada`,
  'AMD Ryzen 9 · 12 cores físicos',
  'NVMe Datacenter en RAID',
  'Falkenstein 🇩🇪 · 30 ms desde España',
  'Anti-DDoS Protection incluida',
  'Backups automáticos + off-site',
  'tunombre.minelab.gg sin puerto',
  'Asistente IA · gestión total',
];

/* ═══ Stepper component ═══ */
const Stepper = ({ step }) => {
  const steps = ['Plan', 'Configurar', 'Pagar'];
  return (
    <div className="flex items-center gap-2 md:gap-4 mb-10">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < step;
        const active = idx === step;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2.5 md:gap-3">
              <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center font-black text-xs md:text-sm transition-all ${
                done ? 'bg-[#22C55E] text-[#0A0A0A]' :
                active ? 'bg-[#22C55E]/15 text-[#22C55E] border-2 border-[#22C55E]' :
                'bg-white/5 text-[#6B6B6B] border border-white/10'
              }`}>
                {done ? <Check size={14} strokeWidth={3} /> : idx}
              </div>
              <span className={`text-xs md:text-sm font-black uppercase tracking-[0.15em] ${
                done ? 'text-white' : active ? 'text-[#22C55E]' : 'text-[#6B6B6B]'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${idx < step ? 'bg-[#22C55E]' : 'bg-white/10'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ═══ Section header ═══ */
const Section = ({ number, title, children }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.25em]">{number}</span>
      <h3 className="text-white font-black text-base md:text-lg uppercase tracking-tight">{title}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-[#22C55E]/20 via-[#1A1A1A] to-transparent" />
    </div>
    {children}
  </div>
);

/* ═══ Main page ═══ */
const OrderConfigPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // Restore draft from localStorage if continuing post-login
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); } catch { return {}; }
  })();

  const initialPlanId = params.get('plan') || stored.planId || '6gb';
  const initialBilling = params.get('billing') || stored.billing || 'monthly';

  // Tracking referido: si entra con ?ref=USER_ID lo persistimos para attribution post-pago
  useEffect(() => {
    const ref = params.get('ref');
    if (ref && /^[0-9a-f-]{36}$/i.test(ref)) {
      try {
        localStorage.setItem('minelab-ref', ref);
        localStorage.setItem('minelab-ref-at', String(Date.now()));
      } catch {}
    }
  }, []);

  const [planId, setPlanId] = useState(PLANS[initialPlanId] ? initialPlanId : '6gb');
  const [billing, setBilling] = useState(initialBilling);
  const [templateId, setTemplateId] = useState(stored.templateId || null);
  const [serverName, setServerName] = useState(stored.serverName || '');
  const [software, setSoftware] = useState(stored.software || 'paper');
  const [version, setVersion] = useState(stored.version || '');
  const [coupon, setCoupon] = useState(stored.coupon || '');
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionSearch, setVersionSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const versionsRef = useRef(null);
  const [slugCheck, setSlugCheck] = useState({ status: 'idle', slug: null, suggestions: [], full: null });

  // Modpack browser (sólo aplicable a Forge/Fabric/NeoForge)
  const [modpackQuery, setModpackQuery] = useState('');
  const [modpackResults, setModpackResults] = useState([]);
  const [modpackLoading, setModpackLoading] = useState(false);
  const [selectedModpack, setSelectedModpack] = useState(stored.modpack || null);
  const [loaderFilter, setLoaderFilter] = useState('all'); // all | forge | fabric | neoforge
  const [sortBy, setSortBy] = useState('popular'); // popular | updated | created

  // Términos y condiciones — obligatorio para checkout (protección legal).
  // Si el user ya marcó T&C antes y vuelve de OAuth con ?continue=1, se auto-acepta
  // (de otra forma jamás hubiera podido iniciar el flujo OAuth — canCheckout exige T&C).
  const [termsAccepted, setTermsAccepted] = useState(() => {
    try { return new URLSearchParams(window.location.search).get('continue') === '1'; }
    catch { return false; }
  });

  // Comprueba disponibilidad de slug con debounce 400ms
  useEffect(() => {
    const name = serverName.trim();
    if (name.length < 3) { setSlugCheck({ status: 'idle', slug: null, suggestions: [], full: null }); return; }
    setSlugCheck(s => ({ ...s, status: 'checking' }));
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/check-slug?name=${encodeURIComponent(name)}`);
        const d = await r.json();
        if (d.available) setSlugCheck({ status: 'available', slug: d.slug, suggestions: [], full: d.full });
        else if (d.reason === 'taken') setSlugCheck({ status: 'taken', slug: d.slug, suggestions: d.suggestions || [], full: d.full });
        else setSlugCheck({ status: 'invalid', slug: null, suggestions: [], full: null });
      } catch { setSlugCheck({ status: 'idle', slug: null, suggestions: [], full: null }); }
    }, 400);
    return () => clearTimeout(t);
  }, [serverName]);

  const plan = PLANS[planId];
  const isAnnual = billing === 'annual';

  /* Auth state */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  /* Persist draft */
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      planId, billing, templateId, serverName, software, version, coupon,
      modpack: selectedModpack,
    }));
  }, [planId, billing, templateId, serverName, software, version, coupon, selectedModpack]);

  /* Modpack search — debounce 400ms. Si loaderFilter=all consulta los 3
     loaders en paralelo y mergea por project_id. Si está en uno concreto,
     query directo a ese. Cada item lleva `_loader`. */
  useEffect(() => {
    const t = setTimeout(async () => {
      setModpackLoading(true);
      try {
        const q = modpackQuery.trim() || 'popular';
        const apiUrl = import.meta.env.VITE_API_URL || 'https://api.fluxoai.co';
        const fetchOne = (loader, lim) =>
          fetch(`${apiUrl}/api/catalog/search?q=${encodeURIComponent(q)}&type=modpack&server_type=${loader}&limit=${lim}&sort=${sortBy}`)
            .then(r => r.json())
            .then(j => (Array.isArray(j.items) ? j.items : []).map(it => ({ ...it, _loader: loader })))
            .catch(() => []);

        let merged = [];
        if (loaderFilter === 'all') {
          // 3 loaders paralelo, dedup por project_id (first wins)
          const lists = await Promise.all([fetchOne('forge', 6), fetchOne('fabric', 6), fetchOne('neoforge', 6)]);
          const seen = new Set();
          for (const list of lists) {
            for (const item of list) {
              if (seen.has(item.project_id)) continue;
              seen.add(item.project_id);
              merged.push(item);
            }
          }
          if (sortBy === 'popular') merged.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
          merged = merged.slice(0, 12);
        } else {
          merged = await fetchOne(loaderFilter, 12);
        }
        setModpackResults(merged);
      } catch { setModpackResults([]); }
      finally { setModpackLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [modpackQuery, loaderFilter, sortBy]);

  /* Limpia nombre de modpack para sugerirlo como server_name:
     - Elimina texto entre paréntesis (suele ser el loader o versión)
     - Corta en el primer separador (- – — :)
     - Trim a 40 chars
     Ejemplo: "Cobbleverse - Pokemon Adventure (Cobblemon)" → "Cobbleverse"
              "All The Mods 9 - To The Sky" → "All The Mods 9"  */
  const cleanModpackName = (raw) => {
    if (!raw) return '';
    let s = String(raw).replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    s = s.split(/\s+[-–—:]\s+/)[0].trim();
    return s.slice(0, 40);
  };

  /* Pick modpack: cambia software al loader del modpack, aplica versión y nombre */
  const pickModpack = (mp) => {
    setSelectedModpack({
      project_id: mp.project_id,
      name: mp.name,
      image: mp.image,
      description: mp.description,
      downloads: mp.downloads,
      project_url: mp.project_url,
      versions: mp.versions || [],
      loader: mp._loader || 'forge',
    });
    // Selecciona el modpack como template (visualmente la card "Modpack" queda activa)
    setTemplateId('modpack');
    // Si el modpack es de un loader distinto al seleccionado actual, cambia software
    if (mp._loader && mp._loader !== software) {
      setSoftware(mp._loader);
      // El effect de versions se disparará y elegirá la primera; aquí sólo guardamos pista
    }
    if (mp.versions && mp.versions[0]) {
      setVersion(mp.versions[0]); // se valida más tarde contra la lista de versiones cargada
    }
    if (!serverName.trim()) setServerName(cleanModpackName(mp.name));
  };

  /* Apply template selection — autopopula software, version, nombre sugerido */
  const applyTemplate = (tpl) => {
    setTemplateId(tpl.id);
    if (tpl.custom) {
      // Personalizado: limpia modpack si había, deja que el user elija todo
      setSelectedModpack(null);
      return;
    }
    if (tpl.isModpack) {
      // Modpack: pone software default si el actual no es mod-loader, scroll al picker
      if (!['forge','fabric','neoforge'].includes(software)) setSoftware(tpl.software);
      setTimeout(() => {
        document.getElementById('modpack-picker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }
    // Paper SMP (o cualquier preset no-modpack): limpia modpack y aplica defaults
    setSelectedModpack(null);
    setSoftware(tpl.software);
    setVersion(tpl.version);
    if (!serverName.trim()) setServerName(tpl.suggestedName);
  };

  /* Helpers de visibilidad por template seleccionado */
  const isPaperSMP = templateId === 'paper-smp';
  const isModpackTpl = templateId === 'modpack';
  const isCustomTpl = templateId === 'custom';
  const noTemplate = !templateId;
  // Sección 03 Modpack visible cuando el user picó "Modpack" (o todavía no eligió template)
  const showModpackSection = isModpackTpl || noTemplate;
  // Sección 05 Software: solo visible si Personalizado o sin template
  const showSoftwareSection = isCustomTpl || noTemplate;
  // Sección 06 Versión: si Modpack la versión la define el modpack → ocultar
  const showVersionSection = !isModpackTpl;

  const selectedTemplate = TEMPLATES.find((t) => t.id === templateId);

  /* Fetch versions when software changes */
  useEffect(() => {
    let cancelled = false;
    setVersionsLoading(true);
    fetch(`${VERSIONS_API}?software=${software}`)
      .then(r => r.json())
      .then(j => {
        if (cancelled) return;
        const list = Array.isArray(j.versions) ? j.versions : [];
        setVersions(list);
        if (list.length > 0 && (!version || !list.includes(version))) {
          setVersion(list[0]);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setVersionsLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [software]);

  /* Close version dropdown on outside click */
  useEffect(() => {
    if (!versionsOpen) return;
    const handler = (e) => {
      if (versionsRef.current && !versionsRef.current.contains(e.target)) {
        setVersionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [versionsOpen]);

  /* Auto-resume after OAuth: if ?continue=1 + logged in + valid form → fire checkout */
  const continueFlag = params.get('continue');
  useEffect(() => {
    if (continueFlag === '1' && user && serverName && plan) {
      // Slight delay to show user the state is restored
      const t = setTimeout(() => handleCheckout(), 500);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continueFlag, user]);

  /* Pricing computation (frontend, stays in sync with backend Stripe products) */
  const fmtEur = (n) => n.toFixed(2).replace('.', ',');
  const subtotal = isAnnual ? plan.annual : plan.monthly;
  const discount = 0; // Stripe checkout aplica el cupón (allow_promotion_codes=true)
  const totalToday = subtotal - discount;
  const renewal = isAnnual ? `${fmtEur(plan.annual)}€/año` : `${fmtEur(plan.monthly)}€/mes`;
  const savingPct = isAnnual
    ? Math.round((1 - (plan.monthlyEq * 12) / (plan.originalMonthly * 12)) * 100)
    : Math.round((1 - plan.monthly / plan.originalMonthly) * 100);

  /* Validation */
  const cleanName = serverName.trim();
  const nameValid = cleanName.length >= 3 && cleanName.length <= 40;
  const canCheckout = nameValid && version && plan && termsAccepted && !submitting;

  /* Create draft + checkout */
  async function handleCheckout() {
    if (!canCheckout) return;
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        // Save and bounce to OAuth, return to /configurar?continue=1
        localStorage.setItem('minelab-pending-order', '1');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/configurar?continue=1',
            queryParams: { prompt: 'select_account' },
          }
        });
        if (error) {
          alert('No se pudo iniciar sesión: ' + error.message);
          setSubmitting(false);
        }
        return;
      }

      // Insert draft mc_servers row.
      // Si la columna `template` no existe en la tabla, el insert falla. Hacemos
      // un retry sin esa columna en caso de error 400 (column does not exist).
      const baseDraft = {
        user_id: userId,
        server_name: cleanName,
        server_type: software,
        mc_version: version,
        ram_gb: plan.ram,
        status: 'draft',
        status_server: 'offline',
        ready: false,
        mods: false,
        mod_count: 0,
      };
      // Componer payload con template y/o modpack si aplican.
      // Las columnas `template` y `modpack_project_id` pueden no existir aún en
      // la tabla; si insert falla con "column does not exist" se reintenta sin.
      let draftPayload = { ...baseDraft };
      if (templateId && !selectedTemplate?.custom) {
        draftPayload.template = templateId;
      }
      if (selectedModpack?.project_id) {
        draftPayload.modpack_project_id = selectedModpack.project_id;
        draftPayload.modpack_name = selectedModpack.name;
      }

      let { data: draft, error: insErr } = await supabase
        .from('mc_servers')
        .insert(draftPayload)
        .select('id')
        .single();

      // Fallback si alguna columna opcional aún no existe en producción
      if (insErr && /column.*(template|modpack).*does not exist/i.test(insErr.message || '')) {
        console.warn('[OrderConfig] optional column missing, retry without modpack/template fields');
        const retry = await supabase
          .from('mc_servers')
          .insert(baseDraft)
          .select('id')
          .single();
        draft = retry.data;
        insErr = retry.error;
      }
      if (insErr || !draft?.id) {
        alert('No se pudo crear el borrador del servidor. Intenta de nuevo.');
        setSubmitting(false);
        return;
      }

      // Compose Stripe URL with our server_id and prefilled email
      const stripeUrl = isAnnual ? plan.stripeAnnual : plan.stripeMonthly;
      const sep = stripeUrl.includes('?') ? '&' : '?';
      const finalUrl =
        `${stripeUrl}${sep}client_reference_id=${encodeURIComponent(draft.id)}` +
        `&prefilled_email=${encodeURIComponent(session.user.email || '')}`;

      // Clean local draft (Stripe takes over from here)
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem('minelab-pending-order');
      window.location.href = finalUrl;
    } catch (err) {
      console.error('[OrderConfig] checkout failed:', err);
      alert('Hubo un problema. Intenta de nuevo.');
      setSubmitting(false);
    }
  }

  const versionsFiltered = versions.filter(v =>
    !versionSearch || v.toLowerCase().includes(versionSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#0A0A0A]/85 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#B3B3B3] hover:text-white text-sm font-bold uppercase tracking-wider transition-colors"
          >
            <ChevronLeft size={16} />
            Volver
          </button>
          <a href="/" className="font-black text-xl tracking-tight uppercase">
            Mine<span className="text-[#22C55E]">Lab</span>
          </a>
          {user ? (
            <span className="text-xs text-[#6B6B6B] hidden sm:inline">
              {user.email}
            </span>
          ) : (
            <span className="text-xs text-[#6B6B6B] hidden sm:inline">Pago seguro · Stripe</span>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-7xl">
        <Stepper step={2} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* ═══════ LEFT: FORM ═══════ */}
          <div>
            {/* Hero */}
            <div className="mb-10">
              <p className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.3em] mb-2 flex items-center gap-2">
                <Sparkles size={11} /> Paso 2 de 3 — Configuración
              </p>
              <h1 className="text-white font-black text-3xl md:text-5xl uppercase tracking-tight leading-[0.95]">
                CASI <span className="text-[#22C55E]">LISTO</span>
              </h1>
              <p className="text-[#8B8B8B] text-sm mt-3 max-w-lg">
                Solo lo esencial para crear tu servidor. Todo se aplica al instante tras pagar — y lo que elijas aquí se puede cambiar después.
              </p>
            </div>

            {/* Plan & billing */}
            <Section number="01" title="Plan & ciclo">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
                {Object.values(PLANS).map(p => {
                  const sel = p.id === planId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlanId(p.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        sel ? 'border-[#22C55E] bg-[#22C55E]/5 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                            : 'border-[#1F1F1F] bg-[#0F0F0F] hover:border-[#2A2A2A]'
                      }`}
                    >
                      {p.popular && (
                        <span className="absolute -top-2 right-3 bg-[#22C55E] text-[#0A0A0A] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                          Popular
                        </span>
                      )}
                      <p className={`font-black text-sm uppercase tracking-tight mb-1 ${sel ? 'text-[#22C55E]' : 'text-white'}`}>
                        {p.ram} GB
                      </p>
                      <p className="text-[#8B8B8B] text-xs">
                        {p.monthly.toFixed(2).replace('.', ',')}€/mes
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    billing === 'monthly'
                      ? 'border-[#22C55E] bg-[#22C55E]/5'
                      : 'border-[#1F1F1F] bg-[#0F0F0F] hover:border-[#2A2A2A]'
                  }`}
                >
                  <p className="font-black text-sm uppercase tracking-tight text-white mb-1">Mensual</p>
                  <p className="text-[#8B8B8B] text-xs">{plan.monthly.toFixed(2).replace('.', ',')}€/mes · cancela cuando quieras</p>
                </button>
                <button
                  onClick={() => setBilling('annual')}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    billing === 'annual'
                      ? 'border-[#22C55E] bg-[#22C55E]/5'
                      : 'border-[#1F1F1F] bg-[#0F0F0F] hover:border-[#2A2A2A]'
                  }`}
                >
                  <span className="absolute -top-2 right-3 bg-[#22C55E]/20 text-[#22C55E] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-[#22C55E]/30">
                    1 solo pago
                  </span>
                  <p className="font-black text-sm uppercase tracking-tight text-white mb-1">Anual</p>
                  <p className="text-[#8B8B8B] text-xs">{plan.annual.toFixed(2).replace('.', ',')}€/año · {plan.monthlyEq.toFixed(2).replace('.', ',')}€/mes equiv.</p>
                </button>
              </div>
            </Section>

            {/* Template picker — opcional, autopopula software/version/nombre */}
            <Section number="02" title="Tipo de servidor">
              <p className="text-[#8B8B8B] text-sm mb-4 -mt-2">
                Empieza desde un preset listo o configura todo a mano abajo.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {TEMPLATES.map((tpl) => {
                  const sel = templateId === tpl.id;
                  const acc = TEMPLATE_ACCENT[tpl.accent] || TEMPLATE_ACCENT.gray;
                  const Icon = tpl.iconLucide;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => applyTemplate(tpl)}
                      className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
                        sel
                          ? `${acc.border} ${acc.bg} ${acc.glow}`
                          : 'border-[#1F1F1F] bg-[#0F0F0F] hover:border-[#2A2A2A] hover:bg-[#141414]'
                      }`}
                    >
                      {tpl.badge && (
                        <span className={`absolute -top-2 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          sel ? `${acc.bg} ${acc.text} border ${acc.border}` : 'bg-[#1F1F1F] text-[#8B8B8B]'
                        }`}>
                          {tpl.badge}
                        </span>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        {tpl.logo ? (
                          <img
                            src={tpl.logo}
                            alt={`${tpl.name} logo`}
                            className="w-12 h-12 rounded-xl object-cover bg-[#0A0A0A] border border-white/10"
                            loading="lazy"
                          />
                        ) : Icon ? (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                            sel ? `${acc.bg} ${acc.border}` : 'bg-[#0A0A0A] border-white/10'
                          }`}>
                            <Icon size={22} className={sel ? acc.text : 'text-white/70'} strokeWidth={2} />
                          </div>
                        ) : null}
                        {sel && <Check size={16} className={acc.text} strokeWidth={3} />}
                      </div>
                      <p className={`font-black text-base uppercase tracking-tight mb-0.5 ${sel ? acc.text : 'text-white'}`}>
                        {tpl.name}
                      </p>
                      <p className={`text-[10px] uppercase font-bold tracking-wider mb-2 ${sel ? acc.text : 'text-[#22C55E]/70'}`}>
                        {tpl.tagline}
                      </p>
                      <p className="text-xs text-[#8B8B8B] leading-snug">{tpl.description}</p>
                    </button>
                  );
                })}
              </div>

              {selectedTemplate && !selectedTemplate.custom && selectedTemplate.extras?.length > 0 && (
                <div className="mt-4 p-4 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/[0.04]">
                  <div className="flex items-start gap-3">
                    <Wand2 size={16} className="text-[#22C55E] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.2em] mb-1">
                        {selectedTemplate.extrasLabel || 'Incluye'}
                      </p>
                      <p className="text-white text-sm font-bold">
                        {selectedTemplate.extras.join(' · ')}
                      </p>
                      <p className="text-[#8B8B8B] text-xs mt-2 leading-relaxed">
                        Tras pagar, escribe al chat IA: <span className="text-[#22C55E] font-mono">"instálame {selectedTemplate.extras[0]}"</span> y lo configura solo en segundos.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Section>

            {/* Modpack browser — visible cuando template=Modpack o sin template */}
            <div id="modpack-picker" />
            {showModpackSection && (
            <Section number="03" title={isModpackTpl ? 'Catálogo de modpacks' : 'Modpack (opcional)'}>
              <p className="text-[#8B8B8B] text-sm mb-4 -mt-2">
                {isModpackTpl
                  ? 'Filtra por loader y elige cualquier modpack de CurseForge. La versión y el software se eligen automático.'
                  : 'Busca cualquier modpack de CurseForge — RLCraft, ATM10, Cobblemon, Vault Hunters…'}
              </p>

              {/* Modpack seleccionado — card destacada con imagen real */}
              {selectedModpack && (
                <div className="relative p-4 rounded-2xl border-2 border-[#22C55E]/40 bg-[#22C55E]/[0.06] shadow-[0_0_24px_rgba(34,197,94,0.15)] mb-3">
                  <button
                    onClick={() => setSelectedModpack(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-[#0A0A0A]/80 border border-white/10 hover:border-[#22C55E]/40 flex items-center justify-center text-[#8B8B8B] hover:text-white transition-colors"
                    aria-label="Quitar modpack"
                  >
                    <X size={13} />
                  </button>
                  <div className="flex items-start gap-4">
                    {selectedModpack.image && (
                      <img
                        src={selectedModpack.image}
                        alt={selectedModpack.name}
                        className="w-20 h-20 rounded-xl object-cover bg-[#0A0A0A] border border-white/10 shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.2em] mb-1 flex items-center gap-1.5">
                        <Check size={11} strokeWidth={3} /> Modpack elegido
                      </p>
                      <p className="text-white font-black text-base uppercase tracking-tight mb-1.5">
                        {selectedModpack.name}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        {selectedModpack.loader && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 border border-orange-500/30">
                            {selectedModpack.loader === 'forge' ? 'Forge' : selectedModpack.loader === 'fabric' ? 'Fabric' : 'NeoForge'}
                          </span>
                        )}
                        {selectedModpack.versions && selectedModpack.versions[0] && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/25 font-mono">
                            {selectedModpack.versions[0]}
                          </span>
                        )}
                        {selectedModpack.downloads > 0 && (
                          <span className="text-[10px] font-bold text-[#8B8B8B]">
                            {(selectedModpack.downloads / 1e6).toFixed(1)}M descargas
                          </span>
                        )}
                      </div>
                      <p className="text-[#B3B3B3] text-xs leading-snug line-clamp-2">
                        {selectedModpack.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Buscador y resultados (3 loaders en paralelo + filtros) */}
              {(
                <>
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
                    <input
                      type="text"
                      value={modpackQuery}
                      onChange={e => setModpackQuery(e.target.value)}
                      placeholder="Buscar modpacks (RLCraft, ATM, Cobblemon…)"
                      className="w-full bg-[#0F0F0F] border-2 border-[#1F1F1F] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#4B4B4B] focus:outline-none focus:border-[#22C55E]/40 transition-colors text-sm"
                    />
                    {modpackLoading && (
                      <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#22C55E] animate-spin" />
                    )}
                  </div>

                  {/* Filtros: loader pills + sort */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[10px] uppercase font-black text-[#6B6B6B] tracking-wider mr-1">Loader:</span>
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'forge', label: 'Forge' },
                      { id: 'fabric', label: 'Fabric' },
                      { id: 'neoforge', label: 'NeoForge' },
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => setLoaderFilter(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border-2 transition-all ${
                          loaderFilter === p.id
                            ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]'
                            : 'border-[#1F1F1F] bg-[#0F0F0F] text-[#8B8B8B] hover:border-[#2A2A2A] hover:text-white'
                        }`}
                      >{p.label}</button>
                    ))}
                    <span className="text-[10px] uppercase font-black text-[#6B6B6B] tracking-wider ml-2 mr-1">Orden:</span>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="bg-[#0F0F0F] border-2 border-[#1F1F1F] rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white focus:outline-none focus:border-[#22C55E]/40 cursor-pointer"
                    >
                      <option value="popular">Más populares</option>
                      <option value="updated">Actualizados</option>
                      <option value="created">Más nuevos</option>
                    </select>
                  </div>

                  {modpackResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {modpackResults.map(mp => {
                        const sel = selectedModpack?.project_id === mp.project_id;
                        const loaderLabel = mp._loader === 'forge' ? 'Forge' : mp._loader === 'fabric' ? 'Fabric' : mp._loader === 'neoforge' ? 'NeoForge' : '';
                        const mcVer = mp.versions && mp.versions[0] ? mp.versions[0] : '';
                        return (
                          <button
                            key={`${mp.project_id}-${mp._loader}`}
                            onClick={() => pickModpack(mp)}
                            className={`text-left p-3 rounded-xl border-2 transition-all flex gap-3 ${
                              sel
                                ? 'border-[#22C55E] bg-[#22C55E]/5 shadow-[0_0_18px_rgba(34,197,94,0.18)]'
                                : 'border-[#1F1F1F] bg-[#0F0F0F] hover:border-[#2A2A2A] hover:bg-[#141414]'
                            }`}
                          >
                            {mp.image ? (
                              <img
                                src={mp.image}
                                alt={mp.name}
                                className="w-16 h-16 rounded-lg object-cover bg-[#0A0A0A] border border-white/5 shrink-0"
                                loading="lazy"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-[#1A1A1A] border border-white/5 flex items-center justify-center shrink-0">
                                <Package size={22} className="text-[#4B4B4B]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`font-black text-xs uppercase tracking-tight mb-1 truncate ${sel ? 'text-[#22C55E]' : 'text-white'}`}>
                                {mp.name}
                              </p>
                              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                {loaderLabel && (
                                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-300 border border-orange-500/30">
                                    {loaderLabel}
                                  </span>
                                )}
                                {mcVer && (
                                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/25 font-mono">
                                    {mcVer}
                                  </span>
                                )}
                                {mp.downloads > 0 && (
                                  <span className="text-[9px] font-bold text-[#8B8B8B]">
                                    {mp.downloads >= 1e6
                                      ? `${(mp.downloads / 1e6).toFixed(1)}M`
                                      : `${Math.round(mp.downloads / 1000)}k`} dl
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#8B8B8B] leading-snug line-clamp-2">
                                {mp.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!modpackLoading && modpackResults.length === 0 && modpackQuery.trim() && (
                    <p className="text-xs text-[#6B6B6B] text-center py-4">
                      Sin resultados para "{modpackQuery}". Prueba otro nombre.
                    </p>
                  )}
                </>
              )}

              {selectedModpack && (
                <div className="mt-3 p-3 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/[0.04] flex items-start gap-2.5">
                  <Wand2 size={14} className="text-[#22C55E] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#B3B3B3] leading-relaxed">
                    Tras pagar, di al chat IA: <span className="text-[#22C55E] font-mono font-bold">"instálame el modpack {selectedModpack.name}"</span> y se configura automáticamente (descarga ~1-5 min).
                  </p>
                </div>
              )}
            </Section>
            )}

            {/* Server name */}
            <Section number="04" title="Nombre del servidor">
              <p className="text-[#8B8B8B] text-sm mb-4 -mt-2">
                Será tu IP pública: <span className="text-white font-mono">tunombre.minelab.gg</span>. Letras, números y guiones.
              </p>
              <input
                type="text"
                value={serverName}
                onChange={e => setServerName(e.target.value.slice(0, 40))}
                placeholder="Mi server épico"
                maxLength={40}
                className={`w-full bg-[#0F0F0F] border-2 rounded-xl px-4 py-3.5 text-white placeholder-[#4B4B4B] focus:outline-none transition-colors ${
                  slugCheck.status === 'taken' ? 'border-amber-500/50 focus:border-amber-400' :
                  slugCheck.status === 'available' ? 'border-[#22C55E]/40 focus:border-[#22C55E]' :
                  'border-[#1F1F1F] focus:border-[#22C55E]/40'
                }`}
              />
              {/* Indicador de disponibilidad */}
              <div className="mt-2 min-h-[20px]">
                {cleanName.length === 0 && (
                  <p className="text-xs text-[#6B6B6B]">Mínimo 3 caracteres.</p>
                )}
                {cleanName.length > 0 && cleanName.length < 3 && (
                  <p className="text-xs text-[#6B6B6B]">Mínimo 3 caracteres.</p>
                )}
                {cleanName.length >= 3 && slugCheck.status === 'checking' && (
                  <p className="text-xs text-[#6B6B6B] flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#6B6B6B] animate-pulse"/>Comprobando…</p>
                )}
                {slugCheck.status === 'available' && slugCheck.full && (
                  <p className="text-xs text-[#22C55E] flex items-center gap-1.5">
                    <span className="text-base leading-none">✓</span>
                    Disponible — tu IP será <span className="font-mono font-bold ml-1">{slugCheck.full}</span>
                  </p>
                )}
                {slugCheck.status === 'taken' && (
                  <div className="text-xs space-y-1.5">
                    <p className="text-amber-400 flex items-center gap-1.5">
                      <span className="text-base leading-none">⚠️</span>
                      <span><span className="font-mono">{slugCheck.slug}</span> ya está cogido. Elige otro nombre o prueba:</span>
                    </p>
                    {slugCheck.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {slugCheck.suggestions.map(sug => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setServerName(sug)}
                            className="px-2.5 py-1 bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 rounded-md font-mono text-[#22C55E] hover:text-[#1faa50] transition-colors text-[11px]"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {slugCheck.status === 'invalid' && (
                  <p className="text-xs text-amber-400">Usa solo letras, números, espacios o guiones.</p>
                )}
              </div>
            </Section>

            {/* Software — solo en Personalizado o sin template */}
            {showSoftwareSection && (
            <Section number="05" title="Software del servidor">
              <p className="text-[#8B8B8B] text-sm mb-4 -mt-2">
                El motor que ejecuta tu Minecraft. Puedes cambiarlo después desde el panel.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {SOFTWARES.map(s => {
                  const sel = software === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setSoftware(s.id); setVersion(''); }}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        sel ? 'border-[#22C55E] bg-[#22C55E]/5 shadow-[0_0_20px_rgba(34,197,94,0.12)]'
                            : 'border-[#1F1F1F] bg-[#0F0F0F] hover:border-[#2A2A2A]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <img
                          src={s.logo}
                          alt={`${s.label} logo`}
                          className="w-9 h-9 rounded-lg object-cover bg-[#0A0A0A] border border-white/5"
                          loading="lazy"
                        />
                        {sel && (
                          <Check size={14} className="text-[#22C55E] mt-1" strokeWidth={3} />
                        )}
                      </div>
                      <p className={`font-black text-sm uppercase tracking-tight ${sel ? 'text-[#22C55E]' : 'text-white'}`}>
                        {s.label}
                      </p>
                      <p className="text-[10px] text-[#22C55E]/70 uppercase font-bold tracking-wider mt-0.5">
                        {s.tag}
                      </p>
                      <p className="text-xs text-[#8B8B8B] mt-1.5 leading-snug">{s.desc}</p>
                    </button>
                  );
                })}
              </div>
            </Section>
            )}

            {/* Version dropdown — oculta en template Modpack (modpack define versión) */}
            {showVersionSection && (
            <Section number="06" title="Versión de Minecraft">
              <p className="text-[#8B8B8B] text-sm mb-4 -mt-2">
                Versiones reales de la fuente oficial. Cambiables después sin perder tu mundo.
              </p>
              <div ref={versionsRef} className="relative">
                <button
                  onClick={() => setVersionsOpen(o => !o)}
                  disabled={versionsLoading || versions.length === 0}
                  className="w-full bg-[#0F0F0F] border-2 border-[#1F1F1F] hover:border-[#2A2A2A] rounded-xl px-4 py-3.5 text-left flex items-center justify-between transition-colors disabled:opacity-60"
                >
                  <span className="text-white font-bold flex items-center gap-2">
                    {versionsLoading && <Loader2 size={14} className="animate-spin text-[#22C55E]" />}
                    {versionsLoading ? 'Cargando…' : (version || 'Selecciona versión')}
                  </span>
                  <ChevronRight size={16} className={`text-[#6B6B6B] transition-transform ${versionsOpen ? 'rotate-90' : ''}`} />
                </button>
                {versionsOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0F0F0F] border-2 border-[#22C55E]/20 rounded-xl shadow-2xl z-20 overflow-hidden">
                    <div className="p-3 border-b border-white/5">
                      <div className="relative">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
                        <input
                          autoFocus
                          type="text"
                          value={versionSearch}
                          onChange={e => setVersionSearch(e.target.value)}
                          placeholder="Buscar…"
                          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-[#4B4B4B] focus:outline-none focus:border-[#22C55E]/40"
                        />
                      </div>
                    </div>
                    <div className="max-h-[260px] overflow-y-auto p-2 grid grid-cols-3 md:grid-cols-5 gap-1.5">
                      {versionsFiltered.map(v => (
                        <button
                          key={v}
                          onClick={() => { setVersion(v); setVersionsOpen(false); setVersionSearch(''); }}
                          className={`px-2 py-2 rounded-lg border text-xs font-black transition-all ${
                            version === v
                              ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]'
                              : 'border-[#1F1F1F] bg-[#0A0A0A] text-[#B3B3B3] hover:border-[#2A2A2A] hover:text-white'
                          }`}
                        >{v}</button>
                      ))}
                      {versionsFiltered.length === 0 && (
                        <p className="col-span-full text-[#6B6B6B] text-xs text-center py-4">Sin resultados.</p>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-white/5 text-[10px] text-[#6B6B6B] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#22C55E]" />
                      {versions.length} versiones · datos en vivo desde la fuente oficial
                    </div>
                  </div>
                )}
              </div>
            </Section>
            )}

            {/* Location (info card, single location) */}
            <Section number="07" title="Ubicación">
              <div className="bg-[#0F0F0F] border-2 border-[#1F1F1F] rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center shrink-0">
                  <Globe size={20} className="text-[#22C55E]" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm uppercase tracking-tight">Falkenstein 🇩🇪</p>
                  <p className="text-[#8B8B8B] text-xs mt-0.5">~30 ms desde España · NVMe Datacenter · 1 Gbps</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] uppercase font-black tracking-wider text-[#22C55E]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  Online
                </div>
              </div>
            </Section>

            {/* Coupon — solo válido en pagos mensuales (los anuales NO admiten códigos) */}
            <Section number="08" title="Cupón de descuento">
              {isAnnual ? (
                <div className="rounded-xl border-2 border-[#F59E0B]/30 bg-[#F59E0B]/5 px-4 py-4 flex items-start gap-3">
                  <Tag size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-white font-bold mb-1">Los códigos no aplican en pagos anuales</p>
                    <p className="text-xs text-[#B3B3B3] leading-relaxed">
                      El plan anual ya incluye <span className="text-[#22C55E] font-bold">1 mes gratis</span> (pagas 11 meses, te llevas 12). Los cupones BETA30 / TIKTOK50 solo aplican al ciclo <span className="text-white font-bold">mensual</span>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-[#22C55E]/20 bg-[#22C55E]/5 px-4 py-4 flex items-start gap-3">
                  <Tag size={16} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-white font-bold mb-1">Aplica tu código en el pago</p>
                    <p className="text-xs text-[#B3B3B3] leading-relaxed">
                      En la pantalla de Stripe verás el campo <span className="text-[#22C55E] font-bold">"Add promotion code"</span>. Escribe ahí tu código (ej. <span className="font-mono text-[#22C55E]">BETA30</span>, <span className="font-mono text-[#22C55E]">TIKTOK50</span>) y se aplica al instante.
                    </p>
                  </div>
                </div>
              )}
            </Section>

            {/* Mobile-only T&C + checkout button (en desktop ambos viven en el sticky cart) */}
            <div className="lg:hidden mt-6 mb-3">
              <label
                htmlFor="terms-checkbox-mobile"
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  termsAccepted
                    ? 'border-[#22C55E]/40 bg-[#22C55E]/[0.06]'
                    : 'border-[#1F1F1F] bg-[#0F0F0F]'
                }`}
              >
                <input
                  id="terms-checkbox-mobile"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  termsAccepted ? 'border-[#22C55E] bg-[#22C55E]' : 'border-[#3A3A3A] bg-[#0A0A0A]'
                }`}>
                  {termsAccepted && <Check size={13} strokeWidth={3} className="text-[#0A0A0A]" />}
                </div>
                <p className="text-xs text-[#B3B3B3] leading-snug">
                  Acepto los <a href="/#terms" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[#22C55E] underline">Términos</a> y la{' '}
                  <a href="/#privacy" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[#22C55E] underline">Política de Privacidad</a>. Tengo al menos 16 años.
                </p>
              </label>
            </div>

            {/* Mobile-only checkout button */}
            <button
              onClick={handleCheckout}
              disabled={!canCheckout}
              className={`lg:hidden w-full mt-4 py-4 rounded-xl text-sm font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all ${
                canCheckout
                  ? 'bg-[#22C55E] text-[#0A0A0A] shadow-[0_8px_24px_rgba(34,197,94,0.35)]'
                  : 'bg-white/5 text-[#4B4B4B] cursor-not-allowed'
              }`}
            >
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Procesando…</> : <>Continuar al pago · {fmtEur(totalToday)}€ <ArrowRight size={14} strokeWidth={3} /></>}
            </button>
            {!termsAccepted && nameValid && version && (
              <p className="lg:hidden text-[10px] text-[#EAB308] text-center mt-2 flex items-center justify-center gap-1">
                <AlertTriangle size={10} /> Acepta los términos para continuar
              </p>
            )}
          </div>

          {/* ═══════ RIGHT: STICKY CART ═══════ */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-gradient-to-br from-[#0F0F0F] via-[#0F0F0F] to-[#0A1A0F] border-2 border-[#22C55E]/15 rounded-2xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(34,197,94,0.15)]">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5 bg-[#0A0A0A]/40">
                <p className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.25em] flex items-center gap-2">
                  <Box size={11} /> Tu pedido
                </p>
              </div>

              {/* Plan summary */}
              <div className="px-5 py-5 border-b border-white/5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-black text-base uppercase tracking-tight">{plan.name}</p>
                    <p className="text-[#8B8B8B] text-xs mt-0.5">{isAnnual ? 'Anual' : 'Mensual'} · auto-renovable</p>
                  </div>
                  <p className="text-white font-black text-lg">{fmtEur(subtotal)}€</p>
                </div>

                {/* Features list */}
                <ul className="space-y-2 mt-4 pl-2">
                  {FEATURES(plan.ram).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#B3B3B3]">
                      <Check size={11} strokeWidth={3} className="text-[#22C55E] mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Selected modpack — card destacada con imagen real */}
              {selectedModpack && (
                <div className="px-5 py-4 border-b border-white/5 bg-[#22C55E]/[0.04]">
                  <p className="text-[10px] uppercase font-black text-[#22C55E] tracking-wider mb-3 flex items-center gap-1.5">
                    <Package size={10} /> Modpack incluido
                  </p>
                  <div className="flex items-center gap-3">
                    {selectedModpack.image ? (
                      <img
                        src={selectedModpack.image}
                        alt={selectedModpack.name}
                        className="w-14 h-14 rounded-lg object-cover bg-[#0A0A0A] border border-white/10 shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center shrink-0">
                        <Package size={20} className="text-[#22C55E]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black text-sm uppercase tracking-tight truncate">{selectedModpack.name}</p>
                      {selectedModpack.downloads > 0 && (
                        <p className="text-[#22C55E] text-[10px] font-bold mt-0.5">
                          {(selectedModpack.downloads / 1e6).toFixed(1)}M descargas
                        </p>
                      )}
                      <p className="text-[#8B8B8B] text-[10px] mt-0.5">Auto-instalación tras pagar</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected config — campos faltantes en amarillo, click lleva al campo */}
              <div className="px-5 py-4 border-b border-white/5 bg-[#0A0A0A]/40">
                <p className="text-[10px] uppercase font-black text-[#6B6B6B] tracking-wider mb-3">Tu configuración</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B8B8B]">Nombre</span>
                    {cleanName ? (
                      <span className="text-white font-bold truncate max-w-[180px]" title={cleanName}>{cleanName}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.querySelector('input[placeholder=\"Mi server épico\"]')?.scrollIntoView({behavior:'smooth', block:'center'}) || document.querySelector('input[placeholder=\"Mi server épico\"]')?.focus()}
                        className="text-[#EAB308] font-bold flex items-center gap-1 hover:text-[#fbbf24] transition-colors"
                      >
                        <AlertTriangle size={11} /> Pon un nombre
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B8B8B]">Software</span>
                    <span className="text-white font-bold uppercase">{software}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B8B8B]">Versión</span>
                    {version ? (
                      <span className="text-white font-bold font-mono">{version}</span>
                    ) : (
                      <span className="text-[#EAB308] font-bold flex items-center gap-1">
                        <AlertTriangle size={11} /> Cargando…
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B8B8B]">Ubicación</span>
                    <span className="text-white font-bold">🇪🇺 Europa</span>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="px-5 py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#B3B3B3]">Subtotal</span>
                  <span className="text-white font-bold">{fmtEur(subtotal)}€</span>
                </div>
                {savingPct > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#22C55E] flex items-center gap-1">
                      <Tag size={11} /> Descuento beta {savingPct}%
                    </span>
                    <span className="text-[#22C55E] font-bold">incluido</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#22C55E]">Cupón</span>
                    <span className="text-[#22C55E] font-bold">-{fmtEur(discount)}€</span>
                  </div>
                )}
              </div>

              {/* Total today */}
              <div className="px-5 py-4 border-t border-white/5 bg-[#0A0A0A]">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.2em]">Total hoy</span>
                  <span className="text-white font-black text-3xl tracking-tight">{fmtEur(totalToday)}€</span>
                </div>
                <p className="text-[10px] text-[#6B6B6B] uppercase tracking-wider">
                  Renovación: {renewal}
                </p>
              </div>

              {/* CTA (desktop) — T&C inline justo encima del botón */}
              <div className="px-5 py-5 hidden lg:block">
                {/* Checklist de qué falta para activar el CTA */}
                {(!nameValid || !version || !termsAccepted) && (
                  <div className="mb-3 p-3 rounded-xl border-2 border-[#EAB308]/30 bg-[#EAB308]/[0.05]">
                    <p className="text-[10px] uppercase font-black text-[#EAB308] tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={11} /> Para continuar te falta:
                    </p>
                    <ul className="space-y-1 text-xs">
                      {!nameValid && (
                        <li className="flex items-center gap-2 text-[#FCD34D]">
                          <span className="w-1 h-1 rounded-full bg-[#EAB308]" />
                          {cleanName.length === 0 ? 'Poner un nombre al servidor' : 'Nombre debe tener 3-40 caracteres'}
                        </li>
                      )}
                      {!version && (
                        <li className="flex items-center gap-2 text-[#FCD34D]">
                          <span className="w-1 h-1 rounded-full bg-[#EAB308]" />
                          Elegir versión de Minecraft
                        </li>
                      )}
                      {!termsAccepted && (
                        <li className="flex items-center gap-2 text-[#FCD34D]">
                          <span className="w-1 h-1 rounded-full bg-[#EAB308]" />
                          Aceptar los términos abajo
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* T&C compacto sobre el CTA */}
                <label
                  htmlFor="terms-checkbox"
                  className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all mb-3 ${
                    termsAccepted
                      ? 'border-[#22C55E]/40 bg-[#22C55E]/[0.06]'
                      : 'border-[#1F1F1F] bg-[#0A0A0A] hover:border-[#2A2A2A]'
                  }`}
                >
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    termsAccepted ? 'border-[#22C55E] bg-[#22C55E]' : 'border-[#3A3A3A] bg-[#0F0F0F]'
                  }`}>
                    {termsAccepted && <Check size={13} strokeWidth={3} className="text-[#0A0A0A]" />}
                  </div>
                  <p className="text-[11px] text-[#B3B3B3] leading-snug">
                    Acepto los{' '}
                    <a href="/#terms" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[#22C55E] underline hover:text-[#1eb754]">Términos</a>{' '}y la{' '}
                    <a href="/#privacy" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[#22C55E] underline hover:text-[#1eb754]">Privacidad</a>.{' '}
                    Tengo al menos 16 años.
                  </p>
                </label>

                <button
                  onClick={handleCheckout}
                  disabled={!canCheckout}
                  className={`w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all ${
                    canCheckout
                      ? 'bg-[#22C55E] text-[#0A0A0A] hover:bg-[#1eb754] shadow-[0_8px_24px_rgba(34,197,94,0.35)] hover:shadow-[0_12px_32px_rgba(34,197,94,0.5)]'
                      : 'bg-white/5 text-[#4B4B4B] cursor-not-allowed'
                  }`}
                >
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> Procesando…</> : <>Continuar al pago <ArrowRight size={14} strokeWidth={3} /></>}
                </button>

                {!user && (
                  <p className="text-[10px] text-[#6B6B6B] text-center mt-3 uppercase tracking-wider">
                    Te pediremos iniciar sesión con Google
                  </p>
                )}

              </div>

              {/* Existing client login */}
              {!user && (
                <div className="px-5 py-3 border-t border-white/5 text-center text-xs text-[#8B8B8B]">
                  ¿Ya eres cliente?{' '}
                  <button
                    onClick={() => {
                      supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: window.location.origin + '/panel',
                          queryParams: { prompt: 'select_account' },
                        }
                      });
                    }}
                    className="text-[#22C55E] font-bold hover:underline"
                  >
                    Iniciar sesión
                  </button>
                </div>
              )}
            </div>

            {/* Trust strip */}
            <div className="mt-4 flex items-center justify-center gap-3 text-[10px] uppercase tracking-wider text-[#6B6B6B]">
              <span className="flex items-center gap-1">🔒 Pago seguro Stripe</span>
              <span className="w-1 h-1 rounded-full bg-[#2A2A2A]" />
              <span>Cancela cuando quieras</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default OrderConfigPage;
