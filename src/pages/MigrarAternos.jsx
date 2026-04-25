import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Download, Server, Upload, Bot, AlertTriangle, ArrowRight, Sparkles, Clock } from 'lucide-react';
import SeoLayout from '../components/seo/SeoLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const STEPS = [
  {
    n: 1,
    icon: <Download size={22} className="text-accent-blue" />,
    title: 'Exportar el world desde Aternos',
    minutes: '2 min',
    text: 'En el panel de Aternos, ve a Backups → busca el último backup → "Download world". Se descarga un .zip con tu mundo. Si tienes Nether o End, asegúrate de que están dentro (Aternos los empaqueta junto al overworld).',
    tip: 'Si tienes mods o plugins instalados, descarga también las carpetas /mods, /config y /plugins desde la pestaña Files de Aternos.'
  },
  {
    n: 2,
    icon: <Server size={22} className="text-accent-violet" />,
    title: 'Crear servidor MineLab vacío',
    minutes: '3 min',
    text: 'Regístrate en minelab.gg con Google. En el wizard elige software (Paper, Forge, Fabric o NeoForge según uses), versión de Minecraft (la misma que tenías en Aternos) y RAM. Paga con Stripe. En 2 minutos el servidor está vacío y arrancado.',
    tip: '¿Dudas con la RAM? Tabla completa por modpack en /hosting-minecraft-con-mods. Como referencia: vanilla 2 GB, modpacks tipo ATM10 mínimo 8 GB.'
  },
  {
    n: 3,
    icon: <Upload size={22} className="text-accent-green" />,
    title: 'Subir tu world por SFTP',
    minutes: '5 min',
    text: 'En tu panel MineLab, pestaña Settings → SFTP → activa el acceso. Te genera host, puerto, usuario y contraseña. Conecta con FileZilla (o cualquier cliente SFTP). Dentro del servidor: borra la carpeta /world creada por defecto, sube tu carpeta /world descomprimida del .zip de Aternos. Sube también /world_nether y /world_the_end si los tienes.',
    tip: 'Si en Aternos jugabas con plugins (Bukkit/Paper), sube también /plugins. Si jugabas con mods (Forge/Fabric), sube /mods y /config.'
  },
  {
    n: 4,
    icon: <Bot size={22} className="text-accent-green" />,
    title: 'Pídele al agente IA que termine el setup',
    minutes: '5 min',
    text: 'Abre el chat del agente en tu panel y dile algo como: "instala EssentialsX, LuckPerms y WorldGuard. Activa whitelist con estos jugadores: ...". El agente descarga las versiones correctas, edita server.properties, importa whitelist.json y reinicia. Listo para jugar.',
    tip: 'El agente IA también lee logs y diagnostica crashes. Si un mod falla, te dice cuál es y propone solución.'
  },
];

const ERRORS = [
  {
    title: 'El world no carga / "Failed to load level"',
    cause: 'Mismatch de versión de Minecraft entre Aternos y MineLab.',
    fix: 'Verifica en Aternos qué versión exacta tenías (1.20.1, 1.21.4...) y crea el servidor MineLab con esa misma versión. El agente IA detecta version mismatch y te avisa antes de arrancar.'
  },
  {
    title: '"Faltan datos de chunks" o jugadores aparecen sin inventario',
    cause: 'No se exportó la carpeta /playerdata o /stats.',
    fix: 'Vuelve a Aternos → Files → descarga la carpeta playerdata/ y stats/ y súbelas por SFTP al mismo path en MineLab. Reinicia el servidor.'
  },
  {
    title: 'La whitelist se borró',
    cause: 'whitelist.json no se sube por defecto cuando descargas solo el world.',
    fix: 'Descarga whitelist.json y ops.json desde Files de Aternos, súbelos a la raíz del servidor MineLab. O dícelo al agente IA: "importa esta whitelist: [lista de nombres]".'
  },
  {
    title: 'Plugins de Aternos no funcionan en MineLab',
    cause: 'Aternos usa una versión Bukkit-fork peculiar; algunos plugins están "atados".',
    fix: 'Desinstala los plugins de Aternos y déjale al agente IA que reinstale las versiones oficiales desde SpigotMC / Modrinth. El world data persiste.'
  },
  {
    title: 'El servidor crashea al arrancar con mods',
    cause: 'Versión de Forge/Fabric incorrecta o mod cliente subido al servidor.',
    fix: 'El agente IA lee crash-reports/, identifica el mod culpable y propone fix. Mods que sólo funcionan en cliente (shaders, OptiFine) no van en /mods del servidor.'
  },
];

