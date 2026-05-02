import React, { useState, useEffect } from 'react';
import { ChevronDown, Server, Cpu, Swords, Package, ArrowLeftRight, Menu, X } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Navbar = ({ isLoggedIn, onLoginDemo, onOpenDashboard }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  // Cross-page anchor: scroll if on home, navigate if elsewhere
  const goToAnchor = (id) => (e) => {
    e.preventDefault();
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#' + id);
    }
    setIsDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // Bloquear scroll del body cuando el menu mobile está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-[48px] left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
      <div className={`container mx-auto px-6 max-w-7xl transition-all duration-300 ${scrolled ? 'glass-panel mx-4 py-3' : 'glass-panel py-3'}`} style={{ backgroundColor: 'rgba(11, 15, 26, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div
            onClick={() => {
              if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' });
              else navigate('/');
            }}
            className="flex items-center gap-3 cursor-pointer group mr-8 shrink-0"
          >
            <img
              src="/favicon.png?v=3"
              alt="MineLab Logo"
              className="w-9 h-9 transform group-hover:rotate-6 transition-transform duration-300"
            />
            <span className="font-heading font-black text-2xl tracking-tighter text-white uppercase">MINELAB</span>
          </div>

          {/* Center Links */}
          <div className="hidden lg:flex items-center gap-8">
            <div 
              className="relative group h-full"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="flex items-center gap-1.5 text-white/80 hover:text-white font-medium transition-colors py-2 uppercase tracking-wide text-sm">
                Minecraft Hosting
                <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-accent-green' : ''}`} />
              </button>
              
              {/* Animated Dropdown HolyHosting Style */}
              <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-4 pointer-events-none'}`}>
                <div className="w-[340px] bg-[#0B0F1A]/95 backdrop-blur-xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 rounded-2xl relative overflow-hidden flex flex-col gap-1.5">

                  {/* Item 1: Minecraft Hosting */}
                  <a
                    href="/#pricing"
                    onClick={goToAnchor('pricing')}
                    className="relative z-10 flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-[#111827] transition-all group/card border border-transparent hover:border-accent-green/40 hover:shadow-[0_10px_30px_rgba(34,197,94,0.15)] duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1F2937] flex items-center justify-center flex-shrink-0 group-hover/card:shadow-[0_0_20px_rgba(34,197,94,0.3)] duration-300 border border-white/5 group-hover/card:border-accent-green/30">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#7CB342" stroke="#558B2F" strokeWidth="1" strokeLinejoin="round"/>
                        <path d="M2 7V17L12 22V12L2 7Z" fill="#5D4037" stroke="#4E342E" strokeWidth="1" strokeLinejoin="round"/>
                        <path d="M22 7V17L12 22V12L22 7Z" fill="#795548" stroke="#5D4037" strokeWidth="1" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-black text-white uppercase tracking-tight text-sm">Minecraft Hosting</p>
                      <p className="text-[10px] text-white/50 leading-tight mt-0.5 uppercase tracking-wide">Planes desde 7,99€/mes</p>
                    </div>
                  </a>

                  {/* Divider */}
                  <div className="px-3 py-1">
                    <p className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em]">¿Vienes de otro hosting?</p>
                  </div>

                  {/* Item 2: vs Aternos */}
                  <Link
                    to="/aternos-vs-minelab"
                    onClick={() => setIsDropdownOpen(false)}
                    className="relative z-10 flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-[#111827] transition-all group/card border border-transparent hover:border-accent-green/40 duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1F2937] flex items-center justify-center flex-shrink-0 border border-white/5 group-hover/card:border-accent-green/30">
                      <Swords size={18} className="text-accent-green" strokeWidth={2.4} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-heading font-black text-white uppercase tracking-tight text-sm">MineLab vs Aternos</p>
                        <span className="text-[8px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green border border-accent-green/30">Nuevo</span>
                      </div>
                      <p className="text-[10px] text-white/50 leading-tight mt-0.5 uppercase tracking-wide">Comparativa + calculadora ahorro</p>
                    </div>
                  </Link>

                  {/* Item 3: Migrar de Aternos */}
                  <Link
                    to="/migrar-servidor-aternos"
                    onClick={() => setIsDropdownOpen(false)}
                    className="relative z-10 flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-[#111827] transition-all group/card border border-transparent hover:border-accent-green/40 duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1F2937] flex items-center justify-center flex-shrink-0 border border-white/5 group-hover/card:border-accent-green/30">
                      <ArrowLeftRight size={18} className="text-white/80" strokeWidth={2.4} />
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-black text-white uppercase tracking-tight text-sm">Migrar desde Aternos</p>
                      <p className="text-[10px] text-white/50 leading-tight mt-0.5 uppercase tracking-wide">Guía paso a paso · 15 min</p>
                    </div>
                  </Link>

                  {/* Item 4: Hosting con mods */}
                  <Link
                    to="/hosting-minecraft-con-mods"
                    onClick={() => setIsDropdownOpen(false)}
                    className="relative z-10 flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-[#111827] transition-all group/card border border-transparent hover:border-accent-green/40 duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1F2937] flex items-center justify-center flex-shrink-0 border border-white/5 group-hover/card:border-accent-green/30">
                      <Package size={18} className="text-white/80" strokeWidth={2.4} />
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-black text-white uppercase tracking-tight text-sm">Hosting con mods</p>
                      <p className="text-[10px] text-white/50 leading-tight mt-0.5 uppercase tracking-wide">Forge · Fabric · NeoForge · 1-click modpacks</p>
                    </div>
                  </Link>

                </div>
              </div>
            </div>

            <a href="/#features" onClick={goToAnchor('features')} className="text-white/80 hover:text-white font-medium transition-colors py-2 uppercase tracking-wide text-sm">Características</a>
            <a href="/#how-it-works" onClick={goToAnchor('how-it-works')} className="text-white/80 hover:text-white font-medium transition-colors py-2 uppercase tracking-wide text-sm">Cómo Funciona</a>
            <a href="/#pricing" onClick={goToAnchor('pricing')} className="text-white/80 hover:text-white font-medium transition-colors py-2 uppercase tracking-wide text-sm">Planes</a>
            <a href="/#about" onClick={goToAnchor('about')} className="text-white/80 hover:text-white font-medium transition-colors py-2 uppercase tracking-wide text-sm">Nosotros</a>
          </div>

          {/* Right Actions desktop */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn && (
              <button
                onClick={onLoginDemo}
                className="text-white/80 hover:text-white font-heading font-black px-4 py-2 transition-colors uppercase tracking-tight text-sm disabled:opacity-50"
              >
                INICIAR SESIÓN
              </button>
            )}
            <button
              onClick={isLoggedIn ? onOpenDashboard : () => window.location.assign('/configurar?plan=6gb&billing=monthly')}
              className="bg-accent-green hover:bg-[#1faa50] text-gray-900 px-6 py-2.5 rounded-lg font-heading font-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] transform hover:-translate-y-0.5 uppercase tracking-tight text-sm disabled:opacity-50"
            >
              {isLoggedIn ? 'PANEL' : 'CREAR SERVIDOR'}
            </button>
          </div>

          {/* Hamburguesa mobile (visible solo <md) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú"
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95"
          >
            <Menu size={22} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay (md:hidden) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-[#0B0F1A]/98 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
          {/* Header con close */}
          <div className="flex justify-between items-center px-5 pt-4 pb-3 border-b border-white/10">
            <span className="font-heading font-black text-2xl tracking-tighter text-white uppercase">MINELAB</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Cerrar menú"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95"
            >
              <X size={22} strokeWidth={2.4} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-1">
            {/* Sección Hosting */}
            <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] mb-2 px-2">Minecraft Hosting</p>
            <a href="/#pricing" onClick={goToAnchor('pricing')} className="flex items-center gap-3 px-3 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <div className="w-9 h-9 rounded-lg bg-[#1F2937] flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#7CB342" stroke="#558B2F" strokeWidth="1" strokeLinejoin="round"/>
                  <path d="M2 7V17L12 22V12L2 7Z" fill="#5D4037" stroke="#4E342E" strokeWidth="1" strokeLinejoin="round"/>
                  <path d="M22 7V17L12 22V12L22 7Z" fill="#795548" stroke="#5D4037" strokeWidth="1" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-heading font-black text-white uppercase tracking-tight text-sm">Planes</p>
                <p className="text-[10px] text-white/50 leading-tight uppercase tracking-wide">Desde 7,99€/mes</p>
              </div>
            </a>
            <Link to="/aternos-vs-minelab" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <div className="w-9 h-9 rounded-lg bg-[#1F2937] flex items-center justify-center shrink-0">
                <Swords size={16} className="text-accent-green" strokeWidth={2.4} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-heading font-black text-white uppercase tracking-tight text-sm">Vs Aternos</p>
                  <span className="text-[8px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green border border-accent-green/30">Nuevo</span>
                </div>
              </div>
            </Link>
            <Link to="/migrar-servidor-aternos" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <div className="w-9 h-9 rounded-lg bg-[#1F2937] flex items-center justify-center shrink-0">
                <ArrowLeftRight size={16} className="text-white/80" strokeWidth={2.4} />
              </div>
              <p className="font-heading font-black text-white uppercase tracking-tight text-sm">Migrar de Aternos</p>
            </Link>
            <Link to="/hosting-minecraft-con-mods" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <div className="w-9 h-9 rounded-lg bg-[#1F2937] flex items-center justify-center shrink-0">
                <Package size={16} className="text-white/80" strokeWidth={2.4} />
              </div>
              <p className="font-heading font-black text-white uppercase tracking-tight text-sm">Hosting con mods</p>
            </Link>

            {/* Sección Navegación */}
            <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] mb-2 mt-6 px-2">Navegación</p>
            <a href="/#features" onClick={goToAnchor('features')} className="px-3 py-3 rounded-lg hover:bg-white/5 text-white/90 font-heading font-black uppercase tracking-tight text-sm transition-all">Características</a>
            <a href="/#how-it-works" onClick={goToAnchor('how-it-works')} className="px-3 py-3 rounded-lg hover:bg-white/5 text-white/90 font-heading font-black uppercase tracking-tight text-sm transition-all">Cómo Funciona</a>
            <a href="/#about" onClick={goToAnchor('about')} className="px-3 py-3 rounded-lg hover:bg-white/5 text-white/90 font-heading font-black uppercase tracking-tight text-sm transition-all">Nosotros</a>
          </div>

          {/* CTAs sticky bottom */}
          <div className="px-5 pt-3 pb-6 border-t border-white/10 bg-[#0B0F1A]/98 flex flex-col gap-3">
            {!isLoggedIn && (
              <button
                onClick={() => { setMobileMenuOpen(false); onLoginDemo?.(); }}
                className="w-full text-white/90 hover:text-white font-heading font-black py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 transition-all uppercase tracking-tight text-sm"
              >
                INICIAR SESIÓN
              </button>
            )}
            <button
              onClick={() => { setMobileMenuOpen(false); if (isLoggedIn) onOpenDashboard?.(); else window.location.assign('/configurar?plan=6gb&billing=monthly'); }}
              className="w-full bg-accent-green hover:bg-[#1faa50] text-gray-900 py-3.5 rounded-xl font-heading font-black transition-all shadow-[0_0_25px_rgba(34,197,94,0.4)] uppercase tracking-tight text-sm"
            >
              {isLoggedIn ? 'IR AL PANEL' : 'CREAR SERVIDOR'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
