import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ArrowRight, Check, X } from 'lucide-react';
import SeoLayout from '../../components/seo/SeoLayout';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://minelab.gg/' },
    { '@type': 'ListItem', position: 2, name: 'Política de Reembolsos', item: 'https://minelab.gg/reembolsos' },
  ],
};

const ELIGIBLE = [
  'Solicitas el reembolso en las primeras 48 horas tras tu primer pago.',
  'El rendimiento del servidor no cumple lo prometido (lag persistente, downtime > 24 h imputable a MineLab).',
  'No has podido conectarte al servidor por un fallo nuestro y nuestro equipo no lo ha solucionado en 24 h.',
  'Has cambiado de opinión durante las primeras 48 h (derecho de desistimiento, sin necesidad de motivo).',
];

const NOT_ELIGIBLE = [
  'Reembolsos solicitados después de las 48 horas del primer pago.',
  'Cancelaciones de renovaciones mensuales o anuales posteriores al periodo inicial (puedes cancelar la próxima renovación, pero no se reembolsa el periodo ya pagado).',
  'Problemas causados por configuraciones del propio cliente (mods incompatibles, mundo corrupto, plugins de terceros).',
  'Suspensiones por violación de los Términos de Servicio (uso prohibido, criptominado, DDoS, contenido ilegal).',
  'Migrados desde otros hostings cuyo problema preexistente no se resuelve en MineLab.',
];

export default function Reembolsos() {
  useDocumentMeta({
    title: 'Política de Reembolsos · 48 h garantizadas | MineLab',
    description: 'Garantía de devolución sin preguntas de 48 horas en todos los planes de MineLab. Casos cubiertos, casos no cubiertos, plazo de procesamiento.',
    canonical: 'https://minelab.gg/reembolsos',
    og: { type: 'article', title: 'Reembolsos · 48 h garantizadas · MineLab', url: 'https://minelab.gg/reembolsos' },
    jsonLd: [breadcrumbJsonLd],
  });

  return (
    <SeoLayout>
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[500px] h-[500px] rounded-full bg-accent-green/10 blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 max-w-6xl py-16 md:py-20 relative">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-bold text-accent-green mb-6">
            <CreditCard size={14} /> Garantía 48 horas
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.95] uppercase">
            Política de<br />
            <span className="bg-accent-green text-[#0B1220] px-3 md:px-4 rounded-md">reembolsos.</span>
          </h1>
          <p className="mt-8 text-lg text-white/70 leading-relaxed max-w-3xl">
            Si MineLab no es lo que esperabas, te devolvemos el dinero. Sin preguntas, sin "déjanos demostrarte por qué deberías quedarte".
            Solo tienes que escribir un email en las primeras 48 horas tras tu primera factura.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-accent-green/30 bg-gradient-to-br from-accent-green/5 to-transparent p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-accent-green/15 border border-accent-green/40 text-accent-green flex items-center justify-center">
                  <Check size={20} />
                </div>
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight">Cubierto</h2>
              </div>
              <ul className="space-y-3 text-white/80 text-[15px] leading-relaxed">
                {ELIGIBLE.map((t) => (
                  <li key={t} className="flex gap-3">
                    <Check size={18} className="text-accent-green flex-shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0a0e17] p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
                  <X size={20} />
                </div>
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight">No cubierto</h2>
              </div>
              <ul className="space-y-3 text-white/65 text-[15px] leading-relaxed">
                {NOT_ELIGIBLE.map((t) => (
                  <li key={t} className="flex gap-3">
                    <X size={16} className="text-red-400 flex-shrink-0 mt-1" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-[#0a0e17] p-7 md:p-10">
            <h2 className="font-heading text-3xl font-black text-white uppercase tracking-tight mb-6">Cómo solicitar el reembolso</h2>
            <ol className="space-y-5 text-white/80">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-green text-[#0B1220] font-black flex items-center justify-center text-sm">1</span>
                <div>
                  <strong className="text-white block">Envíanos un email a janplaces@minelab.gg</strong>
                  <span className="text-white/65 text-sm">Asunto: "Reembolso". Incluye el email con el que pagaste y, si quieres, el motivo.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-green text-[#0B1220] font-black flex items-center justify-center text-sm">2</span>
                <div>
                  <strong className="text-white block">Respondemos en menos de 24 horas</strong>
                  <span className="text-white/65 text-sm">Confirmamos la solicitud y procesamos el reembolso a través de Stripe.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-green text-[#0B1220] font-black flex items-center justify-center text-sm">3</span>
                <div>
                  <strong className="text-white block">Tu banco lo abona en 5–10 días hábiles</strong>
                  <span className="text-white/65 text-sm">El dinero vuelve al mismo método de pago original. Stripe controla los plazos según tu entidad.</span>
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-4 text-center">
            {[
              { v: '48 h', l: 'Garantía total' },
              { v: '< 24 h', l: 'Respuesta media' },
              { v: '5–10 días', l: 'Plazo del banco' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-white/10 bg-[#0a0e17] py-6">
                <div className="font-heading text-3xl font-black text-accent-green">{s.v}</div>
                <div className="text-xs uppercase tracking-wider text-white/55 mt-1">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-3">
            <Link to="/terminos" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-colors">Términos <ArrowRight size={12} /></Link>
            <Link to="/privacidad" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-colors">Privacidad <ArrowRight size={12} /></Link>
          </div>
        </div>
      </section>
    </SeoLayout>
  );
}
