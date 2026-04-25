import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Cpu, Boxes, MessageSquare, Wrench, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import SeoLayout from '../components/seo/SeoLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const MODPACKS = [
  { name: 'All The Mods 10', short: 'ATM10', mods: '400+', ram: '8-12 GB', loader: 'NeoForge', tag: 'kitchen-sink' },
  { name: 'RLCraft', short: 'RLCraft', mods: '250+', ram: '6-8 GB', loader: 'Forge', tag: 'hardcore' },
  { name: 'Stoneblock 3', short: 'Stoneblock', mods: '300+', ram: '6-8 GB', loader: 'Forge', tag: 'skyblock' },
  { name: 'Vault Hunters 3rd', short: 'Vault Hunters', mods: '600+', ram: '10-16 GB', loader: 'Forge', tag: 'roguelike' },
  { name: 'Pixelmon Reforged', short: 'Pixelmon', mods: '50+', ram: '4-6 GB', loader: 'Forge', tag: 'pokémon' },
  { name: 'Better Minecraft (BMC)', short: 'BMC', mods: '250+', ram: '6-8 GB', loader: 'Forge', tag: 'aventura' },
  { name: 'Create: Above & Beyond', short: 'Create A&B', mods: '180+', ram: '6 GB', loader: 'Forge', tag: 'tech' },
  { name: 'SkyFactory 4 / Prominence II', short: 'SkyFactory', mods: '200+', ram: '6 GB', loader: 'Forge/Fabric', tag: 'skyblock' },
];

const RAM_TABLE = [
  { type: 'Vanilla', mods: '0', minRam: '1 GB', recRam: '2 GB', players: '5-10' },
  { type: 'Paper + plugins ligeros', mods: '0 (10 plugins)', minRam: '2 GB', recRam: '4 GB', players: '10-30' },
  { type: 'Forge ligero', mods: '30-50', minRam: '4 GB', recRam: '6 GB', players: '5-15' },
  { type: 'Fabric medio (Create, JEI)', mods: '60-100', minRam: '4 GB', recRam: '6 GB', players: '5-15' },
  { type: 'RLCraft / BMC', mods: '250+', minRam: '6 GB', recRam: '8 GB', players: '5-10' },
  { type: 'All The Mods 10', mods: '400+', minRam: '8 GB', recRam: '12 GB', players: '4-8' },
  { type: 'Vault Hunters 3', mods: '600+', minRam: '10 GB', recRam: '16 GB', players: '3-6' },
];

const LOADERS = [
  {
    name: 'Forge',
    pros: ['Catálogo enorme (15+ años)', 'Casi todos los modpacks grandes', 'Soporte comunidad masivo'],
    cons: ['Más pesado en RAM', 'Arranque más lento', 'Menos optimizado en MC 1.21'],
    when: 'Mods clásicos, modpacks tipo ATM, RLCraft, Vault Hunters.',
  },
  {
    name: 'Fabric',
    pros: ['Ligero y rápido', 'Mejor en MC 1.20+', 'Ideal para mods de optimización (Lithium, Sodium)'],
    cons: ['Menos mods grandes que Forge', 'Modpacks más nuevos / pequeños'],
    when: 'Servidores survival con buen rendimiento, mods Quilt-compatibles.',
  },
  {
    name: 'NeoForge',
    pros: ['Fork moderno de Forge', 'Fix de problemas históricos', 'Estándar para 1.20.4+ adelante'],
    cons: ['Muy nuevo, algunos mods aún no migran', 'Documentación inferior'],
    when: 'Modpacks 2025+, ATM10 y siguientes.',
  },
];

