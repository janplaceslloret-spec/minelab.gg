import React from 'react';
import { Link } from 'react-router-dom';
import { Server, Sparkles, Code2, Users, MessageCircle, ArrowRight, Cpu, Shield, Zap, Globe, Bot, HardDrive } from 'lucide-react';
import SeoLayout from '../components/seo/SeoLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

// Stats reales y verificables (no infladas)
const STATS = [
  { value: '2025', label: 'Operando desde' },
  { value: '24/7', label: 'IA activa' },
  { value: '~30 ms', label: 'Latencia España → Núremberg' },
  { value: '99.9%', label: 'Uptime últimos 30 días' },
];

const VALUES = [
  {
    icon: <Bot size={22} />,
    title: 'IA que hace, no que cobra',
    text: 'El asistente IA está incluido en todos los planes. Instala mods, edita configs, soluciona crashes y migra versiones por chat — no es un upsell de €30/mes como en otros hostings.',
  },
  {
    icon: <Shield size={22} />,
    title: 'Sin permanencia, sin trucos',
    text: 'Cancelas cuando quieras desde el panel de Stripe. Sin penalizaciones, sin "tienes que llamarnos", sin contratos anuales escondidos. 48 h de garantía de devolución total.',
  },
  {
    icon: <Code2 size={22} />,
    title: 'Construido por developer, no por marketing',
    text: 'MineLab es un proyecto bootstrap llevado por una persona técnica, no una franquicia. Cada bug se documenta, cada cambio sube al changelog público. Lo que prometemos se cumple.',
  },
  {
    icon: <Globe size={22} />,
    title: 'Datacenter europeo, soporte en español',
    text: 'Servidores en Hetzner Falkenstein (Alemania) — ~30 ms desde España, 50 ms desde Latam costera. Soporte por Discord en español, no chatbots ni tickets de 48 h.',
  },
];

const STACK = [
  { area: 'Hardware', value: 'Ryzen 9 9950X / 128 GB ECC / NVMe / Falkenstein DE' },
  { area: 'Frontend', value: 'React 18 + Vite + Tailwind CSS' },
  { area: 'Backend', value: 'Node.js + Express en VPS dedicado' },
  { area: 'Base de datos', value: 'Supabase (Postgres 15)' },
  { area: 'IA', value: 'Ollama Cloud (modelo ministral-3:14b)' },
  { area: 'Pagos', value: 'Stripe — SEPA / Visa / Mastercard / PayPal' },
];

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://minelab.gg/#org',
  name: 'MineLab',
  legalName: 'MineLab Hosting',
  alternateName: 'MineLab.gg',
  url: 'https://minelab.gg',
  logo: 'https://minelab.gg/logo.png',
  description:
    'Proveedor español de hosting Minecraft con asistente IA integrado. Servidores Java en datacenter alemán, planes desde 7,99 €/mes, sin permanencia. Alternativa profesional a Aternos, Apex Hosting, Shockbyte y BisectHosting para creadores hispanohablantes.',
  foundingDate: '2025',
  founder: {
    '@type': 'Person',
    name: 'Jan Places Lloret',
    jobTitle: 'Fundador y CEO',
    nationality: 'ES',
    url: 'https://minelab.gg/sobre-nosotros',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'ES',
    addressRegion: 'Comunidad Valenciana',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'janplaces@minelab.gg',
      areaServed: ['ES', 'MX', 'AR', 'CO', 'CL', 'PE'],
      availableLanguage: ['Spanish', 'English'],
    },
  ],
  sameAs: [
    'https://discord.gg/wUJZkQxAQk',
    'https://www.tiktok.com/@minelab.gg',
    'https://github.com/janplaceslloret-spec',
  ],
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Jan Places Lloret',
  jobTitle: 'Fundador y CEO de MineLab',
  description:
    'Desarrollador y fundador de MineLab, hosting Minecraft con asistente IA. Trabaja en solitario el código, la infraestructura y el soporte.',
  url: 'https://minelab.gg/sobre-nosotros',
  nationality: 'ES',
  worksFor: { '@id': 'https://minelab.gg/#org' },
  sameAs: ['https://github.com/janplaceslloret-spec'],
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://minelab.gg/' },
    { '@type': 'ListItem', position: 2, name: 'Sobre nosotros', item: 'https://minelab.gg/sobre-nosotros' },
  ],
};