const FAQ = [
  {
    q: '¿Cuánto tarda toda la migración?',
    a: 'Con world pequeño (<500 MB) y sin mods, 15 minutos. Con un modpack grande (ATM10, Vault Hunters) y world de varios GB, hasta 40 minutos — la mayor parte es subida SFTP. El agente IA te avisa cuando todo está listo.'
  },
  {
    q: '¿Mis jugadores conservan inventario, exp, ubicaciones?',
    a: 'Sí, siempre que subas la carpeta /playerdata además del /world. Los datos de jugador se guardan ahí (inventario, posición, salud, exp, advancements).'
  },
  {
    q: '¿Funciona con Bedrock?',
    a: 'Por defecto MineLab arranca servidores Java. Si quieres soportar Bedrock cliente además de Java, dile al agente IA "instala Geyser y Floodgate" — son plugins que añaden compatibilidad cross-platform Java↔Bedrock.'
  },
  {
    q: '¿Y si solo tengo el plan gratuito de Aternos?',
    a: 'Sin problema. Aternos free permite descargar tu mundo igualmente desde Backups. Lo que pierdes al migrar es el server-IP de Aternos (cambiará a uno tuyo de MineLab); avisa a tu comunidad.'
  },
  {
    q: '¿Pierdo logros / advancements de mis jugadores?',
    a: 'No, si subes /playerdata y /advancements/ los advancements se preservan exactamente. Es información del world data, no de Aternos.'
  },
  {
    q: '¿Puedo mantener el mismo nombre / IP que tenía en Aternos?',
    a: 'No el .aternos.me (es propiedad de Aternos). MineLab te da una IP propia + puerto. Puedes apuntar tu propio dominio (ej. miservidor.com) si lo tienes.'
  },
];

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Cómo migrar un servidor de Aternos a MineLab',
  description: 'Tutorial paso a paso para mover un servidor de Minecraft desde Aternos a MineLab conservando mundo, plugins y jugadores.',
  totalTime: 'PT15M',
  estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '4.99' },
  supply: [
    { '@type': 'HowToSupply', name: 'Cuenta Aternos con tu servidor actual' },
    { '@type': 'HowToSupply', name: 'Cuenta MineLab (Google Sign-In)' },
    { '@type': 'HowToSupply', name: 'Cliente SFTP (FileZilla recomendado)' },
  ],
  step: STEPS.map((s) => ({
    '@type': 'HowToStep',
    position: s.n,
    name: s.title,
    text: s.text,
    url: `https://minelab.gg/migrar-servidor-aternos#paso-${s.n}`,
  })),
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
    { '@type': 'ListItem', position: 2, name: 'Migrar servidor de Aternos', item: 'https://minelab.gg/migrar-servidor-aternos' },
  ],
};

