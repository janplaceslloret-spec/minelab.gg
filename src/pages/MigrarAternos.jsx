import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Download, Server, Upload, Bot, AlertTriangle, ArrowRight, Sparkles, Clock, ArrowDownToLine } from 'lucide-react';
import SeoLayout from '../components/seo/SeoLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const STEPS = [
  { n: 1, color: 'blue', icon: <Download size={22} />, title: 'Exportar el world desde Aternos', minutes: '2 min', text: 'En el panel de Aternos, ve a Backups → busca el último backup → "Download world". Se descarga un .zip con tu mundo. Si tienes Nether o End, asegúrate de que están dentro (Aternos los empaqueta junto al overworld).', tip: 'Si tienes mods o plugins instalados, descarga también /mods, /config y /plugins desde la pestaña Files de Aternos.' },
  { n: 2, color: 'violet', icon: <Server size={22} />, title: 'Crear servidor MineLab vacío', minutes: '3 min', text: 'Regístrate en minelab.gg con Google. En el wizard elige software (Paper, Forge, Fabric o NeoForge según uses), versión de Minecraft (la misma que tenías en Aternos) y RAM. Paga con Stripe. En 2 minutos el servidor está vacío y arrancado.', tip: '¿Dudas con la RAM? Tabla completa por modpack en /hosting-minecraft-con-mods. Plan mínimo MineLab 4 GB; modpacks tipo ATM10 recomendado 8-12 GB.' },
  { n: 3, color: 'green', icon: <Upload size={22} />, title: 'Subir tu world por SFTP', minutes: '5 min', text: 'En tu panel MineLab, pestaña Settings → SFTP → activa el acceso. Te genera host, puerto, usuario y contraseña. Conecta con FileZilla. Borra /world creada por defecto, sube tu /world descomprimida del .zip de Aternos. Sube también /world_nether y /world_the_end si los tienes.', tip: 'Si jugabas con plugins (Bukkit/Paper), sube también /plugins. Si jugabas con mods (Forge/Fabric), sube /mods y /config.' },
  { n: 4, color: 'green', icon: <Bot size={22} />, title: 'Pídele al agente IA que termine el setup', minutes: '5 min', text: 'Abre el chat del agente en tu panel y dile algo como: "instala EssentialsX, LuckPerms y WorldGuard. Activa whitelist con estos jugadores: ...". El agente descarga las versiones correctas, edita server.properties, importa whitelist.json y reinicia. Listo para jugar.', tip: 'El agente IA también lee logs y diagnostica crashes. Si un mod falla, te dice cuál es y propone solución.' },
];

const ERRORS = [
  { title: 'El world no carga / "Failed to load level"', cause: 'Mismatch de versión de Minecraft entre Aternos y MineLab.', fix: 'Verifica en Aternos qué versión exacta tenías (1.20.1, 1.21.4...) y crea el servidor MineLab con esa misma versión. El agente IA detecta version mismatch y te avisa antes de arrancar.' },
  { title: '"Faltan datos de chunks" o jugadores aparecen sin inventario', cause: 'No se exportó la carpeta /playerdata o /stats.', fix: 'Vuelve a Aternos → Files → descarga playerdata/ y stats/ y súbelas por SFTP al mismo path en MineLab. Reinicia el servidor.' },
  { title: 'La whitelist se borró', cause: 'whitelist.json no se sube por defecto cuando descargas solo el world.', fix: 'Descarga whitelist.json y ops.json desde Files de Aternos, súbelos a la raíz del servidor MineLab. O dícelo al agente IA: "importa esta whitelist: [lista]".' },
  { title: 'Plugins de Aternos no funcionan en MineLab', cause: 'Aternos usa una versión Bukkit-fork peculiar; algunos plugins están "atados".', fix: 'Desinstala los plugins de Aternos y déjale al agente IA que reinstale las versiones oficiales desde SpigotMC / Modrinth. El world data persiste.' },
  { title: 'El servidor crashea al arrancar con mods', cause: 'Versión de Forge/Fabric incorrecta o mod cliente subido al servidor.', fix: 'El agente IA lee crash-reports/, identifica el mod culpable y propone fix. Mods que sólo funcionan en cliente (shaders, OptiFine) no van en /mods del servidor.' },
];

