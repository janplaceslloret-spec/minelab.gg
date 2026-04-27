import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Check, ChevronRight, ArrowRight, Loader2, ServerCog, Globe,
  Tag, AlertTriangle, ChevronLeft, Box, Sparkles, Search, Wand2
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const VERSIONS_API = 'https://api.fluxoai.co/api/versions';
const DRAFT_KEY = 'minelab-order-draft';

/* ═══ CATALOG ═══ */
const PLANS = {
  '4gb': {
    id: '4gb',
    ram: 4,
    name: 'Pro 4 GB',
    monthly: 5,
    annual: 60,
    monthlyEq: 5,
    originalMonthly: 8,
    stripeMonthly: 'https://buy.stripe.com/8x228s2LKcZN3lK3As3AY01',
    stripeAnnual:  'https://buy.stripe.com/fZu28s8641h54pOdb23AY0a',
  },
  '6gb': {
    id: '6gb',
    ram: 6,
    name: 'Pro 6 GB',
    monthly: 7,
    annual: 84,
    monthlyEq: 7,
    originalMonthly: 10,
    popular: true,
    stripeMonthly: 'https://buy.stripe.com/4gM5kE1HG6Bpg8w7QI3AY02',
    stripeAnnual:  'https://buy.stripe.com/4gMaEY4TS0d1e0ogne3AY0b',
  },
  '8gb': {
    id: '8gb',
    ram: 8,
    name: 'Pro 8 GB',
    monthly: 10,
    annual: 120,
    monthlyEq: 10,
    originalMonthly: 13,
    stripeMonthly: 'https://buy.stripe.com/14AdRa2LK2l99K8gne3AY03',
    stripeAnnual:  'https://buy.stripe.com/eVq7sM9a8aRF4pOc6Y3AY0c',
  },
  '12gb': {
    id: '12gb',
    ram: 12,
    name: 'Pro 12 GB',
    monthly: 15,
    annual: 180,
    monthlyEq: 15,
    originalMonthly: 18,
    stripeMonthly: 'https://buy.stripe.com/bJe7sM1HGe3R3lK2wo3AY05',
    stripeAnnual:  'https://buy.stripe.com/8x28wQ864f7V3lKfja3AY0d',
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
    tagline: 'Survival multijugador con plugins',
    description: 'EssentialsX, LuckPerms y Vault listos. Ideal para comunidades.',
    software: 'paper',
    version: '1.21.4',
    suggestedName: 'SMP Survival',
    extras: ['EssentialsX', 'LuckPerms', 'Vault', 'WorldGuard'],
    extrasLabel: 'Plugins recomendados',
    badge: 'Más popular',
    accent: 'green',
    icon: '🌍',
  },
  {
    id: 'cobblemon',
    name: 'Cobblemon',
    tagline: 'Pokémon en Minecraft',
    description: 'Atrapa, entrena y combate. 1025 Pokémon listos.',
    software: 'fabric',
    version: '1.21.1',
    suggestedName: 'Pokémon Server',
    extras: ['Cobblemon', 'Sodium', 'Fabric API'],
    extrasLabel: 'Mods incluidos',
    badge: 'Trending',
    accent: 'pink',
    icon: '⚡',
  },
  {
    id: 'atm9',
    name: 'All The Mods 9',
    tagline: 'Modpack hardcore · 400+ mods',
    description: 'Tech, magia, exploración, automatización. Para sesiones largas.',
    software: 'forge',
    version: '1.20.1',
    suggestedName: 'ATM9 Server',
    extras: ['ATM9 modpack (auto-install)'],
    extrasLabel: 'Modpack',
    badge: 'Para expertos',
    accent: 'orange',
    icon: '⚙️',
  },
  {
    id: 'better-mc',
    name: 'Better MC',
    tagline: 'Vanilla mejorado · QoL + shaders',
    description: 'Optimizaciones, biomas mejorados, sin perder la esencia.',
    software: 'fabric',
    version: '1.21.1',
    suggestedName: 'Better MC',
    extras: ['Better MC modpack', 'Sodium', 'Iris Shaders'],
    extrasLabel: 'Modpack + mejoras',
    badge: 'Nuevo',
    accent: 'blue',
    icon: '✨',
  },
  {
    id: 'vanilla',
    name: 'Vanilla',
    tagline: 'Minecraft puro · sin mods',
    description: 'La experiencia oficial de Mojang. Para puristas.',
    software: 'vanilla',
    version: '1.21.4',
    suggestedName: 'Vanilla Server',
    extras: [],
    badge: 'Limpio',
    accent: 'gray',
    icon: '🟩',
  },
  {
    id: 'custom',
    name: 'Personalizado',
    tagline: 'Configura tú · desde cero',
    description: 'Elige software, versión y todo lo demás. Para los que ya saben.',
    custom: true,
    badge: null,
    accent: 'gray',
    icon: '🛠️',
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
  { id: 'paper',    label: 'Paper',    emoji: '📄', tag: 'Recomendado',     desc: 'Plugins Bukkit/Spigot. Lo más estable.' },
  { id: 'fabric',   label: 'Fabric',   emoji: '🧵', tag: 'Mods modernos',   desc: 'Loader ligero. Cobblemon, Sodium…' },
  { id: 'forge',    label: 'Forge',    emoji: '⚙️', tag: 'Modpacks',        desc: 'Estándar para mods complejos.' },
  { id: 'neoforge', label: 'NeoForge', emoji: '🔥', tag: 'Forge moderno',   desc: 'Fork moderno y mejor mantenido.' },
  { id: 'vanilla',  label: 'Vanilla',  emoji: '🟩', tag: 'Oficial Mojang',  desc: 'Sin modificaciones.' },
];

const FEATURES = (ram) => [
  `${ram} GB RAM dedicada`,
  'Procesador AMD EPYC',
  'NVMe SSD local',
  'Datacenter Núremberg 🇩🇪',
  'DDoS Protection incluida',
  'Backups automáticos',
  'Subdominio .minelab.gg',
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
    }));
  }, [planId, billing, templateId, serverName, software, version, coupon]);

  /* Apply template selection — autopopula software, version, nombre sugerido */
  const applyTemplate = (tpl) => {
    setTemplateId(tpl.id);
    if (tpl.custom) return; // No tocar campos
    setSoftware(tpl.software);
    setVersion(tpl.version);
    if (!serverName.trim()) setServerName(tpl.suggestedName);
  };

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
  const subtotal = isAnnual ? plan.annual : plan.monthly;
  const discount = 0; // Coupons not active yet
  const totalToday = subtotal - discount;
  const renewal = isAnnual ? `${plan.annual}€/año` : `${plan.monthly}€/mes`;
  const savingPct = isAnnual
    ? Math.round((1 - (plan.monthlyEq * 12) / (plan.originalMonthly * 12)) * 100)
    : Math.round((1 - plan.monthly / plan.originalMonthly) * 100);

  /* Validation */
  const cleanName = serverName.trim();
  const nameValid = cleanName.length >= 3 && cleanName.length <= 40;
  const canCheckout = nameValid && version && plan && !submitting;

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
          options: { redirectTo: window.location.origin + '/configurar?continue=1' }
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
      const draftPayload = templateId && !selectedTemplate?.custom
        ? { ...baseDraft, template: templateId }
        : baseDraft;

      let { data: draft, error: insErr } = await supabase
        .from('mc_servers')
        .insert(draftPayload)
        .select('id')
        .single();

      // Fallback si la columna template aún no existe en producción
      if (insErr && /column.*template.*does not exist|template/i.test(insErr.message || '')) {
        console.warn('[OrderConfig] template column missing, retry without it');
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
                <Sparkles size={11} /> Configura tu servidor
              </p>
              <h1 className="text-white font-black text-3xl md:text-5xl uppercase tracking-tight leading-[0.95]">
                CASI <span className="text-[#22C55E]">LISTO</span>
              </h1>
              <p className="text-[#8B8B8B] text-sm mt-3 max-w-lg">
                Personaliza tu servidor antes de pagar. Todo se aplica al instante tras la compra.
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
                        Desde {p.monthlyEq}€/mes
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
                  <p className="text-[#8B8B8B] text-xs">{plan.monthly}€/mes · cancela cuando quieras</p>
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
                  <p className="text-[#8B8B8B] text-xs">{plan.annual}€/año · {plan.monthlyEq}€/mes equivalentes</p>
                </button>
              </div>
            </Section>

            {/* Template picker — opcional, autopopula software/version/nombre */}
            <Section number="02" title="¿Quieres un servidor pre-configurado?">
              <p className="text-[#8B8B8B] text-sm mb-4 -mt-2">
                Elige un template y nosotros nos ocupamos. O personaliza tú abajo.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TEMPLATES.map((tpl) => {
                  const sel = templateId === tpl.id;
                  const acc = TEMPLATE_ACCENT[tpl.accent] || TEMPLATE_ACCENT.gray;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => applyTemplate(tpl)}
                      className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
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
                        <span className="text-3xl leading-none">{tpl.icon}</span>
                        {sel && <Check size={14} className={acc.text} strokeWidth={3} />}
                      </div>
                      <p className={`font-black text-sm uppercase tracking-tight mb-0.5 ${sel ? acc.text : 'text-white'}`}>
                        {tpl.name}
                      </p>
                      <p className="text-[10px] text-[#22C55E]/70 uppercase font-bold tracking-wider mb-2">
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

            {/* Server name */}
            <Section number="03" title="Nombre del servidor">
              <input
                type="text"
                value={serverName}
                onChange={e => setServerName(e.target.value.slice(0, 40))}
                placeholder="Mi server épico"
                maxLength={40}
                className="w-full bg-[#0F0F0F] border-2 border-[#1F1F1F] rounded-xl px-4 py-3.5 text-white placeholder-[#4B4B4B] focus:outline-none focus:border-[#22C55E]/40 transition-colors"
              />
              <p className="text-xs text-[#6B6B6B] mt-2">
                {cleanName.length === 0 ? 'Cómo se llamará en el panel.' : nameValid ? `${cleanName.length}/40 · OK` : 'Mínimo 3 caracteres.'}
              </p>
            </Section>

            {/* Software */}
            <Section number="04" title="Software inicial">
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
                        <span className="text-2xl">{s.emoji}</span>
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

            {/* Version dropdown */}
            <Section number="05" title="Versión inicial">
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

            {/* Location (info card, single location) */}
            <Section number="06" title="Ubicación">
              <div className="bg-[#0F0F0F] border-2 border-[#1F1F1F] rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center shrink-0">
                  <Globe size={20} className="text-[#22C55E]" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm uppercase tracking-tight">Europa · Núremberg 🇩🇪</p>
                  <p className="text-[#8B8B8B] text-xs mt-0.5">~12 ms desde España · Hetzner CX53 · 1 Gbps</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] uppercase font-black tracking-wider text-[#22C55E]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  Online
                </div>
              </div>
            </Section>

            {/* Coupon (placeholder) */}
            <Section number="07" title="¿Tienes un cupón?">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  placeholder="Próximamente…"
                  disabled
                  className="flex-1 bg-[#0F0F0F] border-2 border-[#1F1F1F] rounded-xl px-4 py-3 text-white placeholder-[#4B4B4B] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  disabled
                  className="px-5 py-3 rounded-xl border-2 border-[#1F1F1F] text-[#6B6B6B] text-xs font-black uppercase tracking-[0.15em] disabled:cursor-not-allowed"
                >
                  Canjear
                </button>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-2 flex items-center gap-1.5">
                <Tag size={11} /> Estamos preparando códigos de lanzamiento.
              </p>
            </Section>

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
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Procesando…</> : <>Continuar al pago · {totalToday}€ <ArrowRight size={14} strokeWidth={3} /></>}
            </button>
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
                  <p className="text-white font-black text-lg">{subtotal}€</p>
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

              {/* Selected config */}
              <div className="px-5 py-4 border-b border-white/5 bg-[#0A0A0A]/40">
                <p className="text-[10px] uppercase font-black text-[#6B6B6B] tracking-wider mb-3">Tu configuración</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8B8B8B]">Nombre</span>
                    <span className={`font-bold ${cleanName ? 'text-white' : 'text-[#4B4B4B] italic'}`}>
                      {cleanName || 'Sin definir'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B8B8B]">Software</span>
                    <span className="text-white font-bold uppercase">{software}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B8B8B]">Versión</span>
                    <span className="text-white font-bold font-mono">{version || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B8B8B]">Ubicación</span>
                    <span className="text-white font-bold">🇩🇪 Núremberg</span>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="px-5 py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#B3B3B3]">Subtotal</span>
                  <span className="text-white font-bold">{subtotal}€</span>
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
                    <span className="text-[#22C55E] font-bold">-{discount}€</span>
                  </div>
                )}
              </div>

              {/* Total today */}
              <div className="px-5 py-4 border-t border-white/5 bg-[#0A0A0A]">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.2em]">Total hoy</span>
                  <span className="text-white font-black text-3xl tracking-tight">{totalToday}€</span>
                </div>
                <p className="text-[10px] text-[#6B6B6B] uppercase tracking-wider">
                  Renovación: {renewal}
                </p>
              </div>

              {/* CTA (desktop) */}
              <div className="px-5 py-5 hidden lg:block">
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

                {!nameValid && cleanName.length > 0 && (
                  <p className="text-[10px] text-[#EAB308] text-center mt-3 flex items-center justify-center gap-1">
                    <AlertTriangle size={10} /> Nombre debe tener 3-40 caracteres
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
                        options: { redirectTo: window.location.origin + '/panel' }
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
