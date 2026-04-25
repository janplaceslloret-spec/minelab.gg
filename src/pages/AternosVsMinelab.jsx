import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, AlertTriangle, Zap, MessageSquare, Wrench, Shield, ArrowRight, Sparkles } from 'lucide-react';
import SeoLayout from '../components/seo/SeoLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const FAQ = [
  {
    q: '¿MineLab tiene plan gratis?',
    a: 'No, no tenemos plan gratuito. Aternos puede ofrecer plan gratis porque apaga tu servidor cada vez que nadie juega y muestra anuncios. En MineLab garantizamos uptime 24/7, sin cola y sin publicidad — eso requiere infraestructura dedicada que cuesta dinero. Pero el plan más barato son 4,99 €/mes (RAM 2 GB, ideal para servidores pequeños).'
  },
  {
    q: '¿Puedo usar mi mundo de Aternos?',
    a: 'Sí. Aternos te permite descargar el world desde Backups → Download. En MineLab subes ese archivo por SFTP a /world (o /world_nether y /world_the_end si tienes Nether y End). Tenemos un tutorial paso a paso en /migrar-servidor-aternos.'
  },
  {
    q: '¿Hay cola de espera para entrar a mi servidor?',
    a: 'Nunca. Tu servidor MineLab está siempre encendido (a no ser que tú lo apagues manualmente). Aternos free aplica una cola porque comparte recursos entre miles de servidores; MineLab te da RAM dedicada.'
  },
  {
    q: '¿Cómo se paga? ¿Tarjeta, PayPal?',
    a: 'Pasarela de pago Stripe (la misma que usan empresas como Uber o Spotify). Acepta tarjetas Visa, Mastercard, AmEx y métodos bancarios SEPA. Pago mensual cancelable en cualquier momento desde tu panel.'
  },
  {
    q: '¿Y si quiero volver a Aternos? ¿Pierdo mi mundo?',
    a: 'No pierdes nada. Cancelas la suscripción con un click desde el panel y tu world sigue accesible vía SFTP durante 14 días para que lo descargues. Después se borra de nuestros servidores definitivamente.'
  },
  {
    q: '¿Qué pasa con los plugins / mods que tengo en Aternos?',
    a: 'En MineLab puedes instalar cualquier plugin/mod sin restricciones. El asistente IA los instala por ti — sólo escribe "instala EssentialsX" o "instala el modpack ATM10 versión 2.30" en el chat y se encarga de todo, incluyendo dependencias.'
  }
];

const tableRows = [
  { label: 'RAM máxima', free: '2 GB', premium: '8 GB', minelab: '12 GB' },
  { label: 'Servidor siempre online', free: false, premium: true, minelab: true },
  { label: 'Sin cola al entrar', free: false, premium: 'medio', minelab: true },
  { label: 'Plugins ilimitados', free: 'medio', premium: 'medio', minelab: true },
  { label: 'Forge / Fabric / NeoForge', free: 'medio', premium: true, minelab: true },
  { label: 'SFTP (subir mundos / configs)', free: false, premium: true, minelab: true },
  { label: 'Backups automáticos diarios', free: false, premium: 'medio', minelab: true },
  { label: 'Asistente IA configurador', free: false, premium: false, minelab: true },
  { label: 'Consola web tiempo real', free: 'medio', premium: 'medio', minelab: true },
  { label: 'Sin anuncios', free: false, premium: true, minelab: true },
  { label: 'Soporte en español', free: false, premium: 'medio', minelab: true },
  { label: 'Cancelación 1 click', free: 'n/a', premium: 'medio', minelab: true },
];

function Cell({ value }) {
  if (value === true) return <Check size={20} className="text-accent-green inline-block" />;
  if (value === false) return <X size={20} className="text-red-400 inline-block" />;
  if (value === 'medio') return <AlertTriangle size={18} className="text-yellow-400 inline-block" />;
  return <span className="text-white/70 text-sm">{value}</span>;
}