const FAQ = [
  { q: '¿Cuánto tarda toda la migración?', a: 'Con world pequeño (<500 MB) y sin mods, 15 minutos. Con un modpack grande (ATM10, Vault Hunters) y world de varios GB, hasta 40 minutos — la mayor parte es subida SFTP. El agente IA te avisa cuando todo está listo.' },
  { q: '¿Mis jugadores conservan inventario, exp, ubicaciones?', a: 'Sí, siempre que subas la carpeta /playerdata además del /world. Los datos de jugador se guardan ahí (inventario, posición, salud, exp, advancements).' },
  { q: '¿Funciona con Bedrock?', a: 'Por defecto MineLab arranca servidores Java. Si quieres soportar Bedrock cliente además de Java, dile al agente IA "instala Geyser y Floodgate" — son plugins que añaden compatibilidad cross-platform Java↔Bedrock.' },
  { q: '¿Y si solo tengo el plan gratuito de Aternos?', a: 'Sin problema. Aternos free permite descargar tu mundo igualmente desde Backups. Lo que pierdes al migrar es el server-IP de Aternos (cambiará a uno tuyo de MineLab); avisa a tu comunidad.' },
  { q: '¿Pierdo logros / advancements de mis jugadores?', a: 'No, si subes /playerdata y /advancements/ los advancements se preservan exactamente. Es información del world data, no de Aternos.' },
  { q: '¿Puedo mantener el mismo nombre / IP que tenía en Aternos?', a: 'No el .aternos.me (es propiedad de Aternos). MineLab te da una IP propia + puerto. Puedes apuntar tu propio dominio (ej. miservidor.com) si lo tienes.' },
];

function HL({ children, color = 'green' }) {
  const cls = { green: 'bg-accent-green text-[#0B1220]', violet: 'bg-accent-violet text-white', blue: 'bg-accent-blue text-white' }[color];
  return <span className={`inline-block ${cls} px-3 md:px-4 py-0.5 md:py-1 rounded-md align-baseline`}>{children}</span>;
}

const howToJsonLd = { '@context': 'https://schema.org', '@type': 'HowTo', name: 'Cómo migrar un servidor de Aternos a MineLab', description: 'Tutorial paso a paso para mover un servidor de Minecraft desde Aternos a MineLab conservando mundo, plugins y jugadores.', totalTime: 'PT15M', estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '5.00' }, supply: [{ '@type': 'HowToSupply', name: 'Cuenta Aternos con tu servidor actual' }, { '@type': 'HowToSupply', name: 'Cuenta MineLab (Google Sign-In)' }, { '@type': 'HowToSupply', name: 'Cliente SFTP (FileZilla recomendado)' }], step: STEPS.map((s) => ({ '@type': 'HowToStep', position: s.n, name: s.title, text: s.text, url: `https://minelab.gg/migrar-servidor-aternos#paso-${s.n}` })) };
const faqJsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
const breadcrumbJsonLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://minelab.gg/' }, { '@type': 'ListItem', position: 2, name: 'Migrar servidor de Aternos', item: 'https://minelab.gg/migrar-servidor-aternos' }] };