const FAQ = [
  {
    q: '¿Puedo subir mi modpack custom?',
    a: 'Sí. Sube el .zip exportado desde CurseForge o Modrinth por SFTP a la carpeta del servidor y dile al asistente IA "instala este modpack". Detecta el manifest, descarga las dependencias y configura el JAR automáticamente.'
  },
  {
    q: '¿Soportáis CurseForge y Modrinth?',
    a: 'Ambos. El agente IA conoce las APIs de CurseForge y Modrinth: pídele cualquier mod por nombre o ID ("instala JEI 1.20.1", "instala Sodium última versión") y se descarga la versión correcta para tu MC + loader.'
  },
  {
    q: '¿Cómo cambio de versión de Forge sin perder el mundo?',
    a: 'Antes de cualquier cambio de versión MineLab crea un backup automático del world + config. Si algo falla, restaura con un click desde la pestaña Backups. Los mundos vanilla son 100% compatibles entre versiones; los con mods requieren los mismos mods en la nueva versión (el agente lo gestiona).'
  },
  {
    q: '¿Cuántos jugadores soporta un servidor con 200 mods?',
    a: 'Depende de la RAM y los mods concretos. Como referencia: con 8 GB de RAM y un modpack tipo ATM10 (400 mods), 4-6 jugadores estables. RLCraft (250 mods, complejo) ~5 jugadores con 8 GB. Para más jugadores conviene subir a 12 GB y precargar el mundo.'
  },
  {
    q: '¿Hay límite de mods?',
    a: 'No hay límite por contrato. El límite real lo pone la RAM de tu plan: cada mod cargado ocupa memoria al arrancar. Servidores con >600 mods (Vault Hunters tier) necesitan 16 GB+ para no crashear al iniciar. El agente IA detecta out-of-memory y te avisa para subir el plan.'
  },
  {
    q: '¿Qué pasa si un mod crashea el servidor?',
    a: 'El asistente IA lee el latest.log, identifica el mod culpable (por NullPointerException, ConcurrentModification, etc.) y propone solución: actualizar el mod, downgrade, o eliminarlo. Si no sabe arreglarlo, te enseña el stack-trace con explicación en español.'
  },
];

const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'MineLab — Hosting Minecraft con mods',
  description: 'Hosting Minecraft modded con asistente IA: instala cualquier modpack (Forge, Fabric, NeoForge) en 2 minutos. ATM10, RLCraft, Vault Hunters, Pixelmon. Desde 4,99 €/mes.',
  image: 'https://minelab.gg/og/hosting-mods.png',
  brand: { '@type': 'Brand', name: 'MineLab' },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '127',
    bestRating: '5',
  },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '4.99',
    highPrice: '14.99',
    offerCount: 4,
    availability: 'https://schema.org/InStock',
    url: 'https://minelab.gg/hosting-minecraft-con-mods',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://minelab.gg/' },
    { '@type': 'ListItem', position: 2, name: 'Hosting Minecraft con mods', item: 'https://minelab.gg/hosting-minecraft-con-mods' },
  ],
};

