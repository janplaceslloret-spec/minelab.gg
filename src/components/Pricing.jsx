import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Cpu, Zap, Info, Calendar } from 'lucide-react';
import { supabase } from '../supabaseClient';

gsap.registerPlugin(ScrollTrigger);

const Pricing = ({ isLoggedIn, onLoginDemo, onOpenDashboard }) => {
  const sectionRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'annual'

  // Crea un draft en mc_servers y devuelve el id, o null si falla
  const createDraftServer = async (userId, ramGb) => {
    try {
      const uniqueName = `Mi servidor ${Math.floor(Date.now() / 1000)}`;
      const { data, error } = await supabase
        .from('mc_servers')
        .insert({
          user_id: userId,
          server_name: uniqueName,
          server_type: 'paper',
          mc_version: '1.21.4',
          ram_gb: ramGb,
          status: 'draft',
          status_server: 'offline',
          ready: false,
          mods: false,
          mod_count: 0,
        })
        .select('id')
        .single();
      if (error) { console.error('[Pricing] draft insert error:', error); return null; }
      return data?.id || null;
    } catch (err) {
      console.error('[Pricing] createDraftServer failed:', err);
      return null;
    }
  };

  const handleSubscribe = async (stripeUrl, ramGb) => {
    try {
      setLoading(true);
      if (stripeUrl) {
        let finalUrl = stripeUrl;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const userId = session?.user?.id;
          if (userId) {
            // Crear draft en mc_servers para que el webhook tenga un server_id válido
            const serverId = await createDraftServer(userId, ramGb || 6);
            const refId = serverId || userId; // fallback a userId si el insert falla
            const sep = stripeUrl.includes('?') ? '&' : '?';
            finalUrl = `${stripeUrl}${sep}client_reference_id=${encodeURIComponent(refId)}&prefilled_email=${encodeURIComponent(session.user.email || '')}`;
          } else {
            // No logueado: guardamos plan elegido y llevamos a login
            localStorage.setItem('minelab-pending-stripe-url', stripeUrl);
            localStorage.setItem('minelab-pending-stripe-ram', String(ramGb || 6));
            onLoginDemo();
            return;
          }
        } catch (_) {
          // Si supabase falla, igual abrimos Stripe sin client_reference_id
        }
        window.location.href = finalUrl;
        return;
      }
      // Fallback si no hay URL: comportamiento previo (login/panel)
      if (isLoggedIn) onOpenDashboard();
      else onLoginDemo();
    } catch (error) {
      console.error('Error during checkout routing:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "4GB RAM",
      ramGb: 4,
      originalPrice: "8€",
      monthlyPrice: "5€",
      annualPrice: "60€",
      monthlyEquiv: "5€",
      popular: false,
      stripeMonthly: "https://buy.stripe.com/8x228s2LKcZN3lK3As3AY01",
      stripeAnnual: "https://buy.stripe.com/fZu28s8641h54pOdb23AY0a",
    },
    {
      name: "6GB RAM",
      ramGb: 6,
      originalPrice: "10€",
      monthlyPrice: "7€",
      annualPrice: "84€",
      monthlyEquiv: "7€",
      popular: true,
      stripeMonthly: "https://buy.stripe.com/4gM5kE1HG6Bpg8w7QI3AY02",
      stripeAnnual: "https://buy.stripe.com/4gMaEY4TS0d1e0ogne3AY0b",
    },
    {
      name: "8GB RAM",
      ramGb: 8,
      originalPrice: "13€",
      monthlyPrice: "10€",
      annualPrice: "120€",
      monthlyEquiv: "10€",
      popular: false,
      stripeMonthly: "https://buy.stripe.com/14AdRa2LK2l99K8gne3AY03",
      stripeAnnual: "https://buy.stripe.com/eVq7sM9a8aRF4pOc6Y3AY0c",
    },
    {
      name: "12GB RAM",
      ramGb: 12,
      originalPrice: "18€",
      monthlyPrice: "15€",
      annualPrice: "180€",
      monthlyEquiv: "15€",
      popular: false,
      stripeMonthly: "https://buy.stripe.com/bJe7sM1HGe3R3lK2wo3AY05",
      stripeAnnual: "https://buy.stripe.com/8x28wQ864f7V3lKfja3AY0d",
    }
  ];

  useEffect(() => {
    // GSAP ScrollTrigger disabled — commented out to avoid opacity traps
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
              🌐 1 Gbps · Nuremberg 🇩🇪
            </span>
          </div>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${billing === 'monthly' ? 'bg-white text-gray-900 shadow-md' : 'text-white/60 hover:text-white'}`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 ${billing === 'annual' ? 'bg-accent-green text-gray-900 shadow-md' : 'text-white/60 hover:text-white'}`}
            >
              <Calendar size={14} />
              Anual
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${billing === 'annual' ? 'bg-gray-900/20 text-gray-900' : 'bg-accent-green/20 text-accent-green'}`}>
                1 pago
              </span>
            </button>
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
                  {billing === 'monthly' ? (
                    <>
                      <span className="text-white/30 font-bold text-xl line-through decoration-red-500/50 block mb-1">
                        {plan.originalPrice}
                      </span>
                      <div className="flex items-end justify-center font-heading text-6xl font-bold text-white tracking-tighter leading-none">
                        {plan.monthlyPrice}
                        <span className="text-white/50 text-sm mb-2 ml-1 uppercase font-sans font-medium tracking-wide">/ mes</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-end justify-center font-heading text-6xl font-bold text-white tracking-tighter leading-none">
                        {plan.annualPrice}
                        <span className="text-white/50 text-sm mb-2 ml-1 uppercase font-sans font-medium tracking-wide">/ año</span>
                      </div>
                      <span className="text-accent-green/80 text-xs font-bold mt-1">
                        = {plan.monthlyEquiv}/mes · 1 solo pago
                      </span>
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {[
                  `${plan.name} RAM dedicada`,
                  "Procesador AMD EPYC (Hetzner CX53)",
                  "1 Gbps de ancho de banda",
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
                onClick={() => handleSubscribe(billing === 'annual' ? plan.stripeAnnual : plan.stripeMonthly, plan.ramGb)}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-heading font-black text-sm uppercase tracking-widest transition-all duration-300 mt-auto
                ${plan.popular
                  ? 'bg-accent-green text-gray-900 hover:bg-[#1faa50] shadow-[0_10px_20px_rgba(34,197,94,0.2)] hover:-translate-y-1'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20 hover:-translate-y-1'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {billing === 'annual' ? 'Pagar anualmente' : 'Crear servidor'}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section specifically for plugins + mods */}
        <div className="mt-20 max-w-4xl mx-auto p-8 rounded-[2rem] bg-[#1a2333]/30 border border-white/10 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/10 rounded-full blur-[80px] -z-10"></div>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex-1">
              <h3 className="text-xl font-heading font-black uppercase tracking-wide text-white mb-4 flex items-center gap-3">
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
