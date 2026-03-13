import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Cpu, Zap } from 'lucide-react';
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

  const planFeatures = [
    "Servidores optimizados para Minecraft",
    "Asistente de IA para gestionar el servidor",
    "Instalación automática de plugins",
    "Reparación automática de errores",
    "Gestión simplificada del servidor"
  ];

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
            Precios exclusivos de Beta anticipada por tiempo limitado.
          </p>
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
                <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest mb-3 bg-white/5 inline-block px-3 py-1 rounded-full border border-white/10">
                  PRECIO EXCLUSIVO BETA
                </p>
                <div className="flex flex-col items-center justify-center relative">
                  <span className="text-white/30 font-bold text-xl line-through decoration-red-500/50 block mb-1">
                    {plan.originalPrice}
                  </span>
                  <div className="flex items-end justify-center font-heading text-6xl font-bold text-white tracking-tighter leading-none">
                    {plan.price}
                    <span className="text-white/50 text-sm mb-2 ml-1 uppercase font-sans font-medium tracking-wide">/ mes</span>
                  </div>
                </div>
                {/* Text requested by user */}
                <div className="mt-6 flex flex-col gap-2">
                  <p className="text-accent-green font-bold text-sm uppercase tracking-wider">
                    PRECIO BETA DE POR VIDA
                  </p>
                  <p className="text-white/50 text-[11px] leading-tight px-2">
                    Los usuarios que compren durante la beta mantendrán este precio para siempre.
                  </p>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {planFeatures.map((feat, f_idx) => (
                  <li key={f_idx} className="flex items-start gap-3 text-white/80 text-sm">
                    <Check size={18} className={`shrink-0 mt-0.5 ${plan.popular ? 'text-accent-green' : 'text-white/30'}`} /> 
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSubscribe(plan.stripeLink)}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-heading font-bold text-sm uppercase tracking-widest transition-all duration-300
                ${plan.popular 
                  ? 'bg-accent-green text-gray-900 hover:bg-[#1faa50] shadow-[0_10px_20px_rgba(34,197,94,0.2)] hover:-translate-y-1' 
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20 hover:-translate-y-1'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Crear servidor con IA
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
