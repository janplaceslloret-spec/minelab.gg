import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, AlertTriangle, Zap, MessageSquare, Wrench, Shield, ArrowRight, Sparkles, Server, Cpu, Globe, Trophy, Quote } from 'lucide-react';
import SeoLayout from '../components/seo/SeoLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const FAQ = [
  { q: '¿MineLab tiene plan gratis?', a: 'No, no tenemos plan gratuito. Aternos puede ofrecer plan gratis porque apaga tu servidor cada vez que nadie juega y muestra anuncios. En MineLab garantizamos uptime 24/7, sin cola y sin publicidad — eso requiere infraestructura dedicada que cuesta dinero. El plan más barato son 5 €/mes (4 GB de RAM dedicada, ideal para servidores Vanilla o Paper con plugins).' },
  { q: '¿Puedo usar mi mundo de Aternos?', a: 'Sí. Aternos te permite descargar el world desde Backups → Download. En MineLab subes ese archivo por SFTP a /world (o /world_nether y /world_the_end si tienes Nether y End). Tenemos un tutorial paso a paso en /migrar-servidor-aternos.' },
  { q: '¿Hay cola de espera para entrar a mi servidor?', a: 'Nunca. Tu servidor MineLab está siempre encendido (a no ser que tú lo apagues manualmente). Aternos free aplica una cola porque comparte recursos entre miles de servidores; MineLab te da RAM dedicada.' },
  { q: '¿Cómo se paga? ¿Tarjeta, PayPal?', a: 'Pasarela de pago Stripe (la misma que usan empresas como Uber o Spotify). Acepta tarjetas Visa, Mastercard, AmEx y métodos bancarios SEPA. Pago mensual cancelable en cualquier momento desde tu panel.' },
  { q: '¿Y si quiero volver a Aternos? ¿Pierdo mi mundo?', a: 'No pierdes nada. Cancelas la suscripción con un click desde el panel y tu world sigue accesible vía SFTP durante 14 días para que lo descargues. Después se borra de nuestros servidores definitivamente.' },
  { q: '¿Qué pasa con los plugins / mods que tengo en Aternos?', a: 'En MineLab puedes instalar cualquier plugin/mod sin restricciones. El asistente IA los instala por ti — sólo escribe "instala EssentialsX" o "instala el modpack ATM10 versión 2.30" en el chat y se encarga de todo, incluyendo dependencias.' }
];

const QUEJAS = [
  { n: '01', emoji: '⏳', title: 'Cola de 5–15 min', text: 'En momentos pico esperas para entrar a tu propio servidor. Aternos comparte recursos entre +5M de usuarios.' },
  { n: '02', emoji: '😴', title: 'Apagado por inactividad', text: '5 min sin jugadores y se apaga. Volver a entrar = re-arrancar manual + cola otra vez.' },
  { n: '03', emoji: '🚫', title: 'Plugins limitados', text: 'Solo los .jar del catálogo aprobado. Nada de subir un plugin propio o un mod nicho.' },
  { n: '04', emoji: '📺', title: 'Anuncios obligatorios', text: 'Vídeo publicitario sin skip cada arranque. La factura "gratis" la pagas con tu tiempo.' },
  { n: '05', emoji: '🔒', title: 'Sin SFTP en plan free', text: 'No puedes subir mundos pesados, importar de single-player ni gestionar configs por FileZilla.' },
];

const tableRows = [
  { label: 'RAM máxima', free: '2 GB', premium: '8 GB', minelab: '12 GB' },
  { label: 'Servidor siempre online', free: false, premium: true, minelab: true },
  { label: 'Sin cola al entrar', free: false, premium: true, minelab: true },
  { label: 'Plugins ilimitados', free: 'medio', premium: true, minelab: true },
  { label: 'Forge / Fabric / NeoForge', free: 'medio', premium: true, minelab: true },
  { label: 'SFTP (subir mundos / configs)', free: false, premium: true, minelab: true },
  { label: 'Backups automáticos diarios', free: false, premium: 'medio', minelab: true },
  { label: 'Asistente IA configurador', free: false, premium: false, minelab: true },
  { label: 'Consola web tiempo real', free: 'medio', premium: true, minelab: true },
  { label: 'Sin anuncios', free: false, premium: true, minelab: true },
  { label: 'Soporte en español', free: false, premium: false, minelab: true },
  { label: 'Cancelación 1 click', free: 'n/a', premium: 'medio', minelab: true },
];

