import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import SeoLayout from '../../components/seo/SeoLayout';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

const SECTIONS = [
  { id: '1-aceptacion', title: '1. Aceptación de los términos' },
  { id: '2-servicio', title: '2. Descripción del servicio' },
  { id: '3-cuenta', title: '3. Cuenta y elegibilidad' },
  { id: '4-uso-aceptable', title: '4. Política de uso aceptable' },
  { id: '5-pagos', title: '5. Pagos, facturación y cancelación' },
  { id: '6-disponibilidad', title: '6. Disponibilidad y SLA' },
  { id: '7-datos', title: '7. Tus datos y backups' },
  { id: '8-prohibido', title: '8. Contenido y conductas prohibidas' },
  { id: '9-responsabilidad', title: '9. Limitación de responsabilidad' },
  { id: '10-jurisdiccion', title: '10. Ley aplicable y jurisdicción' },
  { id: '11-cambios', title: '11. Modificaciones del servicio' },
  { id: '12-contacto', title: '12. Contacto' },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://minelab.gg/' },
    { '@type': 'ListItem', position: 2, name: 'Términos de servicio', item: 'https://minelab.gg/terminos' },
  ],
};

export default function Terminos() {
  useDocumentMeta({
    title: 'Términos de Servicio | MineLab',
    description: 'Términos y condiciones de uso del servicio de hosting Minecraft MineLab. Política de uso aceptable, facturación, SLA, cancelación y jurisdicción.',
    canonical: 'https://minelab.gg/terminos',
    og: { type: 'article', title: 'Términos de Servicio · MineLab', url: 'https://minelab.gg/terminos' },
    jsonLd: [breadcrumbJsonLd],
  });

  return (
    <SeoLayout>
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full bg-accent-violet/10 blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 max-w-6xl py-16 md:py-20 relative">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-bold text-accent-violet mb-6">
            <FileText size={14} /> Documento legal · v1.0
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.95] uppercase">
            Términos de<br />servicio.
          </h1>
          <p className="mt-6 text-white/55 text-sm">Última actualización: 11 de mayo de 2026</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Sidebar nav */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-32 rounded-2xl border border-white/10 bg-[#0a0e17] p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent-green mb-4">Índice</p>
                <ul className="space-y-2">
                  {SECTIONS.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="text-white/55 hover:text-accent-green text-sm transition-colors block py-1">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Body */}
            <article className="lg:col-span-9 text-white/75 leading-relaxed space-y-12 text-[15px]">
              <section id="1-aceptacion" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">1. Aceptación de los términos</h2>
                <p>Al crear una cuenta o contratar un servicio en <strong className="text-white">minelab.gg</strong> ("MineLab", "nosotros") aceptas estos Términos de Servicio. Si no estás de acuerdo, no uses el servicio. Estos términos se aplican a todo visitante, usuario registrado y cliente de pago.</p>
              </section>

              <section id="2-servicio" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">2. Descripción del servicio</h2>
                <p>MineLab presta servicios de hosting de servidores de Minecraft Java Edition. Los planes incluyen RAM dedicada, CPU compartida en un VPS de alto rendimiento, almacenamiento NVMe, panel de control web, acceso SFTP, asistente conversacional IA y soporte humano en Discord. MineLab <strong>no está afiliado, asociado ni respaldado por Mojang Studios, Microsoft ni Hetzner</strong>.</p>
              </section>

              <section id="3-cuenta" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">3. Cuenta y elegibilidad</h2>
                <p>Debes tener al menos 16 años o el consentimiento de un tutor legal. Eres responsable de mantener seguras tus credenciales de acceso. MineLab puede suspender cuentas que detecte fraudulentas, duplicadas o usadas para evadir bans previos.</p>
              </section>

              <section id="4-uso-aceptable" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">4. Política de uso aceptable</h2>
                <p>Los recursos asignados a tu servidor (RAM, CPU, ancho de banda) no pueden usarse para:</p>
                <ul className="list-disc list-inside space-y-2 mt-3 text-white/65">
                  <li>Criptominado o cargas computacionales no relacionadas con Minecraft.</li>
                  <li>Ataques DDoS, escaneo de redes o pentesting no autorizado.</li>
                  <li>Alojamiento de software malicioso, phishing o contenido ilegal.</li>
                  <li>Plugins/mods que vulneren propiedad intelectual de terceros.</li>
                </ul>
                <p className="mt-4">MineLab se reserva el derecho de suspender cualquier servicio asociado a este tipo de actividad sin reembolso.</p>
              </section>

              <section id="5-pagos" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">5. Pagos, facturación y cancelación</h2>
                <p>Todos los pagos se procesan a través de <strong className="text-white">Stripe</strong>. Los planes son suscripciones recurrentes (mensual o anual) que se renuevan automáticamente. Puedes cancelar en cualquier momento desde el Portal de Cliente de Stripe accesible desde tu panel.</p>
                <p className="mt-4"><strong className="text-white">Garantía de 48 horas</strong>: si no estás satisfecho, solicita el reembolso en las primeras 48 h tras el primer pago y te devolvemos el importe íntegro. Ver <Link to="/reembolsos" className="text-accent-green hover:underline">Política de Reembolsos</Link>.</p>
                <p className="mt-4">Tras una cancelación, conservas acceso hasta el final del periodo facturado. Después se inicia un periodo de <strong className="text-white">14 días de gracia</strong> con tus archivos preservados, durante el cual puedes reactivar la cuenta. Pasados 14 días sin reactivación, los datos se eliminan definitivamente.</p>
              </section>

              <section id="6-disponibilidad" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">6. Disponibilidad y SLA</h2>
                <p>MineLab se esfuerza por mantener un <strong className="text-white">uptime del 99,9%</strong> mensual. Las ventanas de mantenimiento programadas se anuncian con al menos 24 h en Discord y se realizan en horario nocturno europeo. No se compensa el downtime causado por: fuerza mayor, problemas de red del datacenter ajeno a MineLab, errores en el contenido del servidor (plugins/mods/mundos) ni acciones del propio cliente.</p>
              </section>

              <section id="7-datos" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">7. Tus datos y backups</h2>
                <p>Tú eres el propietario de tu mundo, plugins, mods y configuraciones. MineLab realiza backups automáticos diarios con retención de 7 días, pero <strong>recomendamos</strong> que descargues copias locales periódicamente. Acceso SFTP disponible 24/7 desde el panel.</p>
                <p className="mt-4">La privacidad de tus datos personales se rige por nuestra <Link to="/privacidad" className="text-accent-green hover:underline">Política de Privacidad</Link>.</p>
              </section>

              <section id="8-prohibido" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">8. Contenido y conductas prohibidas</h2>
                <p>Está prohibido alojar contenido que: incite al odio, sea sexualmente explícito que involucre a menores, viole derechos de autor o promueva actividades ilegales. El uso del asistente IA para generar contenido prohibido también queda sujeto a esta cláusula.</p>
              </section>

              <section id="9-responsabilidad" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">9. Limitación de responsabilidad</h2>
                <p>MineLab presta el servicio "tal cual" y "según disponibilidad". En ningún caso la responsabilidad total de MineLab excederá el importe pagado por el cliente en los últimos 6 meses. MineLab no se hace responsable de pérdidas de mundo, plugins o configuraciones derivadas de fallos del propio cliente o de software de terceros.</p>
              </section>

              <section id="10-jurisdiccion" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">10. Ley aplicable y jurisdicción</h2>
                <p>Estos términos se rigen por la <strong className="text-white">ley española</strong>. Cualquier disputa se someterá a los juzgados de la provincia del fundador, sin perjuicio de los derechos del consumidor establecidos en la normativa europea aplicable (Reglamento UE 2017/2394 y Directiva 2011/83/UE).</p>
              </section>

              <section id="11-cambios" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">11. Modificaciones del servicio</h2>
                <p>MineLab puede modificar funcionalidades, precios o estos Términos. Los cambios sustanciales se notifican con 30 días de antelación por email y en el <Link to="/changelog" className="text-accent-green hover:underline">changelog público</Link>. Continuar usando el servicio tras la entrada en vigor de cambios implica aceptación.</p>
              </section>

              <section id="12-contacto" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">12. Contacto</h2>
                <p>Para cualquier duda sobre estos Términos, escribe a <strong className="text-white">janplaces@minelab.gg</strong> o abre un ticket en el <a href="https://discord.gg/wUJZkQxAQk" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Discord oficial</a>.</p>
              </section>

              <div className="pt-8 border-t border-white/10 flex flex-wrap gap-3">
                <Link to="/privacidad" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-colors">Privacidad <ArrowRight size={12} /></Link>
                <Link to="/reembolsos" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-colors">Reembolsos <ArrowRight size={12} /></Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </SeoLayout>
  );
}
