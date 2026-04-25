import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, ShieldBan, Box, TerminalSquare, DatabaseBackup, ServerOff } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const sectionRef = useRef(null);

  const features = [
    {
      icon: <Bot className="text-accent-green" size={32} />,
      title: "Instalación de plugins por IA",
      desc: "Pide el plugin por chat. Nosotros nos encargamos de descargar la versión correcta y enlazar las bases de datos si es necesario."
    },
    {
      icon: <ServerOff className="text-accent-violet" size={32} />,
      title: "Detección automática de errores",
      desc: "Nuestra IA escanea tus logs en tiempo real. Si detecta un error de plugin, lo arregla o te avisa antes de que el servidor crashee."
    },
    {
      icon: <Box className="text-white" size={32} />,
      title: "Soporte para modpacks",
      desc: "Instaladores de 1 clic para Forge y Fabric, con soporte directo para las librerías necesarias con cero esfuerzo."
    },
    {
      icon: <TerminalSquare className="text-accent-green" size={32} />,
      title: "Consola inteligente",
      desc: "No más consolas horribles. Traducimos los logs crudos a un lenguaje humano comprensible desde el dashboard."
    },
    {
      icon: <DatabaseBackup className="text-accent-violet" size={32} />,
      title: "Backups automáticos",
      desc: "La IA sabe cuándo vas a instalar algo grande y hace un backup automático antes. Nunca pierdas tu progreso."
    },
    {
      icon: <ShieldBan className="text-white" size={32} />,
      title: "Protección Anti-DDoS",
      desc: "Filtramos ataques a nivel 7 sin afectar el ping de los jugadores reales. Protección Enterprise siempre activa."
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-32 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-20">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            El fin de las <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-violet">consolas arcaicas</span>.
          </h2>
          <p className="text-white/60 text-lg max-w-2xl">
            Todo el poder técnico que necesitas, envasado en una experiencia fluida y controlada por Inteligencia Artificial.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="feature-card group bg-[#111827] border border-white/10 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:border-accent-green/50 hover:shadow-[0_10px_40px_rgba(34,197,94,0.15)] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 rounded-full blur-[50px] group-hover:bg-accent-green/20 transition-colors duration-500"></div>
              
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                {feat.icon}
              </div>
              <h3 className="font-heading font-black text-xl mb-3">{feat.title}</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
