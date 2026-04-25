import React from 'react';
import { Link } from 'react-router-dom';
import { Server, ArrowRight } from 'lucide-react';

/**
 * Minimal layout for SEO landings — small header + content + footer.
 * Designed to keep bundle small (no Hero/Carousel/Maps imports).
 */
export default function SeoLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-primary font-sans">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#080B14]/85 backdrop-blur-md">
        <div className="container mx-auto px-6 max-w-7xl h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Volver al inicio MineLab">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center">
              <Server size={18} className="text-white" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-white uppercase">MINELAB</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <Link to="/aternos-vs-minelab" className="hover:text-white transition-colors">vs Aternos</Link>
            <Link to="/hosting-minecraft-con-mods" className="hover:text-white transition-colors">Con mods</Link>
            <Link to="/migrar-servidor-aternos" className="hover:text-white transition-colors">Migrar</Link>
            <Link to="/#pricing" className="hover:text-white transition-colors">Precios</Link>
          </nav>
          <Link
            to="/#pricing"
            className="inline-flex items-center gap-2 rounded-full bg-accent-green px-5 py-2 text-sm font-semibold text-[#0B1220] hover:bg-accent-green/90 transition-colors"
          >
            Crear servidor <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main>{children}</main>

      {/* Mini footer (avoid loading the full one) */}
      <footer className="border-t border-white/5 bg-[#080B14] py-12">
        <div className="container mx-auto px-6 max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <p className="text-white font-semibold mb-3">MineLab</p>
            <p className="text-white/50 leading-relaxed">Hosting Minecraft con asistente IA. Sin cortes, sin colas, en español.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Landings SEO</p>
            <ul className="space-y-2 text-white/60">
              <li><Link to="/aternos-vs-minelab" className="hover:text-accent-green">vs Aternos</Link></li>
              <li><Link to="/hosting-minecraft-con-mods" className="hover:text-accent-green">Con mods</Link></li>
              <li><Link to="/migrar-servidor-aternos" className="hover:text-accent-green">Migrar de Aternos</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Producto</p>
            <ul className="space-y-2 text-white/60">
              <li><Link to="/" className="hover:text-accent-green">Home</Link></li>
              <li><Link to="/#pricing" className="hover:text-accent-green">Precios</Link></li>
              <li><a href="https://discord.gg/TS49z4yr" target="_blank" rel="noopener noreferrer" className="hover:text-accent-green">Discord</a></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Legal</p>
            <p className="text-white/40 text-xs">© {new Date().getFullYear()} MineLab. No afiliado a Mojang ni Microsoft.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
