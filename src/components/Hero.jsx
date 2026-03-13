import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';

const Hero = ({ isLoggedIn, onLoginDemo, onOpenDashboard }) => {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in sequence
      gsap.from(".hero-element", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2
      });
      
      // Floating animation for the image
      gsap.to(".hero-image", {
        y: 15,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative pt-16 pb-24 overflow-hidden min-h-[90vh] flex items-center">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-green/10 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="max-w-2xl relative z-20">
            <h1 className="hero-element font-heading text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.05] tracking-tight mb-8 text-white uppercase">
              <span className="block mb-2">LA NUEVA ERA DEL HOSTING</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-green to-accent-violet">
                SERVIDORES INTELIGENTES
              </span>
            </h1>
            
            <p className="hero-element text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-xl text-balance">
              Controla tu servidor de Minecraft con inteligencia artificial.<br className="hidden md:block"/>
              <span className="text-white/90">Instala plugins, corrige errores y gestiona tu servidor sin tocar archivos.</span>
            </p>
            
            <div className="hero-element flex flex-wrap gap-4 mb-16">
              <button 
                onClick={isLoggedIn ? onOpenDashboard : onLoginDemo}
                className="bg-accent-green hover:bg-[#1faa50] text-gray-900 px-8 py-4 rounded-xl font-heading font-bold text-lg transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transform hover:-translate-y-1 uppercase tracking-tight disabled:opacity-50"
              >
                {isLoggedIn ? 'IR AL PANEL' : 'EMPEZAR AHORA'}
              </button>
              <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-heading font-bold text-lg transition-all backdrop-blur-sm uppercase tracking-tight">
                VER DEMO
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="hero-element grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <p className="font-heading text-4xl font-bold text-white mb-1 tracking-tighter">0</p>
                <p className="text-xs text-white/50 font-medium uppercase tracking-widest leading-relaxed">Archivos YAML que editar</p>
              </div>
              <div>
                <p className="font-heading text-4xl font-bold text-white mb-1 tracking-tighter">&lt; 60s</p>
                <p className="text-xs text-white/50 font-medium uppercase tracking-widest leading-relaxed">Para empezar a jugar</p>
              </div>
              <div>
                <p className="font-heading text-4xl font-bold text-accent-green mb-1 tracking-tighter">99.9%</p>
                <p className="text-xs text-accent-green/60 font-medium uppercase tracking-widest leading-relaxed">Uptime garantizado</p>
              </div>
            </div>
          </div>

          {/* Visual Side: Massive Integrated Image background for the right side */}
          <div className="hero-element hidden lg:block absolute inset-0 left-1/4 -z-10 overflow-hidden rounded-l-[4rem]">
            <div 
              className="absolute inset-0 bg-cover bg-right bg-no-repeat 2xl:scale-105"
              style={{
                backgroundImage: "url('/images/515502898_1074285658145495_5507178639223054620_n.jpg')" // The cow image
              }}
            ></div>
            
            {/* Soft Gradients for Seamless Blending but High Visibility */}
            {/* Left to right gradient (Black to transparent) ensuring text legibility but fast fade */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F1A] via-[#0B0F1A]/80 via-30% to-transparent w-full"></div>
            
            {/* Bottom to top gradient (Black to transparent) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/20 to-transparent h-full"></div>
            
            {/* Top to bottom gradient to fade the hard top edge */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A] via-[#0B0F1A]/10 to-transparent h-32"></div>
            
            {/* Minimal tint overlay to maintain tech feel without darkening too much */}
            <div className="absolute inset-0 bg-accent-green/5 mix-blend-overlay pointer-events-none"></div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;
