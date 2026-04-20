import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Cpu, Zap, Info } from 'lucide-react';
import { supabase } from '../supabaseClient';

gsap.registerPlugin(ScrollTrigger);

const Pricing = ({ isLoggedIn, onLoginDemo, onOpenDashboard }) => {
  const sectionRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      if (isLoggedIn) {
        // User is authenticated, redirect to Panel (Wizard opens here)
        onOpenDashboard();
      } else {
        // User is not authenticated, redirect to Simulated Login
        onLoginDemo();
      }
    } catch (error) {
      console.error('Error during authentication routing:', error.message);
    } finally {
      setLoading(false);
    }
  };


  const plans = [
    {
      name: "4GB RAM",
      originalPrice: "8€",
      price: "5€",
      popular: false,
      stripeLink: "https://buy.stripe.com/8x228s2LKcZN3lK3As3AY01"
    },
    {
      name: "6GB RAM",
      originalPrice: "10€",
      price: "7€",
      popular: true,
      stripeLink: "https://buy.stripe.com/4gM5kE1HG6Bpg8w7QI3AY02"
    },
    {
      name: "8GB RAM",
      originalPrice: "13€",
      price: "10€",
      popular: false,
      stripeLink: "https://buy.stripe.com/14AdRa2LK2l99K8gne3AY03"
    },
    {
      name: "12GB RAM",
      originalPrice: "18€",
      price: "15€",
      popular: false,
      stripeLink: "https://buy.stripe.com/bJe7sM1HGe3R3lK2wo3AY05"
    }
  ];

  useEffect(() => {
    // Disabled GSAP ScrollTrigger temporarily if it's causing opacity:0 traps 
    // due to pinned scroll elements above.
    /*
    const ctx = gsap.context(() => {
      gsap.from(".pricing-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
      });
    }, sectionRef);

    return () => ctx.revert();
    */
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="py-24 min-h-screen relative z-10 bg-[#0A0D14] flex flex-col justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-accent-green/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-green/30 bg-accent-green/10 text-accent-green text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <Zap size={14} className="animate-pulse" />
            Fase Beta Pública
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tighter mb-4 uppercase text-white leading-tight">
            POTENCIA SIN LÍMITES <br/> A <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-violet">MITAD DE PRECIO</span>
          </h2>
          <p className="text-white/60 text-lg">
            Planes con especificaciones técnicas claras y máximo rendimiento para tu servidor.
          </p>

          {/* Real infrastructure badge */}
          <div className="mt-6 inline-flex flex-wrap justify-center gap-3 text-xs font-mono text-white/50">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span>
              Hetzner CX53
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              ⚡ AMD EPYC · 16 vCPU
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              💾 NVMe SSD · 320 GB
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              🌐 10 Gbps · Nuremberg 🇩🇪
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch pt-4">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`pricing-card relative flex flex-col rounded-[2rem] transition-all duration-500 overflow-visible
                ${plan.popular 
                  ? 'bg-[#1a2333] border-2 border-accent-green z-20 shadow-[0_0_50px_rgba(34,197,94,0.15)] transform lg:-translate-y-6 hover:shadow-[0_0_60px_rgba(34,197,94,0.3)] hover:-translate-y-8' 
                  : 'bg-[#0B0F1A] border border-white/10 hover:border-white/20 hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(255,255,255,0.02)]'
                } p-8 lg:p-10`}
            >
              {plan.popular && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent-green to-[#1faa50] text-gray-900 font-bold px-6 py-2 rounded-full text-[11px] uppercase tracking-widest shadow-[0_10px_20px_rgba(34,197,94,0.4)] whitespace-nowrap z-30 ring-4 ring-[#0A0D14]">
                  PLAN MÁS POPULAR
                </div>
              )}

              <div className="mb-6 border-b border-white/5 pb-6 flex flex-col items-center text-center">
                <Cpu size={32} className={`mb-4 ${plan.popular ? 'text-accent-green' : 'text-white/40'}`} />
                <h3 className={`font-heading text-3xl font-bold uppercase tracking-tighter ${plan.popular ? 'text-accent-green' : 'text-white'}`}>{plan.name}</h3>
              </div>

              <div className="mb-8 text-center relative">
                <div className="flex flex-col items-center justify-center relative">
                  <span className="text-white/30 font-bold text-xl line-through decoration-red-500/50 block mb-1">
                    {plan.originalPrice}
                  </span>
                  <div className="flex items-end justify-center font-heading text-6xl font-bold text-white tracking-tighter leading-none">
                    {plan.price}
                    <span className="text-white/50 text-sm mb-2 ml-1 uppercase font-sans font-medium tracking-wide">/ mes</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {[
                  `${plan.name} RAM dedicada`,
                  "Procesador AMD EPYC (Hetzner CX53)",
                  "10 Gbps de ancho de banda",
                  "Almacenamiento NVMe SSD local",
                  "Datacenter Nuremberg, Alemania 🇩🇪",
                  "Backups disponibles",
                  "Compatible con Paper, Forge, Fabric y Vanilla"
                ].map((feat, f_idx) => (
                  <li key={f_idx} className="flex items-start gap-3 justify-start text-white/80 text-[13px] text-left">
                    <Check size={16} className={`shrink-0 mt-0.5 ${plan.popular ? 'text-accent-green' : 'text-white/40'}`} /> 
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="mb-8 p-4 rounded-xl bg-black/20 border border-white/5 text-white/60 text-[12px] text-left leading-snug flex items-start gap-3">
                <Info size={16} className="text-accent-green shrink-0 mt-0.5" />
                <span>
                  Mods + plugins en el mismo servidor dependen de la versión y configuración compatible.
                </span>
              </div>

              <button 
                onClick={() => handleSubscribe(plan.stripeLink)}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-heading font-bold text-sm uppercase tracking-widest transition-all duration-300 mt-auto
                ${plan.popular 
                  ? 'bg-accent-green text-gray-900 hover:bg-[#1faa50] shadow-[0_10px_20px_rgba(34,197,94,0.2)] hover:-translate-y-1' 
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20 hover:-translate-y-1'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Crear servidor
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section specifically for plugins + mods */}
        <div className="mt-20 max-w-4xl mx-auto p-8 rounded-[2rem] bg-[#1a2333]/30 border border-white/10 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/10 rounded-full blur-[80px] -z-10"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex-1">
              <h3 className="text-xl font-heading font-bold uppercase tracking-wide text-white mb-4 flex items-center gap-3">
                <Info className="text-accent-green" size={24} />
                ¿Se pueden usar plugins + mods a la vez?
              </h3>
              <ul className="space-y-3 text-white/70 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-green/50 mt-2 shrink-0"></div>
                  <span><strong className="text-white/90">Paper</strong> se usa para plugins.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-green/50 mt-2 shrink-0"></div>
                  <span><strong className="text-white/90">Forge y Fabric</strong> se usan para mods.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-green/50 mt-2 shrink-0"></div>
                  <span>Combinar ambos depende de la versión y de un software compatible que lo soporte.</span>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-auto flex flex-col items-start md:items-end justify-center md:pl-8 md:border-l border-white/10 pt-6 md:pt-0">
              <p className="text-white/80 text-sm mb-4 font-medium">¿Necesitas mods + plugins?</p>
              <a 
                href="https://discord.gg/TS49z4yr" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-green/50 text-white font-medium text-sm transition-all text-center"
              >
                Consulta compatibilidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
