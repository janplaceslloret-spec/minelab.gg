import React from 'react';
import { Link } from 'react-router-dom';
import { Server, Mail, MapPin, MessageCircle, Music2, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="pt-24 pb-12 border-t border-white/5 bg-[#080B14]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 md:gap-8 mb-16">

          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center">
                <Server size={18} className="text-white" />
              </div>
              <span className="font-heading font-black text-2xl tracking-tight text-white uppercase">MINELAB</span>
            </div>
            <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-xs">
              Hosting Minecraft español con asistente IA. Operativo desde 2025. Datacenter en Alemania, soporte humano en Discord.
            </p>

            {/* NAP block */}
            <div className="space-y-2 text-xs text-white/55">
              <div className="flex items-start gap-2">
                <Mail size={13} className="mt-0.5 flex-shrink-0 text-accent-green" />
                <a href="mailto:janplaces@minelab.gg" className="hover:text-accent-green transition-colors">janplaces@minelab.gg</a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={13} className="mt-0.5 flex-shrink-0 text-accent-green" />
                <span>España · Datacenter en Falkenstein 🇩🇪</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://discord.gg/wUJZkQxAQk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center text-white/65 hover:text-accent-green hover:border-accent-green/40 transition-colors"
              >
                <MessageCircle size={15} />
              </a>
              <a
                href="https://www.tiktok.com/@minelab.gg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center text-white/65 hover:text-accent-green hover:border-accent-green/40 transition-colors"
              >
                <Music2 size={15} />
              </a>
              <a
                href="https://github.com/janplaceslloret-spec"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center text-white/65 hover:text-accent-green hover:border-accent-green/40 transition-colors"
              >
                <Github size={15} />
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-6">Servicios</h4>
            <ul className="space-y-4">
              <li><a href="/#pricing" className="text-white/50 hover:text-accent-green transition-colors text-sm">Planes y precios</a></li>
              <li><Link to="/configurar" className="text-white/50 hover:text-accent-green transition-colors text-sm">Crear servidor</Link></li>
              <li><a href="/#features" className="text-white/50 hover:text-accent-green transition-colors text-sm">Asistente IA</a></li>
              <li><a href="/#features" className="text-white/50 hover:text-accent-green transition-colors text-sm">Java y Bedrock</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-6">Empresa</h4>
            <ul className="space-y-4">
              <li><Link to="/sobre-nosotros" className="text-white/50 hover:text-accent-green transition-colors text-sm">Sobre nosotros</Link></li>
              <li><Link to="/changelog" className="text-white/50 hover:text-accent-green transition-colors text-sm">Novedades</Link></li>
              <li><Link to="/status" className="text-white/50 hover:text-accent-green transition-colors text-sm">Estado del servicio</Link></li>
              <li><a href="https://discord.gg/wUJZkQxAQk" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-accent-green transition-colors text-sm">Comunidad Discord</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-6">Recursos</h4>
            <ul className="space-y-4">
              <li><Link to="/aternos-vs-minelab" className="text-white/50 hover:text-accent-green transition-colors text-sm">MineLab vs Aternos</Link></li>
              <li><Link to="/hosting-minecraft-con-mods" className="text-white/50 hover:text-accent-green transition-colors text-sm">Hosting con mods</Link></li>
              <li><Link to="/migrar-servidor-aternos" className="text-white/50 hover:text-accent-green transition-colors text-sm">Migrar de Aternos</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/terminos" className="text-white/50 hover:text-accent-green transition-colors text-sm">Términos de servicio</Link></li>
              <li><Link to="/privacidad" className="text-white/50 hover:text-accent-green transition-colors text-sm">Política de privacidad</Link></li>
              <li><Link to="/reembolsos" className="text-white/50 hover:text-accent-green transition-colors text-sm">Política de reembolsos</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} MineLab Hosting · Jan Places Lloret. Todos los derechos reservados.</p>
          <p>No afiliado, asociado ni respaldado por Mojang AB o Microsoft.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