function SavingsCalculator() {
  const [ram, setRam] = useState(4);
  const [players, setPlayers] = useState(8);

  const { aternosCost, minelabCost, savings } = useMemo(() => {
    // Aternos premium pricing approximation (público en su web)
    const aternosBase = ram <= 2 ? 9.99 : ram <= 4 ? 12.99 : ram <= 6 ? 16.99 : ram <= 8 ? 19.99 : 24.99;
    // MineLab pricing aprox: 2GB 4.99, 4GB 7.99, 6GB 10.99, 8GB 13.99, 12GB 17.99
    const minelabBase = ram <= 2 ? 4.99 : ram <= 4 ? 7.99 : ram <= 6 ? 10.99 : ram <= 8 ? 13.99 : 17.99;
    return {
      aternosCost: aternosBase,
      minelabCost: minelabBase,
      savings: Math.max(0, aternosBase - minelabBase),
    };
  }, [ram]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 my-12">
      <h3 className="text-2xl font-bold mb-2 text-white">Calculadora rápida — ¿cuánto te ahorras?</h3>
      <p className="text-white/60 mb-6">Ajusta RAM y jugadores. Comparativa entre el plan equivalente de Aternos premium y MineLab.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <label className="block">
          <span className="text-sm text-white/70 mb-2 block">RAM ({ram} GB)</span>
          <input
            type="range" min="2" max="12" step="1" value={ram}
            onChange={(e) => setRam(Number(e.target.value))}
            className="w-full accent-accent-green"
          />
        </label>
        <label className="block">
          <span className="text-sm text-white/70 mb-2 block">Jugadores simultáneos ({players})</span>
          <input
            type="range" min="2" max="50" step="1" value={players}
            onChange={(e) => setPlayers(Number(e.target.value))}
            className="w-full accent-accent-green"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8 text-center">
        <div className="rounded-xl border border-white/10 p-5">
          <p className="text-xs uppercase text-white/50 mb-1">Aternos premium</p>
          <p className="text-3xl font-bold text-white">{aternosCost.toFixed(2)}€</p>
          <p className="text-xs text-white/40">/mes</p>
        </div>
        <div className="rounded-xl border border-accent-green/40 p-5 bg-accent-green/5">
          <p className="text-xs uppercase text-accent-green mb-1">MineLab</p>
          <p className="text-3xl font-bold text-white">{minelabCost.toFixed(2)}€</p>
          <p className="text-xs text-white/40">/mes</p>
        </div>
        <div className="rounded-xl border border-white/10 p-5">
          <p className="text-xs uppercase text-white/50 mb-1">Ahorro anual</p>
          <p className="text-3xl font-bold text-accent-green">{(savings * 12).toFixed(0)}€</p>
          <p className="text-xs text-white/40">/año</p>
        </div>
      </div>

      <p className="text-center text-xs text-white/40 mt-6">
        Precios orientativos. Los planes oficiales actualizados están en{' '}
        <Link to="/#pricing" className="underline hover:text-accent-green">/#pricing</Link>.
      </p>
    </div>
  );
}

