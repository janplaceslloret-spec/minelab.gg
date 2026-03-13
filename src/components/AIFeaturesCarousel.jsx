import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AlertTriangle, Download, FileJson, ServerCrash, Cpu, Terminal } from 'lucide-react';

// Subcomponent for the Terminal Animation inside cards
const TerminalAnimation = ({ type, isActive }) => {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!isActive) {
      setLines([]);
      return;
    }

    let timeouts = [];
    
    // Animation definition based on the feature type
    if (type === "plugins") {
      timeouts.push(setTimeout(() => setLines(['> instala simple voice chat']), 500));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="text-white/50">buscando plugin...</span>']), 1200));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="text-accent-blue">descargando...</span>']), 2000));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="text-accent-green">instalando... ¡Listo!</span>']), 2800));
    } else if (type === "errors") {
      timeouts.push(setTimeout(() => setLines(['<span class="text-red-500 font-bold">[WARN] ERROR missing dependency</span>']), 500));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="text-yellow-500">IA detecta el error...</span>']), 1500));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="text-accent-blue">resolviendo...</span>']), 2200));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="text-accent-green">instalando dependencia (Vault)... OK</span>']), 3000));
    } else if (type === "crash") {
      timeouts.push(setTimeout(() => setLines(['<span class="text-red-500 font-bold text-lg bg-red-500/20 px-2">FATAL: Server crashed</span>']), 500));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="text-yellow-500">analizando causa (java.lang.OutOfMemoryError)...</span>']), 1500));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="text-accent-green">aislando chunks corruptos...</span>']), 2500));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="text-accent-violet font-bold">reiniciando servidor...</span>']), 3500));
    } else if (type === "modpacks") {
      timeouts.push(setTimeout(() => setLines(['> instalar ATM9']), 500));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="text-white/50">Preparando entorno Forge 47.1.3...</span>']), 1200));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, 'Descargando 412 mods <span class="text-accent-green">[||||||||||] 100%</span>']), 2000));
    } else if (type === "files") {
      timeouts.push(setTimeout(() => setLines(['> quita el premium']), 500));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="text-white/50">Localizando server.properties...</span>']), 1000));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="line-through text-red-400">online-mode=true</span>']), 1800));
      timeouts.push(setTimeout(() => setLines(prev => [...prev, '<span class="text-accent-green font-bold">online-mode=false</span>']), 2200));
    }

    return () => timeouts.forEach(clearTimeout);
  }, [isActive, type]);

  if (!isActive) return null;

  return (
    <div className="w-full mt-6 bg-[#0B0F1A] rounded-xl border border-white/10 font-mono text-sm text-left h-36 flex flex-col relative shadow-inner overflow-hidden">
      {/* Header (fixed at top) */}
      <div className="flex gap-1.5 border-b border-white/5 p-3 w-full bg-[#0B0F1A] z-10 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
      </div>
      {/* Logs container (sliding up) */}
      <div className="flex flex-col justify-end p-4 flex-1 overflow-hidden">
        <div className="flex flex-col gap-1">
          {lines.map((line, i) => (
            <div key={i} className="text-white/80 animate-in fade-in slide-in-from-bottom-2 duration-300" dangerouslySetInnerHTML={{ __html: line }}></div>
          ))}
          <div className="w-2 h-4 bg-white/50 animate-pulse mt-1"></div>
        </div>
      </div>
    </div>
  );
};

