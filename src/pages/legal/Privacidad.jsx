import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import SeoLayout from '../../components/seo/SeoLayout';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

const SECTIONS = [
  { id: '1-responsable', title: '1. Responsable del tratamiento' },
  { id: '2-datos', title: '2. Qué datos recogemos' },
  { id: '3-finalidad', title: '3. Finalidad y base legal' },
  { id: '4-terceros', title: '4. Proveedores y terceros' },
  { id: '5-cookies', title: '5. Cookies y analítica' },
  { id: '6-ia', title: '6. Tratamiento por el asistente IA' },
  { id: '7-conservacion', title: '7. Plazos de conservación' },
  { id: '8-derechos', title: '8. Tus derechos (RGPD)' },
  { id: '9-seguridad', title: '9. Medidas de seguridad' },
  { id: '10-menores', title: '10. Menores de edad' },
  { id: '11-cambios', title: '11. Cambios en esta política' },
  { id: '12-contacto', title: '12. Contacto' },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://minelab.gg/' },
    { '@type': 'ListItem', position: 2, name: 'Política de Privacidad', item: 'https://minelab.gg/privacidad' },
  ],
};

export default function Privacidad() {
  useDocumentMeta({
    title: 'Política de Privacidad | MineLab',
    description: 'Cómo MineLab trata tus datos personales: qué recogemos, con quién lo compartimos (Stripe, Supabase, Ollama), tus derechos RGPD y medidas de seguridad.',
    canonical: 'https://minelab.gg/privacidad',
    og: { type: 'article', title: 'Política de Privacidad · MineLab', url: 'https://minelab.gg/privacidad' },
    jsonLd: [breadcrumbJsonLd],
  });

  return (
    <SeoLayout>
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full bg-accent-green/10 blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 max-w-6xl py-16 md:py-20 relative">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-bold text-accent-green mb-6">
            <Shield size={14} /> Documento legal · v1.0
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.95] uppercase">
            Política de<br />privacidad.
          </h1>
          <p className="mt-6 text-white/55 text-sm">Última actualización: 11 de mayo de 2026</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-10">
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

            <article className="lg:col-span-9 text-white/75 leading-relaxed space-y-12 text-[15px]">
              <section id="1-responsable" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">1. Responsable del tratamiento</h2>
                <p>El responsable del tratamiento de tus datos personales es <strong className="text-white">Jan Places Lloret</strong>, en su condición de titular del proyecto MineLab. Dirección de contacto: <strong className="text-white">janplaces@minelab.gg</strong>. Domicilio fiscal: España.</p>
              </section>

              <section id="2-datos" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">2. Qué datos recogemos</h2>
                <ul className="list-disc list-inside space-y-2 text-white/65">
                  <li><strong className="text-white">Identificativos</strong>: email, nombre (vía Google OAuth o registro manual).</li>
                  <li><strong className="text-white">Facturación</strong>: dirección y datos de pago gestionados por Stripe (MineLab no almacena tarjetas).</li>
                  <li><strong className="text-white">Técnicos</strong>: IP de acceso, navegador, logs del servidor Minecraft que contratas.</li>
                  <li><strong className="text-white">Interacción</strong>: mensajes que envías al asistente IA para gestionar tu servidor.</li>
                </ul>
              </section>

              <section id="3-finalidad" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">3. Finalidad y base legal</h2>
                <p>Tratamos tus datos con las siguientes finalidades:</p>
                <ul className="list-disc list-inside space-y-2 mt-3 text-white/65">
                  <li>Prestar el servicio contratado <em>(base legal: ejecución del contrato)</em>.</li>
                  <li>Facturación y cumplimiento de obligaciones fiscales <em>(obligación legal)</em>.</li>
                  <li>Soporte técnico vía Discord/email <em>(ejecución del contrato)</em>.</li>
                  <li>Mejora del servicio y detección de fraude <em>(interés legítimo)</em>.</li>
                  <li>Comunicaciones sobre novedades <em>(consentimiento, revocable en cualquier momento)</em>.</li>
                </ul>
              </section>

              <section id="4-terceros" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">4. Proveedores y terceros</h2>
                <p>Para prestar el servicio compartimos datos mínimos con los siguientes encargados del tratamiento:</p>
                <ul className="list-disc list-inside space-y-2 mt-3 text-white/65">
                  <li><strong className="text-white">Stripe</strong> (Irlanda/EEUU) — procesamiento de pagos. <a href="https://stripe.com/es/privacy" target="_blank" rel="noopener" className="text-accent-green hover:underline">Política</a></li>
                  <li><strong className="text-white">Supabase</strong> (EEUU, datos en EU-West) — base de datos y autenticación. <a href="https://supabase.com/privacy" target="_blank" rel="noopener" className="text-accent-green hover:underline">Política</a></li>
                  <li><strong className="text-white">Hetzner Online</strong> (Alemania) — datacenter donde corre tu servidor MC. <a href="https://www.hetzner.com/legal/privacy-policy" target="_blank" rel="noopener" className="text-accent-green hover:underline">Política</a></li>
                  <li><strong className="text-white">Cloudflare</strong> (EEUU) — CDN, protección DDoS y resolución DNS. <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener" className="text-accent-green hover:underline">Política</a></li>
                  <li><strong className="text-white">Resend</strong> (EEUU) — envío de emails transaccionales.</li>
                  <li><strong className="text-white">Ollama Cloud</strong> (EEUU) — proveedor del modelo IA. Los mensajes se procesan en su infraestructura. <a href="https://ollama.com/privacy" target="_blank" rel="noopener" className="text-accent-green hover:underline">Política</a></li>
                </ul>
                <p className="mt-4">No vendemos ni compartimos tus datos con anunciantes, brokers de datos ni terceros con fines comerciales ajenos al servicio.</p>
              </section>

              <section id="5-cookies" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">5. Cookies y analítica</h2>
                <p>Usamos cookies y localStorage estrictamente necesarios para la sesión (autenticación, preferencias) y un beacon analítico propio <strong>sin cookies de terceros, sin Google Analytics</strong>. El identificador anónimo de visitante (<code className="bg-white/10 px-1.5 py-0.5 rounded">ml_vid</code>) vive solo en tu navegador y no se cruza con datos personales.</p>
                <p className="mt-3">Puedes rechazar cookies no esenciales desde el banner que aparece la primera vez que visitas el sitio.</p>
              </section>

              <section id="6-ia" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">6. Tratamiento por el asistente IA</h2>
                <p>Cuando hablas con el asistente IA del panel, el mensaje se envía a Ollama Cloud junto con contexto técnico mínimo de tu servidor (versión, plugins instalados, últimas líneas del log). <strong className="text-white">No enviamos tu nombre, email ni datos de facturación al modelo de IA</strong>. Las conversaciones quedan registradas en nuestra base de datos para soporte, no se publican ni se usan para entrenar modelos.</p>
              </section>

              <section id="7-conservacion" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">7. Plazos de conservación</h2>
                <ul className="list-disc list-inside space-y-2 text-white/65">
                  <li>Datos de cuenta: mientras el servicio esté activo + 14 días de gracia tras cancelación.</li>
                  <li>Facturación: 6 años (obligación fiscal española).</li>
                  <li>Logs técnicos del servidor: 7 días en caliente, 30 días en backup off-site.</li>
                  <li>Conversaciones con la IA: 90 días.</li>
                </ul>
              </section>

              <section id="8-derechos" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">8. Tus derechos (RGPD)</h2>
                <p>Tienes derecho a: acceso, rectificación, supresión, oposición, limitación del tratamiento, portabilidad y a no ser objeto de decisiones automatizadas. Para ejercerlos, escríbenos a <strong className="text-white">janplaces@minelab.gg</strong> con el asunto "RGPD". Responderemos en un plazo máximo de 30 días.</p>
                <p className="mt-3">Si consideras que el tratamiento no se ajusta a derecho, puedes reclamar ante la <a href="https://www.aepd.es/" target="_blank" rel="noopener" className="text-accent-green hover:underline">Agencia Española de Protección de Datos</a>.</p>
              </section>

              <section id="9-seguridad" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">9. Medidas de seguridad</h2>
                <p>Aplicamos: cifrado TLS 1.3 en tránsito, contraseñas hasheadas (bcrypt vía Supabase Auth), aislamiento por servidor, backups cifrados y rotación periódica de claves de API. Acceso a producción restringido al fundador con autenticación de dos factores.</p>
              </section>

              <section id="10-menores" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">10. Menores de edad</h2>
                <p>El servicio se dirige a mayores de 16 años. Si descubrimos una cuenta de un menor sin consentimiento parental, la suspenderemos y eliminaremos sus datos.</p>
              </section>

              <section id="11-cambios" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">11. Cambios en esta política</h2>
                <p>Notificaremos los cambios sustanciales por email con al menos 30 días de antelación. La versión vigente siempre se publica en esta misma URL con su fecha de última actualización.</p>
              </section>

              <section id="12-contacto" className="scroll-mt-32">
                <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight mb-4">12. Contacto</h2>
                <p>Email: <strong className="text-white">janplaces@minelab.gg</strong> · Discord: <a href="https://discord.gg/wUJZkQxAQk" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">discord.gg/wUJZkQxAQk</a></p>
              </section>

              <div className="pt-8 border-t border-white/10 flex flex-wrap gap-3">
                <Link to="/terminos" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-colors">Términos <ArrowRight size={12} /></Link>
                <Link to="/reembolsos" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-colors">Reembolsos <ArrowRight size={12} /></Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </SeoLayout>
  );
}