export default function SobreNosotros() {
  useDocumentMeta({
    title: 'Sobre MineLab — Hosting Minecraft español fundado en 2025 | MineLab',
    description:
      'MineLab es un hosting Minecraft español fundado en 2025 por Jan Places Lloret. Asistente IA incluido, datacenter en Alemania, sin permanencia, desde 7,99 €/mes. Alternativa a Aternos y Apex Hosting.',
    canonical: 'https://minelab.gg/sobre-nosotros',
    og: {
      type: 'website',
      title: 'Sobre MineLab — el hosting Minecraft con IA hecho en España',
      description: 'Bootstrap español, datacenter europeo, asistente IA incluido y soporte humano en Discord. Operativo desde 2025.',
      url: 'https://minelab.gg/sobre-nosotros',
      image: 'https://minelab.gg/og-image.png',
    },
    twitter: { card: 'summary_large_image', title: 'Sobre MineLab', description: 'Hosting Minecraft español con IA · operativo desde 2025.' },
    jsonLd: [orgJsonLd, personJsonLd, breadcrumbJsonLd],
  });

  return (
    <SeoLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full bg-accent-green/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-32 w-[600px] h-[600px] rounded-full bg-accent-violet/10 blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl py-16 md:py-24 relative">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-bold text-accent-green mb-6">
            <Sparkles size={14} /> Quiénes somos
          </p>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-white leading-[0.95] uppercase max-w-5xl">
            Hosting Minecraft<br className="hidden md:block" />
            con <span className="bg-accent-green text-[#0B1220] px-3 md:px-4 rounded-md">IA real</span>,<br className="hidden md:block" />
            hecho en España.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-white/70 leading-relaxed max-w-3xl">
            <strong className="text-white">MineLab</strong> es un proveedor español de hosting Minecraft fundado en{' '}
            <strong className="text-white">2025</strong> por <strong className="text-white">Jan Places Lloret</strong>. Operamos servidores Java
            en un datacenter alemán de alto rendimiento, con un asistente IA integrado que instala mods y plugins por chat, diagnostica crashes y
            migra versiones automáticamente. Planes desde <strong className="text-white">7,99 €/mes</strong>, sin permanencia. Alternativa
            profesional a <em>Aternos</em>, <em>Apex Hosting</em>, <em>Shockbyte</em> y <em>BisectHosting</em> para la comunidad hispanohablante.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-[#0a0e17] p-5">
                <div className="font-heading text-3xl md:text-4xl font-black text-white tracking-tight">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-white/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNDADOR */}
      <section className="py-16 md:py-24 bg-[#080B14] border-t border-white/5">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-accent-violet mb-4">El fundador</p>
              <h2 className="font-heading text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.05] uppercase">
                Jan Places<br />Lloret
              </h2>
              <p className="text-white/55 text-sm mt-3 uppercase tracking-wider font-bold">Fundador · Developer · Soporte 24/7</p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-accent-green/5 to-transparent p-6">
                <p className="text-white/80 leading-relaxed text-base italic">
                  "Empecé MineLab porque estaba harto de pagar 30 € por hostings lentos con paneles del 2010. Lo construí con dos ideas: que el
                  asistente IA esté incluido y de verdad sirva, y que cualquier persona pueda crear un servidor Minecraft en 30 segundos sin
                  saber qué es un .jar. Lo llevo solo: el código, los servidores y el soporte. Si me escribes por Discord, te respondo yo."
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-green to-accent-violet flex items-center justify-center text-[#0B1220] font-black text-sm">JL</div>
                  <div>
                    <div className="text-white font-bold text-sm">Jan Places Lloret</div>
                    <div className="text-white/50 text-xs">Castellón, España</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {VALUES.map((v) => (
                <div key={v.title} className="rounded-2xl border border-white/10 bg-[#0a0e17] p-6 hover:border-accent-green/40 transition-colors">
                  <div className="w-11 h-11 rounded-lg bg-accent-green/10 border border-accent-green/30 text-accent-green flex items-center justify-center mb-4">
                    {v.icon}
                  </div>
                  <h3 className="font-heading font-black text-white text-lg uppercase tracking-tight mb-2">{v.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STACK TÉCNICO */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-accent-blue mb-4">Transparencia técnica</p>
            <h2 className="font-heading text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.05] uppercase">
              Sobre qué corre<br />tu servidor.
            </h2>
            <p className="text-white/65 mt-6 text-lg leading-relaxed">
              No escondemos la infraestructura. Esto es exactamente lo que ejecuta tu servidor de Minecraft.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-[#0a0e17] overflow-hidden">
            {STACK.map((row, i) => (
              <div
                key={row.area}
                className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-8 p-5 md:p-6 ${
                  i < STACK.length - 1 ? 'border-b border-white/5' : ''
                } hover:bg-white/[0.02] transition-colors`}
              >
                <div className="md:w-48 text-xs uppercase tracking-[0.2em] font-bold text-accent-green flex items-center gap-2">
                  {i === 0 && <Cpu size={14} />}
                  {i === 1 && <Code2 size={14} />}
                  {i === 2 && <Server size={14} />}
                  {i === 3 && <HardDrive size={14} />}
                  {i === 4 && <Bot size={14} />}
                  {i === 5 && <Zap size={14} />}
                  {row.area}
                </div>
                <div className="text-white/85 font-mono text-sm">{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMUNIDAD */}
      <section className="py-16 md:py-24 bg-[#080B14] border-t border-white/5">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-accent-green mb-4">Nuestra comunidad</p>
              <h2 className="font-heading text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.05] uppercase mb-6">
                +300 personas<br />construyendo<br />con nosotros.
              </h2>
              <p className="text-white/65 text-base leading-relaxed mb-8">
                MineLab crece con feedback de gente real. El Discord es donde se reportan bugs, se piden features y se cierra el
                changelog público. Cada cliente activo tiene voz directa con el equipo.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://discord.gg/wUJZkQxAQk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-xl bg-accent-green px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#0B1220] hover:bg-accent-green/90 transition-colors"
                >
                  <MessageCircle size={16} /> Únete al Discord
                </a>
                <Link
                  to="/changelog"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                >
                  Ver changelog público <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Users size={20} />, title: 'Discord activo', value: '+300' },
                { icon: <Server size={20} />, title: 'Servidores running', value: '4 / 27' },
                { icon: <Sparkles size={20} />, title: 'Releases públicas', value: '20+' },
                { icon: <Shield size={20} />, title: 'Datacenter', value: 'Alemania' },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-white/10 bg-[#0a0e17] p-5">
                  <div className="w-9 h-9 rounded-lg bg-accent-violet/10 border border-accent-violet/30 text-accent-violet flex items-center justify-center mb-3">
                    {c.icon}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-white/50">{c.title}</div>
                  <div className="font-heading text-2xl font-black text-white mt-1">{c.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="font-heading text-4xl md:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
            Crea tu servidor<br />
            <span className="bg-accent-green text-[#0B1220] px-3 md:px-4 rounded-md">en 30 segundos.</span>
          </h2>
          <p className="text-white/65 text-lg mt-6 max-w-2xl mx-auto">
            Sin tarjeta para empezar a probar. 48 h de garantía si pagas. Cancela cuando quieras.
          </p>
          <Link
            to="/configurar?plan=6gb&billing=monthly"
            className="inline-flex items-center gap-3 mt-10 rounded-xl bg-accent-green px-8 py-4 text-base font-bold uppercase tracking-wider text-[#0B1220] hover:bg-accent-green/90 transition-all hover:translate-x-0.5"
          >
            Empezar ahora <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </SeoLayout>
  );
}
