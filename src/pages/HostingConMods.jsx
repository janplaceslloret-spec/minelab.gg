import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Boxes, MessageSquare, Wrench, ArrowRight, Sparkles, AlertTriangle, Cpu, Layers, Bot } from 'lucide-react';
import SeoLayout from '../components/seo/SeoLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const MODPACKS = [
  { name: 'All The Mods 10', short: 'ATM10', mods: 400, ram: '8-12 GB', loader: 'NeoForge', tag: 'kitchen-sink', accent: 'green' },
  { name: 'RLCraft', short: 'RLCraft', mods: 250, ram: '6-8 GB', loader: 'Forge', tag: 'hardcore', accent: 'violet' },
  { name: 'Stoneblock 3', short: 'Stoneblock', mods: 300, ram: '6-8 GB', loader: 'Forge', tag: 'skyblock', accent: 'blue' },
  { name: 'Vault Hunters 3rd', short: 'Vault Hunters', mods: 600, ram: '10-16 GB', loader: 'Forge', tag: 'roguelike', accent: 'green' },
  { name: 'Pixelmon Reforged', short: 'Pixelmon', mods: 50, ram: '4-6 GB', loader: 'Forge', tag: 'pokémon', accent: 'violet' },
  { name: 'Better Minecraft', short: 'BMC', mods: 250, ram: '6-8 GB', loader: 'Forge', tag: 'aventura', accent: 'blue' },
  { name: 'Create: Above & Beyond', short: 'Create A&B', mods: 180, ram: '6 GB', loader: 'Forge', tag: 'tech', accent: 'green' },
  { name: 'SkyFactory / Prominence II', short: 'SkyFactory', mods: 200, ram: '6 GB', loader: 'Forge/Fabric', tag: 'skyblock', accent: 'violet' },
];

const RAM_TABLE = [
  { type: 'Vanilla', mods: '0', ramN: 2, recRam: '2 GB', players: '5-10' },
  { type: 'Paper + plugins ligeros', mods: '10 plugins', ramN: 4, recRam: '4 GB', players: '10-30' },
  { type: 'Forge ligero', mods: '30-50', ramN: 6, recRam: '6 GB', players: '5-15' },
  { type: 'Fabric medio', mods: '60-100', ramN: 6, recRam: '6 GB', players: '5-15' },
  { type: 'RLCraft / BMC', mods: '250+', ramN: 8, recRam: '8 GB', players: '5-10' },
  { type: 'All The Mods 10', mods: '400+', ramN: 12, recRam: '12 GB', players: '4-8' },
  { type: 'Vault Hunters 3', mods: '600+', ramN: 16, recRam: '16 GB', players: '3-6' },
];

const LOADERS = [
  { name: 'Forge', tag: 'clásico', pros: ['Catálogo enorme (15+ años)', 'Casi todos los modpacks grandes', 'Soporte comunidad masivo'], cons: ['Más pesado en RAM', 'Arranque más lento', 'Menos optimizado en MC 1.21'], when: 'Mods clásicos, modpacks tipo ATM, RLCraft, Vault Hunters.' },
  { name: 'Fabric', tag: 'ligero', pros: ['Ligero y rápido', 'Mejor en MC 1.20+', 'Ideal para Lithium, Sodium'], cons: ['Menos mods grandes que Forge', 'Modpacks más nuevos / pequeños'], when: 'Servidores survival con buen rendimiento, mods Quilt-compatibles.' },
  { name: 'NeoForge', tag: 'moderno', pros: ['Fork moderno de Forge', 'Fix de problemas históricos', 'Estándar para 1.20.4+'], cons: ['Muy nuevo, algunos mods no migran', 'Documentación inferior'], when: 'Modpacks 2025+, ATM10 y siguientes.' },
];

