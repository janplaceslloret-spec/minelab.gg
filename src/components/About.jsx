import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef(null);

  const cards = [
    {
      title: "QUIÉNES SOMOS",
      text: "MINELAB nació como un proyecto personal tras años gestionando servidores de Minecraft y viendo lo complicado que puede ser configurarlos correctamente. La idea es simple: que cualquier jugador pueda crear y gestionar su propio servidor sin tener que tocar archivos complicados ni entender configuraciones técnicas. Combinando automatización e inteligencia artificial, MINELAB intenta simplificar todo el proceso para que montar un servidor sea tan fácil como escribir lo que quieres que pase.",
      colSpan: "col-span-1 md:col-span-2",
      bgImage: "/images/JROHAHT42NEQZCHQ5NOCKUUXJ4.jpg"
    },
    {
      title: "NUESTRA VISIÓN",
      text: "Democratizar la creación de servidores. Que cualquier jugador, sin saber programar, pueda montar el próximo hypixel.",
      colSpan: "col-span-1",
      bgImage: "/images/526724605_1074285831478811_4217211402672146491_n.jpg"
    },
    {
      title: "NUESTRA TECNOLOGÍA",
      text: "MINELAB combina automatización avanzada con modelos de inteligencia artificial entrenados para entender errores comunes en servidores de Minecraft y solucionarlos automáticamente. La plataforma está diseñada para aprender constantemente de nuevos errores y configuraciones.",
      colSpan: "col-span-1",
      bgImage: "/images/125196842_115615357026048_4549367980099405439_n.jpg"
    },
    {
      title: "NUESTRA COMUNIDAD",
      text: "Más de 300 personas ya están dentro de nuestra comunidad de Discord siguiendo el desarrollo del proyecto. Actualmente hay más de 15 servidores activos probando MINELAB durante la fase beta. Gran parte de las mejoras del sistema vienen directamente del feedback de esta comunidad.",
      colSpan: "col-span-1 md:col-span-2",
      bgImage: "/images/515502898_1074285658145495_5507178639223054620_n.jpg"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".about-card", 
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out"
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-24 min-h-screen relative z-10 bg-[#0B0F1A] flex flex-col justify-center">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tighter mb-4 uppercase">
            Sobre <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-violet to-accent-green">MINELAB</span>
          </h2>
          <p className="text-white/60 text-lg uppercase tracking-widest text-sm">Impulsando la próxima generación del gaming multijugador.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div key={idx} className={`about-card group relative p-10 rounded-[2rem] bg-[#111827] border border-white/5 overflow-hidden transition-all duration-500 hover:border-accent-green/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(34,197,94,0.1)] ${card.colSpan}`}>
              
              {/* Image Background */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-40 transition-opacity duration-700 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105"
                style={{
                  backgroundImage: `url('${card.bgImage}')`
                }}
              ></div>

              {/* Gradient dark overlay to ensure text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#111827]/80 to-transparent"></div>
              
              {/* Subtle hover accent light */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end min-h-[200px]">
                <h3 className="font-heading text-2xl font-bold mb-4 uppercase tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-accent-green transition-all duration-300">
                  {card.title}
                </h3>
                <p className="text-white/80 leading-relaxed group-hover:text-white transition-colors duration-300 font-medium">
                  {card.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
