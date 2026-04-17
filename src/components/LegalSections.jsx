import React from 'react';

const LegalSections = () => {
  return (
    <div className="bg-[#080B14] border-t border-white/5 py-16">
      <div className="container mx-auto px-6 max-w-4xl space-y-16 text-white/70 text-sm">
        
        {/* SOPORTE */}
        <section id="support" className="scroll-mt-32">
          <h2 className="text-xl font-bold text-white mb-4">Base de Conocimiento y Soporte</h2>
          <p className="mb-4">Bienvenido a la Base de Conocimiento de MineLab. Aquí encontrarás todas las guías necesarias para exprimir al máximo nuestro asistente de IA, configurar tus plugins, y optimizar el rendimiento de tu servidor al máximo nivel. Si la IA no puede resolver tu problema, nuestro equipo de expertos está disponible 24/7.</p>
        </section>

        <section id="status" className="scroll-mt-32">
          <h2 className="text-xl font-bold text-white mb-4">ESTADO DEL PROYECTO</h2>
          <p className="mb-4">MineLab se encuentra actualmente en fase beta.</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div> Servidores actuales: Alemania (Frankfurt y Nuremberg)</li>
            <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div> Más de 300 personas en la comunidad de Discord</li>
            <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div> Más de 15 servidores activos probando la plataforma</li>
            <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div> Sistema de automatización con IA en desarrollo activo</li>
          </ul>
          <p>Estamos construyendo MineLab junto a nuestra comunidad para crear la forma más sencilla de gestionar servidores de Minecraft.</p>
        </section>

        <section id="contact" className="scroll-mt-32">
          <h2 className="text-xl font-bold text-white mb-4">Contacto Técnico</h2>
          <p className="mb-4">Para incidencias técnicas de grado severo que evadan los sistemas automáticos de la IA, por favor contacta a nuestro equipo humano de ingenieros Cloud y Server Administrators.</p>
          <p>Email directo: <strong>janplaces@minelab.gg</strong> (Tiempo medio de respuesta: 15 minutos).</p>
        </section>

        {/* LEGAL */}
        <section id="terms" className="scroll-mt-32">
          <h2 className="text-xl font-bold text-white mb-4">Términos de Servicio</h2>
          <p className="mb-4">Al crear una cuenta y alquilar un servidor en MineLab, aceptas cumplir íntegramente con nuestras políticas de uso legítimo. Los recursos asignados ("Ilimitado" o medidos) no deben ser utilizados de forma maliciosa, para criptominado, ataques DDoS o alojar software malicioso. MineLab se reserva el derecho de suspender permanentemente cualquier servicio asociado a este tipo de actividad.</p>
        </section>

        <section id="privacy" className="scroll-mt-32">
          <h2 className="text-xl font-bold text-white mb-4">Política de Privacidad</h2>
          <p className="mb-4">En MineLab, la privacidad de tus datos es prioritaria. Toda la información personal, correos electrónicos interactuados mediante los proveedores de OAuth (Google/Supabase) y datos de facturación (procesados por Stripe) están fuertemente encriptados. No vendemos tu información a terceros ni rastreamos tus consultas y comandos en consola para entrenamiento público de modelos de lenguaje, la IA de tu servidor es completamente privada.</p>
        </section>

        <section id="refunds" className="scroll-mt-32">
          <h2 className="text-xl font-bold text-white mb-4">Acuerdo de Reembolsos</h2>
          <p className="mb-4">Creemos en nuestro producto. Por eso, ofrecemos una <strong>garantía de devolución del dinero sin preguntas de 48 horas</strong> en todos los planes iniciales. Si el rendimiento del servidor no cumple tus expectativas, nuestro panel de IA te parece deficiente, o simplemente cambiaste de opinión, nuestro sistema procesará el reembolso automático hacia tu método de pago original en un plazo máximo de 5 a 10 días hábiles.</p>
        </section>
        
      </div>
    </div>
  );
};

export default LegalSections;