const FAQ = [
  { q: '¿Puedo subir mi modpack custom?', a: 'Sí. Sube el .zip exportado desde CurseForge o Modrinth por SFTP a la carpeta del servidor y dile al asistente IA "instala este modpack". Detecta el manifest, descarga las dependencias y configura el JAR automáticamente.' },
  { q: '¿Soportáis CurseForge y Modrinth?', a: 'Ambos. El agente IA conoce las APIs de CurseForge y Modrinth: pídele cualquier mod por nombre o ID ("instala JEI 1.20.1", "instala Sodium última versión") y se descarga la versión correcta para tu MC + loader.' },
  { q: '¿Cómo cambio de versión de Forge sin perder el mundo?', a: 'Antes de cualquier cambio de versión MineLab crea un backup automático del world + config. Si algo falla, restaura con un click desde la pestaña Backups. Los mundos vanilla son 100% compatibles entre versiones; los con mods requieren los mismos mods en la nueva versión (el agente lo gestiona).' },
  { q: '¿Cuántos jugadores soporta un servidor con 200 mods?', a: 'Depende de la RAM y los mods concretos. Como referencia: con 8 GB de RAM y un modpack tipo ATM10 (400 mods), 4-6 jugadores estables. RLCraft (250 mods, complejo) ~5 jugadores con 8 GB. Para más jugadores conviene subir a 12 GB y precargar el mundo.' },
  { q: '¿Hay límite de mods?', a: 'No hay límite por contrato. El límite real lo pone la RAM de tu plan: cada mod cargado ocupa memoria al arrancar. Servidores con >600 mods (Vault Hunters tier) necesitan 16 GB+ para no crashear al iniciar. El agente IA detecta out-of-memory y te avisa para subir el plan.' },
  { q: '¿Qué pasa si un mod crashea el servidor?', a: 'El asistente IA lee el latest.log, identifica el mod culpable (por NullPointerException, ConcurrentModification, etc.) y propone solución: actualizar el mod, downgrade, o eliminarlo. Si no sabe arreglarlo, te enseña el stack-trace con explicación en español.' },
];

function HL({ children, color = 'violet' }) {
  const cls = { green: 'bg-accent-green text-[#0B1220]', violet: 'bg-accent-violet text-white', blue: 'bg-accent-blue text-white' }[color];
  return <span className={`inline-block ${cls} px-3 md:px-4 py-0.5 md:py-1 rounded-md align-baseline`}>{children}</span>;
}

const productJsonLd = { '@context': 'https://schema.org', '@type': 'Product', name: 'MineLab — Hosting Minecraft con mods', description: 'Hosting Minecraft modded con asistente IA: instala cualquier modpack (Forge, Fabric, NeoForge) en 2 minutos. ATM10, RLCraft, Vault Hunters, Pixelmon. Desde 5 €/mes.', image: 'https://minelab.gg/og/hosting-mods.png', brand: { '@type': 'Brand', name: 'MineLab' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '127', bestRating: '5' }, offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: '5.00', highPrice: '15.00', offerCount: 4, availability: 'https://schema.org/InStock', url: 'https://minelab.gg/hosting-minecraft-con-mods' } };
const faqJsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
const breadcrumbJsonLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://minelab.gg/' }, { '@type': 'ListItem', position: 2, name: 'Hosting Minecraft con mods', item: 'https://minelab.gg/hosting-minecraft-con-mods' }] };