export default function MigrarAternos() {
  useDocumentMeta({
    title: 'Cómo migrar tu servidor de Aternos a MineLab (2026) | MineLab',
    description: 'Tutorial paso a paso para mover tu servidor de Aternos a MineLab en 15 minutos. Conserva mundo, plugins y jugadores. El agente IA hace el 80%.',
    canonical: 'https://minelab.gg/migrar-servidor-aternos',
    og: {
      type: 'article',
      title: 'Cómo migrar de Aternos a MineLab — guía 2026',
      description: '15 minutos, 4 pasos, conserva tu mundo. El asistente IA termina el setup por ti.',
      image: 'https://minelab.gg/og/migrar-aternos.png',
      url: 'https://minelab.gg/migrar-servidor-aternos',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Migrar de Aternos a MineLab — guía 2026',
      description: 'Tutorial 4 pasos en 15 minutos. Conserva mundo y plugins.',
      image: 'https://minelab.gg/og/migrar-aternos.png',
    },
    jsonLd: [howToJsonLd, faqJsonLd, breadcrumbJsonLd],
  });

  return (
    <SeoLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-6 max-w-5xl py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-green/30 bg-accent-green/10 px-4 py-1.5 text-xs font-semibold text-accent-green mb-6">
            <Clock size={14} /> Tiempo total: 15 minutos · 4 pasos
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
            Cómo migrar tu servidor de Aternos a{' '}
            <span className="bg-gradient-to-r from-accent-green via-accent-blue to-accent-violet bg-clip-text text-transparent">MineLab</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Guía paso a paso 2026. Conservas tu mundo, plugins, jugadores e inventarios. El asistente IA hace el 80% del trabajo — tú solo descargas, subes y le dices qué quieres.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=migrar-hero" className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-green px-7 py-3 text-base font-semibold text-[#0B1220] hover:bg-accent-green/90 transition-colors">
              Empezar migración <ArrowRight size={16} />
            </Link>
            <Link to="/aternos-vs-minelab" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors">
              Comparar antes
            </Link>
          </div>
        </div>
      </section>

      {/* CHECKLIST */}
      <section className="container mx-auto px-6 max-w-4xl py-16 border-t border-white/5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">Antes de empezar — checklist</h2>
        <p className="text-white/60 mb-8 text-lg">Asegúrate de tener esto a mano antes de los 4 pasos:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Acceso a tu cuenta Aternos (login activo)',
            'Backup reciente del world en Aternos (los guarda 3 días)',
            'Lista de plugins / mods que tenías instalados',
            'Tarjeta o método SEPA para activar plan MineLab',
            'Cliente SFTP instalado (FileZilla recomendado)',
            'Tiempo: ~15 min vanilla, ~40 min modpack grande',
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <Check size={18} className="text-accent-green flex-shrink-0 mt-0.5" />
              <span className="text-sm text-white/80">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section className="container mx-auto px-6 max-w-4xl py-16 border-t border-white/5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">Los 4 pasos</h2>
        <p className="text-white/60 mb-10 text-lg">Cada paso tiene un tip-en-recuadro con el detalle que más se olvida.</p>

        <div className="space-y-5">
          {STEPS.map((s) => (
            <div key={s.n} id={`paso-${s.n}`} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-accent-green/20 to-accent-violet/20 flex items-center justify-center">
                  {s.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs uppercase tracking-wider font-semibold text-accent-green/80">Paso {s.n}</span>
                    <span className="text-xs text-white/40 flex items-center gap-1"><Clock size={11} /> {s.minutes}</span>
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-white">{s.title}</h3>
                </div>
              </div>
              <p className="text-white/70 leading-relaxed text-base mb-4">{s.text}</p>
              <div className="rounded-xl border border-accent-green/20 bg-accent-green/5 p-4 flex items-start gap-3">
                <Sparkles size={18} className="text-accent-green flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/80 leading-relaxed"><strong className="text-accent-green">Tip:</strong> {s.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMMON ERRORS */}
      <section className="container mx-auto px-6 max-w-4xl py-16 border-t border-white/5">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">Errores comunes y cómo arreglarlos</h2>
        <p className="text-white/60 mb-10 text-lg">Si te pasa algo de esto, no entres en pánico — son cosas conocidas con fix simple.</p>
        <div className="space-y-4">
          {ERRORS.map((e) => (
            <div key={e.title} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-1" />
                <h3 className="font-heading text-lg font-bold text-white">{e.title}</h3>
              </div>
              <p className="text-sm text-white/60 mb-2"><strong className="text-white/80">Causa:</strong> {e.cause}</p>
              <p className="text-sm text-white/70"><strong className="text-accent-green">Fix:</strong> {e.fix}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REGRET SECTION */}
      <section className="container mx-auto px-6 max-w-4xl py-16 border-t border-white/5">
        <div className="rounded-3xl border border-accent-blue/20 bg-gradient-to-br from-accent-blue/5 to-accent-violet/5 p-8 md:p-12 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">¿Y si me arrepiento?</h2>
          <p className="text-white/70 leading-relaxed text-lg max-w-2xl mx-auto">
            Cancelas la suscripción con un click desde el panel. Tu world sigue accesible vía SFTP durante 14 días para que lo descargues y vuelvas a Aternos si quieres. No se pierde nada.
          </p>
        </div>
      </section>

      {/* RELATED */}
      <section className="container mx-auto px-6 max-w-4xl py-16 border-t border-white/5">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-6">Antes de migrar, ¿quieres comparar?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link to="/aternos-vs-minelab" className="group rounded-2xl border border-white/8 bg-white/[0.02] p-6 hover:border-accent-green/40 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Server size={20} className="text-accent-green" />
              <h3 className="font-heading text-lg font-bold text-white group-hover:text-accent-green transition-colors">MineLab vs Aternos</h3>
            </div>
            <p className="text-sm text-white/60">Tabla detallada precio / RAM / plugins / IA. Calculadora de ahorro real.</p>
          </Link>
          <Link to="/hosting-minecraft-con-mods" className="group rounded-2xl border border-white/8 bg-white/[0.02] p-6 hover:border-accent-violet/40 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={20} className="text-accent-violet" />
              <h3 className="font-heading text-lg font-bold text-white group-hover:text-accent-violet transition-colors">Hosting Minecraft con mods</h3>
            </div>
            <p className="text-sm text-white/60">Si quieres ATM10, RLCraft, Vault Hunters... el agente IA te lo instala en 2 minutos.</p>
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
        <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white mb-4">Empieza la migración ahora</h2>
        <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">15 minutos y tu servidor está libre de cola, anuncios y cortes. Cancelas cuando quieras.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=migrar-final" className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-green px-8 py-4 text-base font-semibold text-[#0B1220] hover:bg-accent-green/90 transition-colors">
            Crear servidor MineLab <ArrowRight size={16} />
          </Link>
          <a href="https://discord.gg/TS49z4yr" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors">
            Pedir ayuda en Discord
          </a>
        </div>
      </section>
    </SeoLayout>
  );
}