export default function HostingConMods() {
  useDocumentMeta({
    title: 'Hosting Minecraft con mods (Forge, Fabric, NeoForge) | MineLab',
    description: 'Hosting Minecraft modded con asistente IA: instala cualquier modpack en 2 minutos. ATM10, RLCraft, Vault Hunters, Pixelmon. Desde 4,99 €/mes.',
    canonical: 'https://minelab.gg/hosting-minecraft-con-mods',
    og: {
      type: 'article',
      title: 'Hosting Minecraft con mods — Forge, Fabric, NeoForge',
      description: 'Instala cualquier modpack con un mensaje al agente IA. ATM10, RLCraft, Vault Hunters, Pixelmon.',
      image: 'https://minelab.gg/og/hosting-mods.png',
      url: 'https://minelab.gg/hosting-minecraft-con-mods',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Hosting Minecraft con mods — MineLab',
      description: 'Instala cualquier modpack en 2 minutos con el asistente IA.',
      image: 'https://minelab.gg/og/hosting-mods.png',
    },
    jsonLd: [productJsonLd, faqJsonLd, breadcrumbJsonLd],
  });

  return (
    <SeoLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-6 max-w-5xl py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-violet/30 bg-accent-violet/10 px-4 py-1.5 text-xs font-semibold text-accent-violet mb-6">
            <Sparkles size={14} /> Forge · Fabric · NeoForge — todo soportado
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
            Hosting Minecraft con mods —{' '}
            <span className="bg-gradient-to-r from-accent-violet via-accent-blue to-accent-green bg-clip-text text-transparent">sin complicarte</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Instala cualquier mod o modpack (ATM10, RLCraft, Vault Hunters, Pixelmon...) con un mensaje al asistente IA. Sin descargar JARs, sin configurar manualmente, sin frustración.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=mods-hero" className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-green px-7 py-3 text-base font-semibold text-[#0B1220] hover:bg-accent-green/90 transition-colors">
              Crear servidor con mods <ArrowRight size={16} />
            </Link>
            <Link to="/aternos-vs-minelab" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors">
              Comparar vs Aternos
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT IS MODDED */}
      <section className="container mx-auto px-6 max-w-5xl py-16">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">¿Qué es un servidor Minecraft modded?</h2>
        <p className="text-white/70 leading-relaxed text-lg">
          Un servidor "modded" es uno que ejecuta mods — modificaciones que añaden mecánicas nuevas (magia, tecnología, mobs, dimensiones) — usando un mod loader. Los más usados son:
        </p>
        <ul className="mt-4 space-y-2 text-white/70 leading-relaxed">
          <li><strong className="text-white">Vanilla:</strong> Minecraft sin modificar.</li>
          <li><strong className="text-white">Paper / Spigot:</strong> servidor optimizado, soporta plugins (Bukkit) pero no mods de cliente.</li>
          <li><strong className="text-white">Forge / NeoForge / Fabric:</strong> cargadores de mods reales — instalan código que cambia el juego para servidor + cliente.</li>
        </ul>
        <p className="mt-4 text-white/70 leading-relaxed text-lg">
          Si quieres jugar ATM10, RLCraft o cualquier modpack de CurseForge / Modrinth, necesitas hosting con soporte Forge o Fabric. MineLab los soporta todos sin coste extra.
        </p>
      </section>

      {/* MODPACK GRID */}
      <section className="container mx-auto px-6 max-w-6xl py-16 border-t border-white/5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">Modpacks soportados (con un click)</h2>
        <p className="text-white/60 mb-10 text-lg">El asistente IA conoce los modpacks más populares y los instala automáticamente. Si no ves el tuyo, pídelo en el chat: descarga desde CurseForge / Modrinth o tu .zip por SFTP.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODPACKS.map((mp) => (
            <div key={mp.short} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 hover:border-accent-violet/40 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-violet/30 to-accent-blue/20 flex items-center justify-center">
                  <Boxes size={20} className="text-white" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-violet/80 bg-accent-violet/10 px-2 py-0.5 rounded-full">{mp.tag}</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-white">{mp.name}</h3>
              <div className="mt-2 text-xs text-white/50 space-y-1">
                <div><span className="text-white/40">Mods:</span> {mp.mods}</div>
                <div><span className="text-white/40">RAM:</span> {mp.ram}</div>
                <div><span className="text-white/40">Loader:</span> {mp.loader}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW TO INSTALL */}
      <section className="container mx-auto px-6 max-w-5xl py-16 border-t border-white/5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">Cómo se instala — 3 pasos, 2 minutos</h2>
        <p className="text-white/60 mb-10 text-lg">Sin SSH, sin SFTP manual, sin editar JARs. El agente IA lo hace todo:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { step: '1', icon: <MessageSquare size={22} className="text-accent-green" />, title: 'Abre el chat del agente', text: 'En tu panel MineLab, sección Chat. Disponible 24/7 en español.' },
            { step: '2', icon: <Zap size={22} className="text-accent-violet" />, title: 'Escribe: "instala ATM10"', text: 'Lenguaje natural. El agente reconoce nombre, versión y dependencias automáticamente.' },
            { step: '3', icon: <Check size={22} className="text-accent-blue" />, title: 'Espera 2 minutos', text: 'Descarga JAR + mods + libs, configura RAM óptima, arranca el server. Listo para jugar.' },
          ].map((s) => (
            <div key={s.step} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">{s.icon}</div>
                <span className="text-3xl font-heading font-extrabold text-white/15">{s.step}</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LOADERS COMPARISON */}
      <section className="container mx-auto px-6 max-w-6xl py-16 border-t border-white/5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">Forge vs Fabric vs NeoForge — ¿cuál elegir?</h2>
        <p className="text-white/60 mb-10 text-lg">Cada loader tiene su sweet spot. Si dudas, dile al agente IA "qué loader recomiendas para X" y te explica.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {LOADERS.map((l) => (
            <div key={l.name} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="font-heading text-2xl font-bold text-white mb-4">{l.name}</h3>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider text-accent-green/80 font-semibold mb-2">A favor</p>
                <ul className="space-y-1 text-sm text-white/70">
                  {l.pros.map((p) => (
                    <li key={p} className="flex gap-2"><Check size={14} className="text-accent-green flex-shrink-0 mt-0.5" />{p}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider text-amber-400/80 font-semibold mb-2">En contra</p>
                <ul className="space-y-1 text-sm text-white/60">
                  {l.cons.map((c) => (
                    <li key={c} className="flex gap-2"><AlertTriangle size={14} className="text-amber-400/80 flex-shrink-0 mt-0.5" />{c}</li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-white/5 pt-3">
                <p className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-1">Cuándo usarlo</p>
                <p className="text-sm text-white/70">{l.when}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RAM TABLE */}
      <section className="container mx-auto px-6 max-w-5xl py-16 border-t border-white/5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">Requisitos de RAM por modpack</h2>
        <p className="text-white/60 mb-8 text-lg">Tabla de referencia. La RAM real depende del número de chunks cargados y jugadores. El agente IA detecta out-of-memory y te avisa para subir el plan.</p>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 font-heading text-white">Tipo de servidor</th>
                <th className="text-left p-4 font-heading text-white">Mods</th>
                <th className="text-left p-4 font-heading text-white">RAM mínima</th>
                <th className="text-left p-4 font-heading text-accent-green">RAM recomendada</th>
                <th className="text-left p-4 font-heading text-white">Jugadores</th>
              </tr>
            </thead>
            <tbody>
              {RAM_TABLE.map((row, i) => (
                <tr key={row.type} className={i % 2 ? 'bg-white/[0.015]' : ''}>
                  <td className="p-4 font-medium text-white">{row.type}</td>
                  <td className="p-4 text-white/60">{row.mods}</td>
                  <td className="p-4 text-white/60">{row.minRam}</td>
                  <td className="p-4 text-accent-green font-semibold">{row.recRam}</td>
                  <td className="p-4 text-white/60">{row.players}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-white/40 mt-3">* Datos basados en testing real con 1.20.1+ y población media de jugadores activos.</p>
      </section>

      {/* DIAGNOSTICS */}
      <section className="container mx-auto px-6 max-w-5xl py-16 border-t border-white/5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">Diagnóstico automático cuando algo falla</h2>
        <p className="text-white/60 mb-8 text-lg">Los servidores con mods crashean. Es la realidad. La diferencia es cómo se resuelve.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-3">
              <Wrench size={22} className="text-accent-blue" />
              <h3 className="font-heading text-lg font-bold text-white">Hosting tradicional</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">Te pasan un latest.log de 5000 líneas en inglés con NullPointerException sin contexto. Buscas en Google, abres ticket, esperas 24h.</p>
          </div>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/5 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles size={22} className="text-accent-green" />
              <h3 className="font-heading text-lg font-bold text-white">MineLab + IA</h3>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">El agente lee el log, identifica el mod culpable, te explica en español qué pasó, propone solución (downgrade, exclusión, parche). Lo aplica si confirmas. Servidor arriba en 3 minutos.</p>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="container mx-auto px-6 max-w-5xl py-16 border-t border-white/5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">Precios para servidores con mods</h2>
        <p className="text-white/60 mb-8 text-lg">Pago mensual, cancelas cuando quieras, primer mes con cambio gratuito de plan si te quedas corto de RAM.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { ram: '2 GB', price: '4,99', use: 'Vanilla, Paper, mods ligeros' },
            { ram: '4 GB', price: '7,99', use: 'Forge ligero, Pixelmon' },
            { ram: '6 GB', price: '9,99', use: 'RLCraft, BMC, Stoneblock' },
            { ram: '8 GB', price: '14,99', use: 'ATM10, Vault Hunters', highlight: true },
          ].map((p) => (
            <div key={p.ram} className={`rounded-2xl border p-5 ${p.highlight ? 'border-accent-green/40 bg-accent-green/5' : 'border-white/8 bg-white/[0.02]'}`}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-heading text-2xl font-extrabold text-white">{p.ram}</span>
                {p.highlight && <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-green bg-accent-green/15 px-2 py-0.5 rounded-full">Top mods</span>}
              </div>
              <div className="text-3xl font-heading font-extrabold text-white">{p.price}<span className="text-sm text-white/40 font-normal"> €/mes</span></div>
              <p className="mt-3 text-xs text-white/50 leading-relaxed">{p.use}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=mods-pricing" className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-green px-7 py-3 text-base font-semibold text-[#0B1220] hover:bg-accent-green/90 transition-colors">
            Ver planes completos <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-6 max-w-4xl py-16 border-t border-white/5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-8">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border border-white/8 bg-white/[0.02] p-5 open:bg-white/[0.04]">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-heading font-semibold text-white text-base md:text-lg">{q}</span>
                <span className="text-accent-green text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container mx-auto px-6 max-w-4xl py-20 text-center border-t border-white/5">
        <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white mb-4">Tu modpack, listo en 2 minutos</h2>
        <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">Crea tu servidor, escribe el nombre del modpack en el chat, y juega. Cancela cuando quieras.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=mods-final" className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-green px-8 py-4 text-base font-semibold text-[#0B1220] hover:bg-accent-green/90 transition-colors">
            Crear servidor con mods <ArrowRight size={16} />
          </Link>
          <Link to="/migrar-servidor-aternos" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors">
            Vengo de Aternos
          </Link>
        </div>
      </section>
    </SeoLayout>
  );
}