export default function MigrarAternos() {
  useDocumentMeta({
    title: 'Cómo migrar tu servidor de Aternos a MineLab (2026) | MineLab',
    description: 'Tutorial paso a paso para mover tu servidor de Aternos a MineLab en 15 minutos. Conserva mundo, plugins y jugadores. El agente IA hace el 80%.',
    canonical: 'https://minelab.gg/migrar-servidor-aternos',
    og: { type: 'article', title: 'Cómo migrar de Aternos a MineLab — guía 2026', description: '15 minutos, 4 pasos, conserva tu mundo. El asistente IA termina el setup por ti.', image: 'https://minelab.gg/og/migrar-aternos.png', url: 'https://minelab.gg/migrar-servidor-aternos' },
    twitter: { card: 'summary_large_image', title: 'Migrar de Aternos a MineLab — guía 2026', description: 'Tutorial 4 pasos en 15 minutos. Conserva mundo y plugins.', image: 'https://minelab.gg/og/migrar-aternos.png' },
    jsonLd: [howToJsonLd, faqJsonLd, breadcrumbJsonLd],
  });

  return (
    <SeoLayout>
      {/* HERO ASIMÉTRICO */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full bg-accent-blue/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-32 w-[600px] h-[600px] rounded-full bg-accent-green/10 blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-bold text-accent-blue mb-6">
                <Clock size={14} /> Tutorial · 15 minutos · 4 pasos
              </p>
              <h1 className="font-heading text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-white leading-[0.95] uppercase">
                Migra de <br className="hidden md:block" />
                <span className="text-white/40">Aternos</span> en <br className="hidden md:block" />
                <HL color="blue">15 minutos.</HL>
              </h1>
              <p className="mt-8 text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
                Conserva mundo, plugins, jugadores e inventarios. El agente IA hace el 80% del trabajo — tú descargas, subes y le dices qué quieres.
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3 max-w-2xl">
                {[
                  ['Mundo intacto', 'overworld + nether + end'],
                  ['Inventarios', 'playerdata preservado'],
                  ['Plugins reinstalados', 'agente IA los pone'],
                  ['14 días grace', 'puedes volver a Aternos'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-blue flex items-center justify-center"><Check size={13} strokeWidth={3} className="text-white" /></span>
                    <span className="text-sm text-white/85"><strong className="text-white">{k}</strong> <span className="text-white/55">{v}</span></span>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=migrar-hero" className="group inline-flex items-center justify-between gap-4 rounded-xl bg-accent-green pl-2 pr-5 py-2 text-base font-bold text-[#0B1220] hover:bg-accent-green/90 transition-all hover:translate-x-0.5">
                  <span className="bg-[#0B1220] text-accent-green px-4 py-2 rounded-lg flex items-center gap-2 text-xs uppercase tracking-wider"><ArrowDownToLine size={14} /> Empezar</span>
                  Migración ahora <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/aternos-vs-minelab" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors">Comparar antes →</Link>
              </div>
            </div>

            {/* RIGHT: visual de los 4 pasos compacto */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-accent-blue/20 via-transparent to-accent-green/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl border border-white/10 bg-[#0a0e17] p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-accent-blue/90">Roadmap</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-accent-blue/40 to-transparent" />
                  <span className="text-[10px] text-accent-green font-mono">15 min</span>
                </div>
                <div className="space-y-2">
                  {STEPS.map((s, i) => (
                    <div key={s.n} className="relative">
                      <div className="flex items-center gap-4 group p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                        <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-br from-accent-${s.color}/40 to-accent-${s.color}/10 flex items-center justify-center flex-shrink-0 text-white`}>
                          {s.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-white/40">PASO {String(s.n).padStart(2, '0')}</span>
                            <span className={`text-[10px] text-accent-${s.color} font-mono`}>· {s.minutes}</span>
                          </div>
                          <p className="font-heading font-bold text-white text-sm truncate">{s.title.replace(/—.*$/, '').trim()}</p>
                        </div>
                      </div>
                      {i < STEPS.length - 1 && <div className="ml-8 h-3 w-px bg-gradient-to-b from-white/20 to-transparent" />}
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-white/50">Soporte español 24/7</span>
                  <span className="text-accent-green font-bold">desde 5€/mes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <section className="border-y border-white/5 bg-white/[0.015] py-6 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl flex flex-wrap items-center justify-around gap-x-10 gap-y-3 text-white/40">
          <span className="text-xs uppercase tracking-[0.3em] font-bold">Conservas</span>
          <span className="font-heading font-bold">World</span>
          <span className="font-heading font-bold">Nether · End</span>
          <span className="font-heading font-bold">Inventarios</span>
          <span className="font-heading font-bold">Whitelist</span>
          <span className="font-heading font-bold">Advancements</span>
          <span className="font-heading font-bold">Plugins</span>
        </div>
      </section>

      <article className="container mx-auto px-6 max-w-6xl">
        {/* CHECKLIST */}
        <section className="py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-green mb-3">Pre-flight</p>
              <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase">
                Antes de <HL>empezar</HL>
              </h2>
              <p className="mt-5 text-white/60 text-lg">Asegúrate de tener todo esto a mano antes de los 4 pasos.</p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Acceso a tu cuenta Aternos (login activo)',
                'Backup reciente del world (Aternos los guarda 3 días)',
                'Lista de plugins / mods que tenías instalados',
                'Tarjeta o método SEPA para activar plan MineLab',
                'Cliente SFTP instalado (FileZilla recomendado)',
                'Tiempo: ~15 min vanilla, ~40 min modpack grande',
              ].map((item, i) => (
                <div key={item} className="group relative overflow-hidden flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 hover:border-accent-green/30 transition-colors">
                  <span className="absolute -top-1 -right-1 font-heading text-3xl font-black text-white/[0.06]">{String(i + 1).padStart(2, '0')}</span>
                  <Check size={18} className="text-accent-green flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/85 relative">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STEPS — versión magazine */}
        <section className="py-20 border-t border-white/5">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-blue mb-3">El proceso</p>
          <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase mb-12">
            Los <HL color="blue">4 pasos</HL>
          </h2>

          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <div key={s.n} id={`paso-${s.n}`} className="grid lg:grid-cols-12 gap-6 items-start group">
                {/* col 1: número gigante */}
                <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-start gap-4">
                  <span className={`font-heading text-7xl md:text-8xl font-black leading-[0.9] text-accent-${s.color}/20 group-hover:text-accent-${s.color}/40 transition-colors`}>{String(s.n).padStart(2, '0')}</span>
                  <div className="lg:mt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-white/40">Paso {s.n}</p>
                    <p className={`text-sm font-mono text-accent-${s.color} flex items-center gap-1`}><Clock size={11} /> {s.minutes}</p>
                  </div>
                </div>
                {/* col 2: contenido */}
                <div className={`lg:col-span-9 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 hover:border-accent-${s.color}/30 transition-colors`}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`w-12 h-12 rounded-xl bg-gradient-to-br from-accent-${s.color}/40 to-accent-${s.color}/10 flex items-center justify-center text-white flex-shrink-0`}>{s.icon}</span>
                    <h3 className="font-heading text-xl md:text-2xl font-black text-white">{s.title}</h3>
                  </div>
                  <p className="text-white/70 leading-relaxed mb-5">{s.text}</p>
                  <div className={`rounded-xl border border-accent-${s.color}/25 bg-accent-${s.color}/5 p-4 flex items-start gap-3`}>
                    <Sparkles size={18} className={`text-accent-${s.color} flex-shrink-0 mt-0.5`} />
                    <p className="text-sm text-white/85 leading-relaxed"><strong className={`text-accent-${s.color}`}>Tip:</strong> {s.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMMON ERRORS */}
        <section className="py-20 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-amber-400 mb-3">Troubleshooting</p>
              <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase">Errores <HL color="violet">comunes</HL></h2>
            </div>
            <p className="text-white/50 text-sm md:max-w-xs">Si te pasa algo de esto, no entres en pánico — son cosas conocidas con fix simple.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {ERRORS.map((e, i) => (
              <div key={e.title} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-amber-400/30 transition-colors">
                <span className="absolute -top-2 -right-1 font-heading text-[5rem] font-black text-white/[0.04] leading-none select-none">{String(i + 1).padStart(2, '0')}</span>
                <div className="relative">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-1" />
                    <h3 className="font-heading text-lg font-black text-white leading-tight">{e.title}</h3>
                  </div>
                  <p className="text-sm text-white/55 mb-3 pl-8"><strong className="text-white/85 uppercase tracking-wider text-[10px] block mb-1">Causa</strong>{e.cause}</p>
                  <p className="text-sm text-white/80 pl-8 border-l-2 border-accent-green/30 ml-0"><strong className="text-accent-green uppercase tracking-wider text-[10px] block mb-1">Fix</strong>{e.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* REGRET */}
        <section className="py-16 border-t border-white/5">
          <div className="relative rounded-3xl overflow-hidden border border-accent-blue/20 bg-gradient-to-br from-accent-blue/10 via-transparent to-accent-violet/10 p-10 md:p-14">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent-blue/15 blur-3xl pointer-events-none" />
            <div className="relative grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-3 flex justify-center">
                <span className="font-heading text-7xl md:text-9xl font-black text-accent-blue/30 leading-none">14</span>
              </div>
              <div className="md:col-span-9">
                <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-blue mb-2">Garantía</p>
                <h2 className="font-heading text-3xl md:text-5xl font-black text-white leading-[1] uppercase">¿Y si me <HL color="blue">arrepiento?</HL></h2>
                <p className="mt-4 text-white/70 leading-relaxed text-lg">
                  Cancelas la suscripción con un click desde el panel. Tu world sigue accesible vía SFTP <strong className="text-white">durante 14 días</strong> para que lo descargues y vuelvas a Aternos si quieres. No se pierde nada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RELATED */}
        <section className="py-20 border-t border-white/5">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-green mb-3">Más</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-white leading-[1] uppercase mb-10">
            Antes de migrar, <HL>compara</HL>
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <Link to="/aternos-vs-minelab" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 hover:border-accent-green/40 hover:bg-white/[0.04] transition-all">
              <span className="absolute -top-3 -right-1 font-heading text-[6rem] font-black text-white/[0.04] group-hover:text-accent-green/10 transition-colors leading-none select-none">→</span>
              <Server size={22} className="text-accent-green mb-4" />
              <h3 className="font-heading text-2xl font-black text-white mb-2 group-hover:text-accent-green transition-colors">MineLab vs Aternos</h3>
              <p className="text-sm text-white/55 relative">Tabla detallada precio / RAM / plugins / IA. Calculadora de ahorro real.</p>
            </Link>
            <Link to="/hosting-minecraft-con-mods" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 hover:border-accent-violet/40 hover:bg-white/[0.04] transition-all">
              <span className="absolute -top-3 -right-1 font-heading text-[6rem] font-black text-white/[0.04] group-hover:text-accent-violet/10 transition-colors leading-none select-none">→</span>
              <Sparkles size={22} className="text-accent-violet mb-4" />
              <h3 className="font-heading text-2xl font-black text-white mb-2 group-hover:text-accent-violet transition-colors">Hosting con mods</h3>
              <p className="text-sm text-white/55 relative">ATM10, RLCraft, Vault Hunters... el agente IA te lo instala en 2 minutos.</p>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-t border-white/5">
          <div className="grid lg:grid-cols-3 gap-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent-blue mb-3">FAQ</p>
              <h2 className="font-heading text-4xl md:text-5xl font-black text-white leading-[1] uppercase">Preguntas <br/><HL color="blue">frecuentes</HL></h2>
            </div>
            <div className="lg:col-span-2 space-y-3">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 open:bg-white/[0.04] open:border-accent-blue/20">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer font-heading font-bold text-white list-none">
                    <span>{q}</span>
                    <span className="flex-shrink-0 w-7 h-7 rounded-full border border-accent-blue/40 text-accent-blue flex items-center justify-center text-xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-white/65 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-accent-green/15 via-transparent to-accent-blue/15 border border-accent-green/30 p-10 md:p-16">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent-green/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent-blue/20 blur-3xl pointer-events-none" />
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <ArrowDownToLine size={32} className="text-accent-green mb-5" />
                <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-[1] uppercase">
                  Empieza la <HL>migración</HL>
                </h2>
                <p className="mt-5 text-white/70 text-lg max-w-md">15 minutos y tu servidor está libre de cola, anuncios y cortes. Cancelas cuando quieras.</p>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=migrar-final" className="group inline-flex items-center justify-between gap-4 rounded-xl bg-accent-green pl-2 pr-5 py-2 text-base font-bold text-[#0B1220] hover:bg-accent-green/90 transition-all">
                  <span className="bg-[#0B1220] text-accent-green px-4 py-2 rounded-lg flex items-center gap-2 text-xs uppercase tracking-wider"><Server size={14} /> Crear</span>
                  Servidor MineLab <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="https://discord.gg/TS49z4yr" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-white transition-colors">Pedir ayuda en Discord →</a>
              </div>
            </div>
          </div>
        </section>
      </article>
    </SeoLayout>
  );
}
