import React, { useState, useEffect } from 'react';
import { ChevronDown, Server, Cpu } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Navbar = ({ isLoggedIn, onLoginDemo, onOpenDashboard }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-[48px] left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
      <div className={`container mx-auto px-6 max-w-7xl transition-all duration-300 ${scrolled ? 'glass-panel mx-4 py-3' : 'glass-panel py-3'}`}>
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center cursor-pointer group"
          >
            <img
              src="/logo2.png"
              alt="MineLab Logo"
              className="h-14 w-auto object-contain"
            />
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
                <div className="w-[300px] bg-[#0B0F1A]/90 backdrop-blur-xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 rounded-2xl relative overflow-hidden flex flex-col gap-2">
                  
                  {/* Item 1: Minecraft Hosting */}
                  <a 
                    href="#pricing" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDropdownOpen(false);
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="relative z-10 flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-[#111827] transition-all group/card border border-transparent hover:border-accent-green/40 hover:shadow-[0_10px_30px_rgba(34,197,94,0.15)] hover:-translate-y-1 duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-green/5 to-transparent opacity-0 group-hover/card:opacity-100 rounded-xl transition-opacity duration-500 pointer-events-none"></div>
                    <div className="w-12 h-12 rounded-lg bg-[#1F2937] flex items-center justify-center flex-shrink-0 group-hover/card:shadow-[0_0_20px_rgba(34,197,94,0.3)] duration-300 border border-white/5 group-hover/card:border-accent-green/30">
                      
                      {/* CSS/SVG Voxel Cube fallback */}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover/card:scale-110 transition-transform duration-300">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#7CB342" stroke="#558B2F" strokeWidth="1" strokeLinejoin="round"/>
                        <path d="M2 7V17L12 22V12L2 7Z" fill="#5D4037" stroke="#4E342E" strokeWidth="1" strokeLinejoin="round"/>
                        <path d="M22 7V17L12 22V12L22 7Z" fill="#795548" stroke="#5D4037" strokeWidth="1" strokeLinejoin="round"/>
                      </svg>
                      
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-bold text-white uppercase tracking-tight text-sm">Minecraft Hosting</span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-tight mb-2 uppercase tracking-wide">Hosting optimizado para Minecraft</p>
                      <p className="text-accent-green font-semibold text-xs tracking-wider">Desde 6.99€/mes</p>
                    </div>
                  </a>

                </div>
              </div>
            </div>

            <a href="#features" className="text-white/80 hover:text-white font-medium transition-colors py-2 uppercase tracking-wide text-sm">Características</a>
            <a href="#how-it-works" className="text-white/80 hover:text-white font-medium transition-colors py-2 uppercase tracking-wide text-sm">Cómo Funciona</a>
            <a href="#pricing" className="text-white/80 hover:text-white font-medium transition-colors py-2 uppercase tracking-wide text-sm">Planes</a>
            <a href="#about" className="text-white/80 hover:text-white font-medium transition-colors py-2 uppercase tracking-wide text-sm">Nosotros</a>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn && (
              <button 
                onClick={onLoginDemo}
                className="text-white/80 hover:text-white font-heading font-bold px-4 py-2 transition-colors uppercase tracking-tight text-sm disabled:opacity-50"
              >
                INICIAR SESIÓN
              </button>
            )}
            <button 
              onClick={isLoggedIn ? onOpenDashboard : onLoginDemo}
              className="bg-accent-green hover:bg-[#1faa50] text-gray-900 px-6 py-2.5 rounded-lg font-heading font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] transform hover:-translate-y-0.5 uppercase tracking-tight text-sm disabled:opacity-50"
            >
              {isLoggedIn ? 'PANEL' : 'EMPEZAR'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
