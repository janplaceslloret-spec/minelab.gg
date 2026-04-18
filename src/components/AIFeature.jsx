import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DemoPanel from './DemoPanel';

gsap.registerPlugin(ScrollTrigger);

const AIFeature = () => {
  const sectionRef = useRef(null);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl flex flex-col items-center">

        <div className="text-center mb-16 max-w-3xl">
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Tu panel real, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-violet">en acción</span>
          </h2>
          <p className="text-white/60 text-lg">
            Esto no es un mockup. Es exactamente el mismo panel que usarás para gestionar tu servidor — con asistente IA incluido. Pruébalo ahora.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="w-full max-w-[1500px] bg-[#090C13] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col z-10">

          <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-green/5 pointer-events-none"></div>

          {/* Mac-like Header */}
          <div className="px-4 py-3 bg-[#0B0F1A] border-b border-white/5 flex items-center relative z-20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="flex-1 text-center font-medium text-xs text-white/40 tracking-widest pl-6">
              MINELAB PANEL — DEMO INTERACTIVA
            </div>
          </div>

          {/* Real Dashboard */}
          <DemoPanel />
        </div>

      </div>
    </section>
  );
};

export default AIFeature;