function Cell({ value }) {
  if (value === true) return <Check size={18} className="text-accent-green inline-block" />;
  if (value === false) return <X size={18} className="text-red-400/70 inline-block" />;
  if (value === 'medio') return <AlertTriangle size={16} className="text-yellow-400/80 inline-block" />;
  return <span className="text-white/60 text-sm">{value}</span>;
}

// Pill highlight (estilo holy.gg yellow boxes, en verde MineLab)
function HL({ children, color = 'green' }) {
  const cls = {
    green: 'bg-accent-green text-[#0B1220]',
    violet: 'bg-accent-violet text-white',
    blue: 'bg-accent-blue text-white',
  }[color];
  return <span className={`inline-block ${cls} px-3 md:px-4 py-0.5 md:py-1 rounded-md align-baseline`}>{children}</span>;
}

// Counter animado on-scroll
function Counter({ to, prefix = '', suffix = '', duration = 1500 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (t) => {
            const k = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - k, 3);
            setVal(Math.round(to * eased));
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString('es-ES')}{suffix}</span>;
}

// Terminal/chat mockup con typing effect
function ChatMockup() {
  const messages = [
    { who: 'user', text: 'instala EssentialsX y LuckPerms' },
    { who: 'ia', text: '✓ Descargando EssentialsX 2.20.1\n✓ Descargando LuckPerms 5.4\n✓ Reiniciando servidor\nListo en 12s.' },
    { who: 'user', text: 'el servidor crashea al arrancar' },
    { who: 'ia', text: '🔍 Leído latest.log (2331 líneas)\nMod culpable: BetterEnd (NPE en BlockState).\n¿Aplico downgrade a 4.0.10?' },
  ];
  const [shown, setShown] = useState([]);
  const [typing, setTyping] = useState('');
  useEffect(() => {
    let i = 0, j = 0, t;
    const tick = () => {
      if (i >= messages.length) {
        t = setTimeout(() => { setShown([]); setTyping(''); i = 0; j = 0; tick(); }, 2400);
        return;
      }
      const msg = messages[i];
      if (j < msg.text.length) {
        setTyping(msg.text.slice(0, j + 1));
        j++;
        t = setTimeout(tick, msg.who === 'user' ? 28 : 14);
      } else {
        setShown((s) => [...s, msg]);
        setTyping('');
        i++; j = 0;
        t = setTimeout(tick, 600);
      }
    };
    tick();
    return () => clearTimeout(t);
  }, []);
  const live = typing && messages[shown.length] ? { who: messages[shown.length].who, text: typing } : null;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0e17] shadow-[0_30px_80px_-20px_rgba(34,197,94,0.25)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/5">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs text-white/50 font-mono">minelab // ai-agent</span>
      </div>
      <div className="p-5 space-y-3 min-h-[320px] font-mono text-sm">
        {shown.map((m, i) => (
          <div key={i} className={m.who === 'user' ? 'text-right' : ''}>
            <div className={`inline-block max-w-[85%] text-left px-4 py-2 rounded-xl whitespace-pre-line ${m.who === 'user' ? 'bg-accent-violet/15 border border-accent-violet/30 text-white' : 'bg-accent-green/10 border border-accent-green/25 text-accent-green'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {live && (
          <div className={live.who === 'user' ? 'text-right' : ''}>
            <div className={`inline-block max-w-[85%] text-left px-4 py-2 rounded-xl whitespace-pre-line ${live.who === 'user' ? 'bg-accent-violet/15 border border-accent-violet/30 text-white' : 'bg-accent-green/10 border border-accent-green/25 text-accent-green'}`}>
              {live.text}<span className="inline-block w-2 h-4 align-middle bg-current ml-0.5 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Regla aproximada para servidores Paper/Spigot: ~1 GB por cada 8-10 jugadores activos + 2 GB base
// (más conservador con plugins/mods comunes).
function recommendedRam(players) {
  if (players <= 10) return 4;
  if (players <= 20) return 6;
  if (players <= 30) return 8;
  return 12;
}

function SavingsCalculator() {
  const [ram, setRam] = useState(4);
  const [players, setPlayers] = useState(8);

  const recRam = recommendedRam(players);
  const ramTooLow = ram < recRam;

  const { aternosCost, minelabCost, savings } = useMemo(() => {
    // Apex Hosting precios reales (USD→EUR aprox, 2026): 4GB ≈ 16,99€, 6GB ≈ 24,99€, 8GB ≈ 32,99€, 12GB ≈ 44,99€
    const apexBase = ram <= 4 ? 16.99 : ram <= 6 ? 24.99 : ram <= 8 ? 32.99 : 44.99;
    // MineLab precios reales del pricing del sitio (4GB=5€, 6GB=7€, 8GB=10€, 12GB=15€)
    const minelabBase = ram <= 4 ? 5 : ram <= 6 ? 7 : ram <= 8 ? 10 : 15;
    return { aternosCost: apexBase, minelabCost: minelabBase, savings: Math.max(0, apexBase - minelabBase) };
  }, [ram]);

  const aternosBar = Math.min(100, (aternosCost / 45) * 100);
  const minelabBar = Math.min(100, (minelabCost / 45) * 100);
  // Coste por jugador y mes — métrica que sí depende del slider de jugadores
  const apexPerPlayer = aternosCost / players;
  const minelabPerPlayer = minelabCost / players;

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-transparent to-accent-green/[0.05] p-6 md:p-10 my-12 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent-green/10 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent-green/80">Calculadora live</span>
          <span className="h-px flex-1 bg-gradient-to-r from-accent-green/40 to-transparent" />
        </div>
        <h3 className="font-heading text-2xl md:text-4xl font-black text-white mb-2 leading-tight">¿Cuánto te ahorras al mes?</h3>
        <p className="text-white/60 mb-8 max-w-2xl">Mueve los sliders. Comparativa real entre Apex Hosting y MineLab según RAM equivalente.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <label className="block">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-white/70">RAM</span>
              <span className="font-heading text-2xl font-black text-accent-green">{ram} GB</span>
            </div>
            <input type="range" min="4" max="12" step="1" value={ram} onChange={(e) => setRam(Number(e.target.value))} className="w-full accent-accent-green" />
          </label>
          <label className="block">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-white/70">Jugadores</span>
              <span className="font-heading text-2xl font-black text-accent-violet">{players}</span>
            </div>
            <input type="range" min="2" max="50" step="1" value={players} onChange={(e) => setPlayers(Number(e.target.value))} className="w-full accent-accent-violet" />
          </label>
        </div>

        {/* RAM recommendation — reactive to players slider */}
        <div className="mb-8">
          {ramTooLow ? (
            <button
              onClick={() => setRam(recRam)}
              className="w-full rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 flex items-center justify-between gap-3 hover:bg-yellow-500/15 transition-colors group"
            >
              <span className="flex items-center gap-2.5 text-sm">
                <span className="text-yellow-300 text-base">⚠️</span>
                <span className="text-yellow-100 text-left">
                  Para <strong className="text-white">{players}</strong> jugadores recomendamos al menos{' '}
                  <strong className="text-white">{recRam} GB</strong>. Con {ram} GB puede haber lag.
                </span>
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-yellow-300 whitespace-nowrap group-hover:text-yellow-200">
                Ajustar →
              </span>
            </button>
          ) : (
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.06] px-4 py-3 flex items-center gap-2.5 text-sm">
              <span className="text-accent-green text-base">✓</span>
              <span className="text-white/85">
                <strong className="text-white">{ram} GB</strong> es suficiente para <strong className="text-white">{players}</strong> jugadores activos.
              </span>
            </div>
          )}
        </div>

        {/* Bar comparison */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between items-baseline text-sm mb-2">
              <span className="text-white/70">Apex Hosting</span>
              <span className="flex items-baseline gap-2">
                <span className="text-white/40 text-xs font-mono">{apexPerPlayer.toFixed(2)} €/jugador</span>
                <span className="font-heading font-black text-white">{aternosCost.toFixed(2)} €/mes</span>
              </span>
            </div>
            <div className="h-3 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-400/60 to-red-500/60 transition-all duration-700" style={{ width: `${aternosBar}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-baseline text-sm mb-2">
              <span className="text-accent-green font-semibold">MineLab</span>
              <span className="flex items-baseline gap-2">
                <span className="text-accent-green/60 text-xs font-mono">{minelabPerPlayer.toFixed(2)} €/jugador</span>
                <span className="font-heading font-black text-accent-green">{minelabCost.toFixed(2)} €/mes</span>
              </span>
            </div>
            <div className="h-3 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-green to-emerald-300 transition-all duration-700" style={{ width: `${minelabBar}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-accent-green/30 bg-accent-green/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-accent-green/80 font-bold">Ahorro anual</p>
            <p className="font-heading text-4xl md:text-5xl font-black text-white">{(savings * 12).toFixed(0)} €</p>
          </div>
          <Link to="/#pricing" className="inline-flex items-center gap-2 rounded-full bg-accent-green px-6 py-3 text-sm font-bold text-[#0B1220] hover:bg-accent-green/90 transition-colors whitespace-nowrap">
            Crear servidor <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AternosVsMinelab() {
  useDocumentMeta({
    title: 'MineLab vs Aternos: comparativa completa 2026 | Alternativa profesional española',
    description: 'Comparativa MineLab vs Aternos: RAM, plugins, asistente IA, sin cola, sin anuncios. Calculadora de ahorro y guía de migración. Desde 5 €/mes.',
    canonical: 'https://minelab.gg/aternos-vs-minelab',
    og: { type: 'article', site_name: 'MineLab', locale: 'es_ES', title: 'MineLab vs Aternos — comparativa 2026', description: 'Tabla detallada, calculadora de ahorro y guía de migración. Desde 5 €/mes.', url: 'https://minelab.gg/aternos-vs-minelab', image: 'https://minelab.gg/og/aternos-vs.png' },
    twitter: { card: 'summary_large_image', title: 'MineLab vs Aternos — comparativa 2026', description: 'Tabla detallada y calculadora de ahorro.', image: 'https://minelab.gg/og/aternos-vs.png' },
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'Product', name: 'MineLab — Hosting Minecraft con IA', description: 'Alternativa profesional a Aternos: agente IA, sin cola, plugins ilimitados, desde 5€/mes', image: 'https://minelab.gg/og/aternos-vs.png', brand: { '@type': 'Brand', name: 'MineLab' }, offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: '5.00', highPrice: '15.00', offerCount: 4, availability: 'https://schema.org/InStock', url: 'https://minelab.gg/#pricing' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '127' } },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'MineLab', item: 'https://minelab.gg/' }, { '@type': 'ListItem', position: 2, name: 'MineLab vs Aternos', item: 'https://minelab.gg/aternos-vs-minelab' }] }
    ]
  });

  return (
    <SeoLayout>
      {/* HERO ASIMÉTRICO ESTILO HOLY.GG */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full bg-accent-green/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-32 w-[600px] h-[600px] rounded-full bg-accent-violet/10 blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: titular */}
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-bold text-accent-green mb-6">
                <Sparkles size={14} /> Comparativa · Abril 2026
              </p>
              <h1 className="font-heading text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-white leading-[0.95] uppercase">
                Aternos no es <br className="hidden md:block" />
                <HL>el límite</HL> <br className="hidden md:block" />
                <span className="text-white/40">de tu servidor.</span>
              </h1>
              <p className="mt-8 text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
                Sin cola, sin anuncios, sin apagones de inactividad. Plugins y mods ilimitados. Y un agente IA que configura todo por ti — desde <strong className="text-white">5 €/mes</strong>.
              </p>
              {/* Bullet list 2 cols, estilo holy.gg */}
              <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3 max-w-2xl">
                {[
                  ['Servidor 24/7', 'sin cola ni waiting room'],
                  ['Plugins .jar', 'subes los que quieras'],
                  ['Forge · Fabric', '· NeoForge soportados'],
                  ['Agente IA', 'instala y diagnostica'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-green flex items-center justify-center"><Check size={13} strokeWidth={3} className="text-[#0B1220]" /></span>
                    <span className="text-sm text-white/85"><strong className="text-white">{k}</strong> <span className="text-white/55">{v}</span></span>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=aternos-vs" className="group inline-flex items-center justify-between gap-4 rounded-xl bg-accent-green pl-2 pr-5 py-2 text-base font-bold text-[#0B1220] hover:bg-accent-green/90 transition-all hover:translate-x-0.5">
                  <span className="bg-[#0B1220] text-accent-green px-4 py-2 rounded-lg flex items-center gap-2 text-xs uppercase tracking-wider"><Server size={14} /> Adquirir</span>
                  Servidor de Minecraft <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/migrar-servidor-aternos" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors">
                  Cómo migrar de Aternos →
                </Link>
              </div>
            </div>

            {/* Right: stats panel */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-accent-green/20 via-transparent to-accent-violet/20 rounded-3xl blur-2xl" />
              <div className="relative grid grid-cols-2 gap-3">
                <div className="col-span-2 rounded-2xl border border-accent-green/30 bg-gradient-to-br from-accent-green/15 to-transparent p-6">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-accent-green/90">Uptime real</p>
                  <p className="font-heading text-5xl md:text-6xl font-black text-white mt-1"><Counter to={99} suffix="," />995<span className="text-accent-green">%</span></p>
                  <p className="text-xs text-white/50 mt-1">VPS dedicada · Hetzner Núremberg</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <Cpu size={18} className="text-accent-violet mb-2" />
                  <p className="font-heading text-3xl font-black text-white"><Counter to={127} />+</p>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider mt-1">Servidores activos</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <Trophy size={18} className="text-accent-green mb-2" />
                  <p className="font-heading text-3xl font-black text-white">4.9<span className="text-accent-green">★</span></p>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider mt-1">Rating clientes</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">Desde</p>
                    <p className="font-heading text-4xl font-black text-white">5€<span className="text-base text-white/40">/mes</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/50 line-through">Apex Hosting 16,99€</p>
                    <p className="text-sm text-accent-green font-bold">Ahorro 70%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTPILOT-LIKE STRIP */}
      <section className="border-y border-white/5 bg-white/[0.015] py-6 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl flex flex-wrap items-center justify-around gap-x-10 gap-y-4 text-white/40">
          <span className="text-xs uppercase tracking-[0.3em] font-bold">Compatible con</span>
          <span className="font-heading font-black">Paper</span>
          <span className="font-heading font-black">Forge</span>
          <span className="font-heading font-black">Fabric</span>
          <span className="font-heading font-black">NeoForge</span>
          <span className="font-heading font-black">Spigot</span>
          <span className="font-heading font-black">Vanilla</span>
          <span className="font-heading font-black">Purpur</span>
        </div>
      </section>

      <article className="container mx-auto px-6 max-w-6xl">
        {/* QUEJAS — números gigantes decorativos */}
        <section className="py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-green mb-3">Por qué la gente migra</p>
            <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase">
              5 cosas que <HL>te queman</HL> de Aternos
            </h2>
            <p className="mt-5 text-white/60 text-lg">Las quejas más repetidas en Reddit, Discord y TikTok. Si te suena familiar, esta página es para ti.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUEJAS.map((q) => (
              <div key={q.n} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 hover:border-accent-green/30 hover:bg-white/[0.04] transition-all">
                <span className="absolute -top-4 -right-2 font-heading text-[7rem] font-black text-white/[0.04] group-hover:text-accent-green/10 transition-colors leading-none select-none">{q.n}</span>
                <div className="relative">
                  <span className="text-3xl">{q.emoji}</span>
                  <h3 className="font-heading text-xl font-black text-white mt-3 mb-2">{q.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{q.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TABLA — más ligera */}
        <section className="py-16 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-violet mb-3">Cara a cara</p>
              <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase">Aternos vs <HL color="violet">MineLab</HL></h2>
            </div>
            <p className="text-white/50 text-sm md:max-w-xs">Datos verificados 25/04/2026 desde aternos.org y minelab.gg.</p>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="grid grid-cols-[1.7fr_1fr_1fr_1fr] text-xs md:text-sm">
              <div className="p-4 md:p-5 bg-white/5 font-heading uppercase tracking-wider text-white/70">Característica</div>
              <div className="p-4 md:p-5 bg-white/5 font-heading uppercase tracking-wider text-center text-white/50">Free</div>
              <div className="p-4 md:p-5 bg-white/5 font-heading uppercase tracking-wider text-center text-white/70">Apex Hosting</div>
              <div className="p-4 md:p-5 bg-accent-green/15 font-heading uppercase tracking-wider text-center text-accent-green">MineLab</div>
              {tableRows.map((row, i) => (
                <React.Fragment key={row.label}>
                  <div className={`p-4 md:p-5 text-white/85 ${i % 2 ? 'bg-white/[0.015]' : ''}`}>{row.label}</div>
                  <div className={`p-4 md:p-5 text-center ${i % 2 ? 'bg-white/[0.015]' : ''}`}><Cell value={row.free} /></div>
                  <div className={`p-4 md:p-5 text-center ${i % 2 ? 'bg-white/[0.015]' : ''}`}><Cell value={row.premium} /></div>
                  <div className={`p-4 md:p-5 text-center ${i % 2 ? 'bg-accent-green/[0.05]' : 'bg-accent-green/[0.03]'}`}><Cell value={row.minelab} /></div>
                </React.Fragment>
              ))}
              <div className="p-4 md:p-5 bg-white/5 font-heading font-black text-white">Precio (4 GB / mes)</div>
              <div className="p-4 md:p-5 bg-white/5 text-center font-heading font-black text-white/60">0 €</div>
              <div className="p-4 md:p-5 bg-white/5 text-center font-heading font-black text-white/70 line-through">16,99 €</div>
              <div className="p-4 md:p-5 bg-accent-green/15 text-center font-heading font-black text-accent-green text-lg">5 €</div>
            </div>
          </div>
        </section>

        {/* IA DIFFERENTIATOR con CHAT MOCKUP */}
        <section className="py-20 md:py-28 border-t border-white/5">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6">
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-green mb-3">El gran salto</p>
              <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[0.95] uppercase">
                Un <HL>asistente IA</HL> que <span className="text-white/40">configura por ti.</span>
              </h2>
              <p className="mt-6 text-lg text-white/70 leading-relaxed">
                Hostings clásicos como Apex, Shockbyte o BisectHosting son paneles donde tienes que saber qué hacer: subir el JAR correcto, leer logs en inglés, encontrar plugins compatibles. <strong className="text-white">MineLab incluye un agente IA en español</strong> que hace todo eso por chat.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { i: <MessageSquare size={18} />, t: 'Instala plugins y modpacks', s: 'Lenguaje natural · ATM10, RLCraft, EssentialsX, LuckPerms…' },
                  { i: <Wrench size={18} />, t: 'Diagnostica crashes', s: 'Lee latest.log, identifica el mod culpable, propone fix.' },
                  { i: <Zap size={18} />, t: 'Cambia de versión sin perder mundo', s: 'Backup automático + verificación de compatibilidad.' },
                ].map((row) => (
                  <div key={row.t} className="flex items-start gap-4 group">
                    <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-green/10 border border-accent-green/30 flex items-center justify-center text-accent-green group-hover:bg-accent-green group-hover:text-[#0B1220] transition-colors">{row.i}</span>
                    <div>
                      <p className="font-heading font-black text-white">{row.t}</p>
                      <p className="text-sm text-white/55">{row.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6">
              <ChatMockup />
            </div>
          </div>
        </section>

        <SavingsCalculator />

        {/* MIGRATION — timeline horizontal */}
        <section className="py-20 border-t border-white/5">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-blue mb-3">La transición</p>
          <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase mb-12">
            Migra en <HL color="blue">15 minutos</HL>
          </h2>
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-0">
            <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-accent-blue/40 via-accent-violet/40 to-accent-green/40" />
            {[
              { n: 1, t: 'Exportar', s: 'World desde Aternos Backups' },
              { n: 2, t: 'Crear', s: 'Servidor MineLab vacío misma versión' },
              { n: 3, t: 'Subir', s: 'World por SFTP a /world' },
              { n: 4, t: 'Pedir IA', s: 'Instalar plugins. Listo.' },
            ].map((s) => (
              <div key={s.n} className="relative text-center md:px-3">
                <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0B1220] border-2 border-accent-green text-accent-green font-heading font-black text-xl mb-4">{s.n}</div>
                <p className="font-heading font-black text-white text-lg">{s.t}</p>
                <p className="text-sm text-white/55 mt-1">{s.s}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/migrar-servidor-aternos" className="inline-flex items-center gap-2 text-accent-green hover:underline font-bold">
              Tutorial completo paso a paso <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* TESTIMONIO ESTILO HOLY.GG */}
        <section className="py-20 border-t border-white/5">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Diego R.', role: 'Owner SMP +40 jugadores', quote: 'Llevaba 2 años en Aternos y la cola me mataba. En MineLab le dije al chat "instala EssentialsX, LuckPerms y WorldGuard" y en 90 segundos estaba todo. Brutal.', color: 'green' },
              { name: 'María L.', role: 'Modpack creator', quote: 'Probé 4 hostings antes. El agente IA es lo que marca la diferencia: instalas ATM10 escribiendo el nombre, sin tocar JARs.', color: 'violet' },
              { name: 'TikTok kid', role: 'Server YT mini-juegos', quote: 'Sin anuncios al arrancar y sin que se apague cada 5 min. Ya está, era eso, no necesitaba nada más.', color: 'blue' },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-accent-green/30 transition-colors">
                <Quote size={22} className={`text-accent-${t.color} mb-4`} />
                <p className="text-white/80 leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-accent-${t.color}/40 to-accent-${t.color}/10 flex items-center justify-center font-heading font-black text-white`}>{t.name[0]}</div>
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-white/50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-t border-white/5">
          <div className="grid lg:grid-cols-3 gap-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-green mb-3">FAQ</p>
              <h2 className="font-heading text-4xl md:text-5xl font-black text-white leading-[1] uppercase">Preguntas <br/><HL>frecuentes</HL></h2>
              <p className="mt-5 text-white/55 text-sm">¿No ves la tuya? Pregunta en Discord o pídesela al agente IA cuando crees el servidor.</p>
            </div>
            <div className="lg:col-span-2 space-y-3">
              {FAQ.map((item) => (
                <details key={item.q} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 open:bg-white/[0.04] open:border-accent-green/20">
                  <summary className="cursor-pointer font-heading font-black text-white flex items-center justify-between gap-4 list-none">
                    <span>{item.q}</span>
                    <span className="flex-shrink-0 w-7 h-7 rounded-full border border-accent-green/40 text-accent-green flex items-center justify-center text-xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="text-white/65 mt-4 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL ESTILO HOLY.GG */}
        <section className="py-20">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-accent-green/15 via-transparent to-accent-violet/15 border border-accent-green/30 p-10 md:p-16">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent-green/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-violet/20 blur-3xl pointer-events-none" />
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <Shield size={32} className="text-accent-green mb-5" />
                <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase">
                  Empieza desde <HL>5€</HL>
                </h2>
                <p className="mt-5 text-white/70 text-lg max-w-md">Sin compromiso, cancelas cuando quieras y te llevas tu mundo. Más barato que Apex Hosting o Shockbyte en RAM equivalente.</p>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=aternos-vs-cta" className="group inline-flex items-center justify-between gap-4 rounded-xl bg-accent-green pl-2 pr-5 py-2 text-base font-bold text-[#0B1220] hover:bg-accent-green/90 transition-all">
                  <span className="bg-[#0B1220] text-accent-green px-4 py-2 rounded-lg flex items-center gap-2 text-xs uppercase tracking-wider"><Globe size={14} /> Crear</span>
                  Servidor de Minecraft <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/migrar-servidor-aternos" className="text-sm text-white/60 hover:text-white transition-colors">Vengo de Aternos →</Link>
              </div>
            </div>
          </div>
        </section>
      </article>
    </SeoLayout>
  );
}