const AIFeaturesCarousel = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef(null);
  
  const features = [
    {
      id: "plugins",
      title: "INSTALA PLUGINS HABLANDO",
      desc: "Pídeselo a la IA por chat. Ella busca la versión compatible, resuelve dependencias y lo instala en segundos sin tocar FTP.",
      icon: <Terminal size={32} className="text-accent-green" />,
      color: "from-accent-green/20 to-transparent",
      borderColor: "border-accent-green/30"
    },
    {
      id: "errors",
      title: "IA DETECTA ERRORES",
      desc: "Si falta una librería o un plugin entra en bucle, la IA intercepta el error en consola y lo repara automáticamente antes de que te des cuenta.",
      icon: <AlertTriangle size={32} className="text-yellow-500" />,
      color: "from-yellow-500/20 to-transparent",
      borderColor: "border-yellow-500/30"
    },
    {
      id: "modpacks",
      title: "INSTALA MODPACKS AUTOMÁTICAMENTE",
      desc: "¿Quieres jugar un modpack pesado? La IA descarga cientos de mods, configura Forge/Fabric y ajusta la RAM sin que hagas nada.",
      icon: <Download size={32} className="text-accent-blue" />,
      color: "from-blue-500/20 to-transparent",
      borderColor: "border-blue-500/30"
    },
    {
      id: "files",
      title: "GESTIONA ARCHIVOS DEL SERVIDOR",
      desc: "Di 'quita el premium' y la IA editará el archivo server.properties por ti en milisegundos. Olvídate de buscar parámetros en archivos yaml.",
      icon: <FileJson size={32} className="text-white" />,
      color: "from-white/20 to-transparent",
      borderColor: "border-white/30"
    },
    {
      id: "crash",
      title: "REPARA CRASHES AUTOMÁTICAMENTE",
      desc: "Si el servidor cae catastróficamente (OOM), la IA aísla la causa, aplica la solución y reinicia tu mundo de forma segura.",
      icon: <ServerCrash size={32} className="text-red-500" />,
      color: "from-red-500/20 to-transparent",
      borderColor: "border-red-500/30"
    }
  ];

  useEffect(() => {
    // Auto-advance every 6 seconds to give time for animations to finish
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % features.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [features.length]);

  return (
    <section id="features" className="py-24 bg-[#0B0F1A] border-y border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10 w-full">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white uppercase mb-4">
            Todo lo que puede hacer <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-violet">MineLab</span>
          </h2>
          <p className="text-white/60 text-sm tracking-widest uppercase">
            Tu servidor gestionado íntegramente por Inteligencia Artificial.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto" ref={containerRef}>
          
          {/* Main Visual Display (The overlapping cards effect) */}
          <div className="relative h-[650px] md:h-[500px] w-full flex items-center justify-center">
            {features.map((feat, idx) => {
              // Calculate offset relative to active card
              let offset = idx - activeIdx;
              if (offset < -2) offset += features.length;
              if (offset > 2) offset -= features.length;
              
              const isActive = offset === 0;
              const isVisible = Math.abs(offset) <= 1;

              // GSAP-like smooth interpolation via Tailwind arbitrary values & styles
              let translateX = offset * 110; 
              let scale = isActive ? 1 : 0.85;
              let zIndex = 10 - Math.abs(offset);
              let opacity = isActive ? 1 : (isVisible ? 0.3 : 0);

              return (
                <div 
                  key={idx}
                  className="absolute transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] w-full max-w-lg cursor-pointer"
                  style={{
                    transform: `translateX(${translateX}%) scale(${scale})`,
                    zIndex: zIndex,
                    opacity: opacity,
                    pointerEvents: isActive ? 'auto' : 'none'
                  }}
                  onClick={() => setActiveIdx(idx)}
                >
                  <div className={`p-8 md:p-10 bg-[#111827] border ${feat.borderColor} rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col items-center text-center group`}>
                    
                    <div className={`absolute inset-0 bg-gradient-to-b ${feat.color} opacity-20 pointer-events-none`}></div>
                    
                    <div className="relative z-10 mb-6 glass-panel p-4 rounded-2xl w-20 h-20 flex items-center justify-center border-white/10 shadow-lg">
                      {feat.icon}
                    </div>
                    
                    <h3 className="relative z-10 font-heading text-2xl md:text-3xl font-bold text-white mb-4 uppercase tracking-tighter leading-tight">
                      {feat.title}
                    </h3>
                    
                    <p className="relative z-10 text-white/70 leading-relaxed max-w-sm">
                      {feat.desc}
                    </p>

                    {/* Highly Requested Tech Demo UI inside the card */}
                    <div className="relative z-10 w-full transition-all duration-500 min-h-[160px]">
                      <TerminalAnimation type={feat.id} isActive={isActive} />
                    </div>
                    
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-3 mt-12">
            {features.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${activeIdx === idx ? 'w-12 bg-accent-green shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default AIFeaturesCarousel;
