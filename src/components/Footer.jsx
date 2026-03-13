import React from 'react';
import { Server } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="pt-24 pb-12 border-t border-white/5 bg-[#080B14]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center">
                <Server size={18} className="text-white" />
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white uppercase">MINELAB</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              El primer servicio de hosting global administrado e hiperoptimizado para Minecraft por Inteligencia Artificial.
            </p>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-6">Servicios</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-white/50 hover:text-accent-green transition-colors text-sm">Servidores Java</a></li>
              <li><a href="#features" className="text-white/50 hover:text-accent-green transition-colors text-sm">Servidores Bedrock</a></li>
              <li><a href="#pricing" className="text-white/50 hover:text-accent-green transition-colors text-sm">Precios</a></li>
              <li><a href="#features" className="text-white/50 hover:text-accent-green transition-colors text-sm">Características IA</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-6">Soporte</h4>
            <ul className="space-y-4">
              <li><a href="#support" className="text-white/50 hover:text-accent-green transition-colors text-sm">Base de Conocimiento</a></li>
              <li><a href="https://discord.gg/minelab" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-accent-green transition-colors text-sm">Comunidad Discord</a></li>
              <li><a href="#status" className="text-white/50 hover:text-accent-green transition-colors text-sm">Estado de Nodos</a></li>
              <li><a href="#contact" className="text-white/50 hover:text-accent-green transition-colors text-sm">Contacto Técnico</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#terms" className="text-white/50 hover:text-accent-green transition-colors text-sm">Términos de Servicio</a></li>
              <li><a href="#privacy" className="text-white/50 hover:text-accent-green transition-colors text-sm">Política de Privacidad</a></li>
              <li><a href="#refunds" className="text-white/50 hover:text-accent-green transition-colors text-sm">Acuerdo de Reembolsos</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} MINELAB Hosting. Todos los derechos reservados.</p>
          <p>No afiliado, asociado ni respaldado por Mojang AB o Microsoft.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