export default function AternosVsMinelab() {
  useDocumentMeta({
    title: 'MineLab vs Aternos: comparativa completa 2026 | Alternativa premium española',
    description: 'Comparativa MineLab vs Aternos: RAM, plugins, asistente IA, sin cola, sin anuncios. Calculadora de ahorro y guía de migración. Desde 4,99 €/mes.',
    canonical: 'https://minelab.gg/aternos-vs-minelab',
    og: {
      type: 'article',
      site_name: 'MineLab',
      locale: 'es_ES',
      title: 'MineLab vs Aternos — comparativa 2026',
      description: 'Tabla detallada, calculadora de ahorro y guía de migración. Desde 4,99 €/mes.',
      url: 'https://minelab.gg/aternos-vs-minelab',
      image: 'https://minelab.gg/og/aternos-vs.png',
    },
    twitter: { card: 'summary_large_image', title: 'MineLab vs Aternos — comparativa 2026', description: 'Tabla detallada y calculadora de ahorro.', image: 'https://minelab.gg/og/aternos-vs.png' },
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'MineLab — Hosting Minecraft con IA',
        description: 'Alternativa premium a Aternos: agente IA, sin cola, plugins ilimitados, desde 4,99€/mes',
        image: 'https://minelab.gg/og/aternos-vs.png',
        brand: { '@type': 'Brand', name: 'MineLab' },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'EUR',
          lowPrice: '4.99',
          highPrice: '17.99',
          offerCount: 5,
          availability: 'https://schema.org/InStock',
          url: 'https://minelab.gg/#pricing'
        },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '127' }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'MineLab', item: 'https://minelab.gg/' },
          { '@type': 'ListItem', position: 2, name: 'MineLab vs Aternos', item: 'https://minelab.gg/aternos-vs-minelab' }
        ]
      }
    ]
  });

  return (
    <SeoLayout>
      <article className="container mx-auto px-6 max-w-5xl pt-16 pb-24">
        {/* Hero */}
        <header className="text-center max-w-3xl mx-auto mb-16">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-white/70 mb-6">
            <Sparkles size={12} className="text-accent-green" /> Comparativa actualizada · Abril 2026
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            MineLab vs Aternos — <span className="bg-gradient-to-r from-accent-green to-accent-violet bg-clip-text text-transparent">comparativa completa 2026</span>
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            ¿Merece la pena pagar por hosting de Minecraft cuando Aternos es gratis? Spoiler: sí, si quieres jugar sin cola, sin anuncios y con plugins ilimitados. Te lo demostramos punto por punto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=aternos-vs" className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-green px-7 py-3 text-sm font-semibold text-[#0B1220] hover:bg-accent-green/90 transition-colors">
              Crear servidor desde 4,99 €/mes <ArrowRight size={16} />
            </Link>
            <Link to="/migrar-servidor-aternos" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors">
              Cómo migrar de Aternos
            </Link>
          </div>
        </header>

        {/* Why people search alternatives */}
        <section className="my-20">
          <h2 className="text-3xl font-bold text-white mb-6">Por qué tanta gente busca alternativas a Aternos</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Aternos es perfecto para empezar: ofrece servidores gratuitos sin tarjeta. El problema aparece cuando tu comunidad crece. Estas son las cinco quejas más comunes que leemos a diario en Reddit, Discord y TikTok:
          </p>
          <ul className="grid md:grid-cols-2 gap-4 text-white/80">
            <li className="rounded-xl border border-white/10 p-5 bg-white/[0.02]">
              <p className="font-semibold text-white mb-1">⏳ Cola de espera (waiting room)</p>
              <p className="text-sm text-white/60">En momentos pico esperas 5-15 minutos para entrar a tu propio servidor.</p>
            </li>
            <li className="rounded-xl border border-white/10 p-5 bg-white/[0.02]">
              <p className="font-semibold text-white mb-1">😴 Apagado por inactividad</p>
              <p className="text-sm text-white/60">Si nadie juega 5 minutos se apaga, y al volver tienes que arrancarlo manualmente y volver a esperar.</p>
            </li>
            <li className="rounded-xl border border-white/10 p-5 bg-white/[0.02]">
              <p className="font-semibold text-white mb-1">🚫 Plugins limitados</p>
              <p className="text-sm text-white/60">No puedes subir plugins .jar arbitrarios; sólo los que están en su catálogo aprobado.</p>
            </li>
            <li className="rounded-xl border border-white/10 p-5 bg-white/[0.02]">
              <p className="font-semibold text-white mb-1">📺 Anuncios obligatorios</p>
              <p className="text-sm text-white/60">Cada arranque te muestra un vídeo publicitario que no se puede saltar.</p>
            </li>
            <li className="rounded-xl border border-white/10 p-5 bg-white/[0.02] md:col-span-2">
              <p className="font-semibold text-white mb-1">🔒 Sin SFTP en plan gratuito</p>
              <p className="text-sm text-white/60">No puedes subir mundos pesados, importar de single-player o gestionar configs vía cliente FTP estándar.</p>
            </li>
          </ul>
        </section>

        {/* Comparison table */}
        <section className="my-20">
          <h2 className="text-3xl font-bold text-white mb-6">Tabla comparativa detallada</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/80">
                <tr>
                  <th className="px-5 py-4 font-semibold">Característica</th>
                  <th className="px-5 py-4 font-semibold text-center">Aternos free</th>
                  <th className="px-5 py-4 font-semibold text-center">Aternos premium</th>
                  <th className="px-5 py-4 font-semibold text-center text-accent-green">MineLab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tableRows.map((row) => (
                  <tr key={row.label} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 text-white/80">{row.label}</td>
                    <td className="px-5 py-4 text-center"><Cell value={row.free} /></td>
                    <td className="px-5 py-4 text-center"><Cell value={row.premium} /></td>
                    <td className="px-5 py-4 text-center"><Cell value={row.minelab} /></td>
                  </tr>
                ))}
                <tr className="bg-white/5">
                  <td className="px-5 py-4 font-semibold text-white">Precio (4 GB / mes)</td>
                  <td className="px-5 py-4 text-center font-semibold text-white/70">0 €</td>
                  <td className="px-5 py-4 text-center font-semibold text-white/70">≈ 12,99 €</td>
                  <td className="px-5 py-4 text-center font-semibold text-accent-green">7,99 €</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-white/40 mt-3 text-center">Datos recopilados desde aternos.org y minelab.gg el 25/04/2026. Precios pueden variar.</p>
        </section>

        {/* IA differentiator */}
        <section className="my-20">
          <h2 className="text-3xl font-bold text-white mb-6">La diferencia clave — el agente IA configurador</h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Aternos premium es básicamente un panel donde tienes que saber qué hacer: subir el .jar correcto, configurar <code className="text-accent-green bg-white/5 px-1 rounded">server.properties</code>, leer logs cuando crashea, buscar plugins compatibles. <strong className="text-white">MineLab incluye un asistente IA que hace todo eso por ti</strong>.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-white/10 p-6 bg-white/[0.02]">
              <MessageSquare size={20} className="text-accent-green mb-3" />
              <h3 className="font-semibold text-white mb-2">Instalar plugins por chat</h3>
              <p className="text-sm text-white/60">Escribe "instala EssentialsX y LuckPerms con permisos básicos" y el agente busca, descarga, instala dependencias y configura.</p>
            </div>
            <div className="rounded-xl border border-white/10 p-6 bg-white/[0.02]">
              <Wrench size={20} className="text-accent-violet mb-3" />
              <h3 className="font-semibold text-white mb-2">Diagnóstico de crashes</h3>
              <p className="text-sm text-white/60">Si el servidor crashea, el agente lee el log, identifica el mod o plugin culpable y te propone fix automático.</p>
            </div>
            <div className="rounded-xl border border-white/10 p-6 bg-white/[0.02]">
              <Zap size={20} className="text-accent-blue mb-3" />
              <h3 className="font-semibold text-white mb-2">Cambios de versión sin perder mundo</h3>
              <p className="text-sm text-white/60">"Pasa de Paper 1.21.4 a Fabric 1.21.5". El agente hace backup, cambia software y arranca verificando compatibilidad.</p>
            </div>
          </div>
        </section>

        <SavingsCalculator />

        {/* Migration teaser */}
        <section className="my-20">
          <h2 className="text-3xl font-bold text-white mb-6">¿Convencido? Así de fácil es migrar tu servidor</h2>
          <ol className="space-y-3 text-white/80 mb-6">
            <li><span className="text-accent-green font-bold mr-2">1.</span> Exporta tu world desde Aternos (Backups → Download).</li>
            <li><span className="text-accent-green font-bold mr-2">2.</span> Crea un servidor MineLab vacío con la misma versión.</li>
            <li><span className="text-accent-green font-bold mr-2">3.</span> Sube el world por SFTP.</li>
            <li><span className="text-accent-green font-bold mr-2">4.</span> Pídele al agente IA que instale tus plugins. Listo.</li>
          </ol>
          <Link to="/migrar-servidor-aternos" className="inline-flex items-center gap-2 text-accent-green hover:underline font-medium">
            Tutorial completo paso a paso <ArrowRight size={14} />
          </Link>
        </section>

        {/* FAQ */}
        <section className="my-20">
          <h2 className="text-3xl font-bold text-white mb-6">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <summary className="cursor-pointer font-semibold text-white flex items-center justify-between">
                  {item.q}
                  <span className="text-white/40 text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-white/70 mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="my-20 rounded-2xl border border-accent-green/30 bg-gradient-to-br from-accent-green/10 via-transparent to-accent-violet/10 p-10 text-center">
          <Shield size={32} className="text-accent-green mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Prueba MineLab desde 4,99 €/mes</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">Sin compromiso, cancelas cuando quieras y te llevas tu mundo. Más barato que Aternos premium en RAM equivalente.</p>
          <Link to="/#pricing?utm_source=seo&utm_medium=organic&utm_campaign=aternos-vs-cta" className="inline-flex items-center gap-2 rounded-full bg-accent-green px-8 py-3 text-base font-semibold text-[#0B1220] hover:bg-accent-green/90 transition-colors">
            Ver planes y crear servidor <ArrowRight size={16} />
          </Link>
        </section>
      </article>
    </SeoLayout>
  );
}