export default function HostingConMods() {
  const [tab, setTab] = useState(0);
  useDocumentMeta({
    title: 'Hosting Minecraft con mods (Forge, Fabric, NeoForge) | MineLab',
    description: 'Hosting Minecraft modded con asistente IA: instala cualquier modpack en 2 minutos. ATM10, RLCraft, Vault Hunters, Pixelmon. Desde 5 €/mes.',
    canonical: 'https://minelab.gg/hosting-minecraft-con-mods',
    og: { type: 'article', title: 'Hosting Minecraft con mods — Forge, Fabric, NeoForge', description: 'Instala cualquier modpack con un mensaje al agente IA. ATM10, RLCraft, Vault Hunters, Pixelmon.', image: 'https://minelab.gg/og/hosting-mods.png', url: 'https://minelab.gg/hosting-minecraft-con-mods' },
    twitter: { card: 'summary_large_image', title: 'Hosting Minecraft con mods — MineLab', description: 'Instala cualquier modpack en 2 minutos con el asistente IA.', image: 'https://minelab.gg/og/hosting-mods.png' },
    jsonLd: [productJsonLd, faqJsonLd, breadcrumbJsonLd],
  });

  return (
    <SeoLayout>
      {/* HERO ASIMÉTRICO */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[600px] h-[600px] rounded-full bg-accent-violet/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-32 w-[600px] h-[600px] rounded-full bg-accent-green/10 blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-bold text-accent-violet mb-6">
                <Sparkles size={14} /> Forge · Fabric · NeoForge
              </p>
              <h1 className="font-heading text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-white leading-[0.95] uppercase">
                Tu modpack <br className="hidden md:block" />
                instalado en <br className="hidden md:block" />
                <HL>2 minutos.</HL>
              </h1>
              <p className="mt-8 text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
                ATM10, RLCraft, Vault Hunters, Pixelmon… escribes el nombre en el chat y el agente IA descarga, configura y arranca por ti. <strong className="text-white">Cero JARs manuales</strong>.
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3 max-w-2xl">
                {[
                  ['CurseForge', '+ Modrinth integrados'],
                  ['Modpacks custom', 'sube tu .zip por SFTP'],
                  ['Diagnóstico de crashes', 'el agente lee logs por ti'],
                  ['Sin límite de mods', 'solo lo limita la RAM'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-violet flex items-center justify-center"><Check size={13} strokeWidth={3} className="text-white" /></span>
                    <span className="text-sm text-white/85"><strong className="text-white">{k}</strong> <span className="text-white/55">{v}</span></span>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=mods-hero" className="group inline-flex items-center justify-between gap-4 rounded-xl bg-accent-green pl-2 pr-5 py-2 text-base font-bold text-[#0B1220] hover:bg-accent-green/90 transition-all hover:translate-x-0.5">
                  <span className="bg-[#0B1220] text-accent-green px-4 py-2 rounded-lg flex items-center gap-2 text-xs uppercase tracking-wider"><Boxes size={14} /> Crear</span>
                  Servidor con mods <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/aternos-vs-minelab" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors">Comparar vs Aternos →</Link>
              </div>
            </div>

            {/* RIGHT: stack visual de modpacks */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-accent-violet/20 via-transparent to-accent-green/20 rounded-3xl blur-2xl" />
              <div className="relative">
                <div className="rounded-3xl border border-white/10 bg-[#0a0e17] p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-accent-violet/90">Top modpacks</span>
                    <span className="h-px flex-1 bg-gradient-to-r from-accent-violet/40 to-transparent" />
                    <span className="text-[10px] text-white/40">live</span>
                  </div>
                  <div className="space-y-3">
                    {MODPACKS.slice(0, 5).map((mp, i) => (
                      <div key={mp.short} className="flex items-center gap-4 group">
                        <span className="font-mono text-xs text-white/30 w-5">{String(i + 1).padStart(2, '0')}</span>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-accent-${mp.accent}/40 to-accent-${mp.accent}/10 flex items-center justify-center flex-shrink-0`}>
                          <Boxes size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-black text-white truncate">{mp.short}</p>
                          <p className="text-xs text-white/50">{mp.mods} mods · {mp.loader}</p>
                        </div>
                        <span className="text-xs text-accent-green font-mono whitespace-nowrap">{mp.ram}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/50">+ 1.200 mods soportados</span>
                    <span className="text-accent-green font-bold">2 min de setup</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRIP LOADERS */}
      <section className="border-y border-white/5 bg-white/[0.015] py-6 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl flex flex-wrap items-center justify-around gap-x-10 gap-y-3 text-white/40">
          <span className="text-xs uppercase tracking-[0.3em] font-bold">Mod loaders</span>
          <span className="font-heading font-black">Forge</span>
          <span className="font-heading font-black">Fabric</span>
          <span className="font-heading font-black">NeoForge</span>
          <span className="font-heading font-black">Quilt</span>
          <span className="font-heading font-black">Paper</span>
          <span className="font-heading font-black">Purpur</span>
          <span className="font-heading font-black">Spigot</span>
        </div>
      </section>

      <article className="container mx-auto px-6 max-w-6xl">
        {/* QUÉ ES MODDED */}
        <section className="py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-violet mb-3">El stack</p>
              <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase">
                ¿Qué es <br/><HL>"modded"</HL>?
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-4 text-white/70 leading-relaxed">
              <p className="text-lg">Un servidor "modded" ejecuta mods — modificaciones que añaden mecánicas (magia, tecnología, mobs, dimensiones) — usando un mod loader.</p>
              <div className="space-y-3 mt-6">
                <div className="flex gap-4 p-4 rounded-xl border border-white/8 bg-white/[0.02]"><Layers size={20} className="text-white/50 flex-shrink-0 mt-0.5"/><div><strong className="text-white">Vanilla</strong><p className="text-sm text-white/55">Minecraft sin modificar.</p></div></div>
                <div className="flex gap-4 p-4 rounded-xl border border-white/8 bg-white/[0.02]"><Layers size={20} className="text-accent-blue flex-shrink-0 mt-0.5"/><div><strong className="text-white">Paper / Spigot</strong><p className="text-sm text-white/55">Servidor optimizado, soporta plugins (Bukkit) pero no mods de cliente.</p></div></div>
                <div className="flex gap-4 p-4 rounded-xl border border-accent-violet/25 bg-accent-violet/5"><Layers size={20} className="text-accent-violet flex-shrink-0 mt-0.5"/><div><strong className="text-white">Forge / NeoForge / Fabric</strong><p className="text-sm text-white/65">Cargadores de mods reales — instalan código que cambia el juego para servidor + cliente. <span className="text-accent-violet">Aquí entran los modpacks de CurseForge.</span></p></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* MODPACK GRID con números decorativos */}
        <section className="py-20 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-green mb-3">Catálogo</p>
              <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase">Modpacks <HL>con un click</HL></h2>
            </div>
            <p className="text-white/50 text-sm md:max-w-xs">¿No ves el tuyo? Sube el .zip por SFTP y dile al chat "instala este modpack".</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODPACKS.map((mp, i) => (
              <div key={mp.short} className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-accent-${mp.accent}/40 hover:bg-white/[0.04] transition-all`}>
                <span className="absolute -top-2 -right-1 font-heading text-[5rem] font-black text-white/[0.04] leading-none select-none">{String(i + 1).padStart(2, '0')}</span>
                <div className="relative">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br from-accent-${mp.accent}/40 to-accent-${mp.accent}/10 flex items-center justify-center mb-4`}>
                    <Boxes size={20} className="text-white" />
                  </div>
                  <span className={`inline-block text-[10px] uppercase tracking-wider font-bold text-accent-${mp.accent} bg-accent-${mp.accent}/10 px-2 py-0.5 rounded-full mb-2`}>{mp.tag}</span>
                  <h3 className="font-heading text-lg font-black text-white">{mp.name}</h3>
                  <div className="mt-3 flex items-center justify-between text-xs text-white/50 pt-3 border-t border-white/5">
                    <span><span className="text-white font-bold">{mp.mods}</span> mods</span>
                    <span className={`text-accent-${mp.accent} font-bold`}>{mp.ram}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CÓMO SE INSTALA — terminal mockup + steps */}
        <section className="py-20 border-t border-white/5">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-green mb-3">Setup</p>
              <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[0.95] uppercase">
                3 pasos. <br/><HL>2 minutos.</HL>
              </h2>
              <p className="mt-6 text-lg text-white/70">Sin SSH, sin SFTP manual, sin editar JARs. Lenguaje natural.</p>
              <div className="mt-8 space-y-4">
                {[
                  { n: '01', i: <MessageSquare size={18} />, t: 'Abre el chat del agente', s: 'En tu panel MineLab. Disponible 24/7 en español.' },
                  { n: '02', i: <Zap size={18} />, t: 'Escribe: "instala ATM10"', s: 'Reconoce nombre, versión y dependencias.' },
                  { n: '03', i: <Check size={18} />, t: 'Espera 2 minutos', s: 'Descarga JAR + mods + libs, configura y arranca.' },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-4 p-4 rounded-xl border border-white/8 bg-white/[0.02] hover:border-accent-green/30 hover:bg-accent-green/5 transition-colors">
                    <span className="font-heading text-2xl font-black text-accent-green/40">{s.n}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"><span className="text-accent-green">{s.i}</span><p className="font-heading font-black text-white">{s.t}</p></div>
                      <p className="text-sm text-white/55">{s.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-white/10 bg-[#0a0e17] overflow-hidden shadow-[0_30px_80px_-20px_rgba(168,85,247,0.25)]">
                <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/5">
                  <span className="w-3 h-3 rounded-full bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="ml-3 text-xs text-white/50 font-mono">terminal // installer.log</span>
                </div>
                <div className="p-6 font-mono text-sm space-y-1.5">
                  <p className="text-accent-violet">$ minelab install atm10</p>
                  <p className="text-white/50">→ resolving manifest from CurseForge…</p>
                  <p className="text-accent-green">✓ all-the-mods-10@2.41 (398 mods)</p>
                  <p className="text-white/50">→ downloading mods (parallel x16)</p>
                  <p className="text-accent-green">✓ neoforge 21.1.74 ready</p>
                  <p className="text-white/50">→ writing server.properties · 12G heap · view-distance 8</p>
                  <p className="text-accent-green">✓ mods/ (398) · config/ (412) · scripts/ (24)</p>
                  <p className="text-white/50">→ starting jvm…</p>
                  <p className="text-accent-green">✓ Done (94.2s)! For help, type "help"</p>
                  <p className="text-white">█</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOADERS — TABS */}
        <section className="py-20 border-t border-white/5">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-blue mb-3">Mod loaders</p>
          <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase mb-3">
            Forge · Fabric · <HL color="blue">NeoForge</HL>
          </h2>
          <p className="text-white/55 text-lg mb-10 max-w-2xl">Cada loader tiene su sweet spot. Si dudas, pregúntale al agente IA.</p>

          <div className="flex gap-2 mb-6 border-b border-white/10">
            {LOADERS.map((l, i) => (
              <button key={l.name} onClick={() => setTab(i)} className={`px-5 py-3 font-heading font-black text-sm uppercase tracking-wider transition-colors relative ${tab === i ? 'text-accent-green' : 'text-white/50 hover:text-white/80'}`}>
                {l.name}
                <span className="ml-2 text-[10px] text-white/40">· {l.tag}</span>
                {tab === i && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent-green" />}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-10 grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-accent-green mb-3">A favor</p>
              <ul className="space-y-2">
                {LOADERS[tab].pros.map((p) => <li key={p} className="flex gap-2 text-sm text-white/80"><Check size={14} className="text-accent-green flex-shrink-0 mt-1" />{p}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-3">En contra</p>
              <ul className="space-y-2">
                {LOADERS[tab].cons.map((c) => <li key={c} className="flex gap-2 text-sm text-white/65"><AlertTriangle size={14} className="text-amber-400/80 flex-shrink-0 mt-1" />{c}</li>)}
              </ul>
            </div>
            <div className="md:border-l border-white/10 md:pl-8">
              <p className="text-xs uppercase tracking-wider font-bold text-white/50 mb-3">Cuándo usarlo</p>
              <p className="text-white/85 leading-relaxed">{LOADERS[tab].when}</p>
            </div>
          </div>
        </section>

        {/* RAM — bar comparison */}
        <section className="py-20 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-green mb-3">Recursos</p>
              <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase">RAM por <HL>modpack</HL></h2>
            </div>
            <p className="text-white/50 text-sm md:max-w-xs">El agente IA detecta out-of-memory y te avisa para subir el plan.</p>
          </div>
          <div className="space-y-4">
            {RAM_TABLE.map((r) => (
              <div key={r.type} className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-4 mb-3">
                  <div className="flex items-baseline gap-3">
                    <Cpu size={16} className="text-accent-green/70" />
                    <span className="font-heading font-black text-white">{r.type}</span>
                    <span className="text-xs text-white/40">{r.mods}</span>
                  </div>
                  <div className="flex items-baseline gap-4 text-sm">
                    <span className="text-white/50">{r.players} jugadores</span>
                    <span className="font-heading font-black text-accent-green text-lg">{r.recRam}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent-green via-accent-violet to-accent-blue transition-all duration-700" style={{ width: `${(r.ramN / 16) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DIAGNOSTICS split */}
        <section className="py-20 border-t border-white/5">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-violet mb-3">Cuando algo falla</p>
          <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase mb-12">
            Diagnóstico <HL>automático</HL>
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <span className="absolute top-6 right-6 text-[10px] uppercase tracking-wider font-bold text-red-400/70 bg-red-400/10 px-2 py-1 rounded">Tradicional</span>
              <Wrench size={28} className="text-white/40 mb-4" />
              <h3 className="font-heading text-2xl font-black text-white mb-3">Hosting normal</h3>
              <p className="text-white/60 leading-relaxed">Te pasan un latest.log de 5.000 líneas en inglés con NullPointerException sin contexto. Buscas en Google, abres ticket, esperas 24h. La comunidad te dice "skill issue".</p>
            </div>
            <div className="relative rounded-2xl border border-accent-green/30 bg-gradient-to-br from-accent-green/10 via-transparent to-accent-violet/5 p-8 overflow-hidden">
              <span className="absolute top-6 right-6 text-[10px] uppercase tracking-wider font-bold text-accent-green bg-accent-green/15 px-2 py-1 rounded">MineLab + IA</span>
              <Bot size={28} className="text-accent-green mb-4" />
              <h3 className="font-heading text-2xl font-black text-white mb-3">Con agente IA</h3>
              <p className="text-white/85 leading-relaxed">Lee el log, identifica el mod culpable, te explica en español qué pasó, propone solución (downgrade, exclusión, parche). Lo aplica si confirmas. Server arriba en 3 min.</p>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-accent-green/20 blur-2xl" />
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-20 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-green mb-3">Pricing</p>
              <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase">Planes para <HL>modders</HL></h2>
            </div>
            <p className="text-white/50 text-sm md:max-w-xs">Cancela cuando quieras. Cambio gratuito de plan el primer mes.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { ram: '4 GB', price: '5', use: 'Vanilla, Paper, mods ligeros, Pixelmon', n: '01' },
              { ram: '6 GB', price: '7', use: 'Forge medio, RLCraft, Stoneblock', n: '02' },
              { ram: '8 GB', price: '10', use: 'ATM10, Vault Hunters básico, Better MC', n: '03', highlight: true },
              { ram: '12 GB', price: '15', use: 'Modpacks XL, Vault Hunters 600+', n: '04' },
            ].map((p) => (
              <div key={p.ram} className={`relative overflow-hidden rounded-2xl p-6 ${p.highlight ? 'border-2 border-accent-green/50 bg-gradient-to-br from-accent-green/15 to-transparent' : 'border border-white/10 bg-white/[0.02]'}`}>
                <span className="absolute -top-2 -right-1 font-heading text-[5rem] font-black text-white/[0.04] leading-none select-none">{p.n}</span>
                <div className="relative">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="font-heading text-xl font-black text-white">{p.ram}</span>
                    {p.highlight && <span className="text-[10px] uppercase tracking-wider font-bold text-accent-green bg-accent-green/15 px-2 py-0.5 rounded-full">Top mods</span>}
                  </div>
                  <div className="font-heading text-4xl font-black text-white">{p.price}<span className="text-base text-white/40 font-normal"> €</span></div>
                  <p className="text-xs text-white/40 mb-4">/mes</p>
                  <p className="text-sm text-white/60 leading-relaxed border-t border-white/5 pt-4">{p.use}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=mods-pricing" className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-green px-7 py-3 text-base font-bold text-[#0B1220] hover:bg-accent-green/90 transition-colors">
              Ver planes completos <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-t border-white/5">
          <div className="grid lg:grid-cols-3 gap-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-violet mb-3">FAQ</p>
              <h2 className="font-heading text-4xl md:text-5xl font-black text-white leading-[1] uppercase">Preguntas <br/><HL>frecuentes</HL></h2>
            </div>
            <div className="lg:col-span-2 space-y-3">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 open:bg-white/[0.04] open:border-accent-violet/20">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer font-heading font-black text-white list-none">
                    <span>{q}</span>
                    <span className="flex-shrink-0 w-7 h-7 rounded-full border border-accent-violet/40 text-accent-violet flex items-center justify-center text-xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-white/65 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-accent-violet/15 via-transparent to-accent-green/15 border border-accent-violet/30 p-10 md:p-16">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent-violet/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-green/20 blur-3xl pointer-events-none" />
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <Sparkles size={32} className="text-accent-violet mb-5" />
                <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase">
                  Tu modpack, listo en <HL>2 min</HL>
                </h2>
                <p className="mt-5 text-white/70 text-lg max-w-md">Crea tu servidor, escribe el nombre del modpack en el chat, y juega.</p>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=mods-final" className="group inline-flex items-center justify-between gap-4 rounded-xl bg-accent-green pl-2 pr-5 py-2 text-base font-bold text-[#0B1220] hover:bg-accent-green/90 transition-all">
                  <span className="bg-[#0B1220] text-accent-green px-4 py-2 rounded-lg flex items-center gap-2 text-xs uppercase tracking-wider"><Boxes size={14} /> Crear</span>
                  Servidor con mods <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
