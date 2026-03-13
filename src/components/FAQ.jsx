import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  const contentRef = useRef(null);

  return (
    <div className={`border border-white/10 rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]' : 'bg-transparent hover:bg-white/[0.02]'}`}>
      <button
        onClick={onClick}
        className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
      >
        <span className="font-semibold text-white md:text-lg pr-8">{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'bg-accent-green text-gray-900 rotate-45' : 'bg-white/10 text-white'}`}>
          <Plus size={18} />
        </div>
      </button>
      
      <div 
        ref={contentRef}
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{ height: isOpen ? `${contentRef.current?.scrollHeight}px` : '0px' }}
      >
        <div className="px-6 pb-6 text-white/60 leading-relaxed pt-2 border-t border-white/5 mx-6">
          {answer}
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "¿Necesito saber programar para usar MineLab?",
      a: "No. MineLab está diseñado para que cualquier jugador pueda crear y gestionar un servidor de Minecraft sin tocar archivos complejos ni configuraciones avanzadas."
    },
    {
      q: "¿Cómo funciona la inteligencia artificial?",
      a: "La IA analiza errores comunes del servidor y puede ayudarte a instalar plugins, resolver dependencias o corregir configuraciones automáticamente mediante chat de lenguaje natural."
    },
    {
      q: "¿Puedo instalar mods o plugins?",
      a: "Sí. Puedes pedirle a la IA que instale plugins o mods compatibles y el sistema se encarga de buscar versiones correctas e instalarlas."
    },
    {
      q: "¿Los precios beta son para siempre?",
      a: "Sí. Los usuarios que compren durante la beta mantendrán ese precio de forma permanentemente y no se verán afectados por futuras subidas."
    },
    {
      q: "¿Dónde están alojados los servidores?",
      a: "Actualmente los servidores están ubicados en infraestructuras premium en Alemania (Frankfurt/Nuremberg) para garantizar la latencia estimada más baja y la mejor estabilidad en Europa."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-[#080B14] relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-3xl relative z-10 w-full">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white uppercase mb-4">
            PREGUNTAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-violet">FRECUENTES</span>
          </h2>
          <p className="text-white/60 text-lg">
            Todo lo que necesitas saber sobre nuestra tecnología de hosting IA.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <FAQItem 
              key={idx} 
              question={faq.q} 
              answer={faq.a} 
              isOpen={openIndex === idx} 
              onClick={() => setOpenIndex(active => active === idx ? -1 : idx)} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
