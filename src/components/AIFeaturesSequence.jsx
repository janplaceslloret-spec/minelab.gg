import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { Bot, Play, AlertTriangle, CheckCircle, Download, FileJson, ServerCrash, Power, Terminal } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const AIFeaturesSequence = () => {
  const containerRef = useRef(null);
  
  // Refs for the 5 animation steps
  const step1Ref = useRef(null); // Chat Plugin
  const step2Ref = useRef(null); // Error Detection
  const step3Ref = useRef(null); // Modpack Install
  const step4Ref = useRef(null); // Server.properties
  const step5Ref = useRef(null); // Crash Detection

  // Content text refs for left side
  const textsRef = useRef([]);
  textsRef.current = [];
  const addToTexts = (el) => {
    if (el && !textsRef.current.includes(el)) {
      textsRef.current.push(el);
    }
  };

  useEffect(() => {
    // 1. PINNING THE CONTAINER
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=5000", // 5000px of scrolling
        pin: true,
        scrub: 1,
        anticipatePin: 1
      }
    });

    const steps = [step1Ref.current, step2Ref.current, step3Ref.current, step4Ref.current, step5Ref.current];

    // Initialize: hide all except first
    gsap.set(steps.slice(1), { autoAlpha: 0, y: 50, scale: 0.95 });
    gsap.set(textsRef.current.slice(1), { autoAlpha: 0, y: 30 });
    
    // Animate Step 1 (Chat simulates typing)
    tl.to(".chat-typing", { autoAlpha: 1, duration: 0.5, delay: 0.2 })
      .to(".chat-result", { autoAlpha: 1, y: 0, duration: 0.5 });

    // Transition 1 -> 2
    tl.to(step1Ref.current, { autoAlpha: 0, y: -50, scale: 0.95, duration: 1 })
      .to(textsRef.current[0], { autoAlpha: 0, y: -30, duration: 1 }, "<")
      .to(step2Ref.current, { autoAlpha: 1, y: 0, scale: 1, duration: 1 }, "<")
      .to(textsRef.current[1], { autoAlpha: 1, y: 0, duration: 1 }, "<")
      // Animate Step 2
      .to(".console-error", { backgroundColor: "rgba(239, 68, 68, 0.1)", borderLeftColor: "#ef4444", duration: 0.5 })
      .to(".console-fix", { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.2 })
      .to(".console-result", { autoAlpha: 1, y: 0, duration: 0.5 });

    // Transition 2 -> 3
    tl.to(step2Ref.current, { autoAlpha: 0, y: -50, scale: 0.95, duration: 1, delay: 0.5 })
      .to(textsRef.current[1], { autoAlpha: 0, y: -30, duration: 1 }, "<")
      .to(step3Ref.current, { autoAlpha: 1, y: 0, scale: 1, duration: 1 }, "<")
      .to(textsRef.current[2], { autoAlpha: 1, y: 0, duration: 1 }, "<")
      // Animate Step 3
      .to(".progress-bar-fill", { width: "100%", duration: 1.5, ease: "power1.inOut" })
      .to(".mod-item-1", { opacity: 1, x: 0, duration: 0.3 }, "-=1.2")
      .to(".mod-item-2", { opacity: 1, x: 0, duration: 0.3 }, "-=0.9")
      .to(".mod-item-3", { opacity: 1, x: 0, duration: 0.3 }, "-=0.6")
      .to(".modpack-result", { autoAlpha: 1, scale: 1, duration: 0.4 });

    // Transition 3 -> 4
    tl.to(step3Ref.current, { autoAlpha: 0, y: -50, scale: 0.95, duration: 1, delay: 0.5 })
      .to(textsRef.current[2], { autoAlpha: 0, y: -30, duration: 1 }, "<")
      .to(step4Ref.current, { autoAlpha: 1, y: 0, scale: 1, duration: 1 }, "<")
      .to(textsRef.current[3], { autoAlpha: 1, y: 0, duration: 1 }, "<")
      // Animate Step 4
      .to(".code-cursor", { x: 120, duration: 0.5 })
      .to(".code-text-true", { autoAlpha: 0, display: "none", duration: 0.1 })
      .to(".code-text-false", { autoAlpha: 1, display: "inline", duration: 0.1 })
      .to(".code-save-badge", { autoAlpha: 1, scale: 1, duration: 0.4 });

    // Transition 4 -> 5
    tl.to(step4Ref.current, { autoAlpha: 0, y: -50, scale: 0.95, duration: 1, delay: 0.5 })
      .to(textsRef.current[3], { autoAlpha: 0, y: -30, duration: 1 }, "<")
      .to(step5Ref.current, { autoAlpha: 1, y: 0, scale: 1, duration: 1 }, "<")
      .to(textsRef.current[4], { autoAlpha: 1, y: 0, duration: 1 }, "<")
      // Animate Step 5
      .to(".crash-bg", { backgroundColor: "rgba(220, 38, 38, 0.15)", duration: 0.2 })
      .to(".crash-scan", { height: "100%", duration: 1.5, ease: "linear" })
      .to(".crash-bg", { backgroundColor: "rgba(34, 197, 94, 0.1)", duration: 0.5 })
      .to(".crash-icon", { autoAlpha: 0, duration: 0.2 }, "<")
      .to(".online-icon", { autoAlpha: 1, duration: 0.2 }, "<")
      .to(".crash-text", { text: "Servidor online.", color: "#22c55e", duration: 0.2 }, "<");

    return () => tl.kill();
  }, []);

  return (
    <section ref={containerRef} className="h-screen w-full bg-[#0B0F1A] relative flex items-center overflow-hidden border-y border-white/5">
      {/* Absolute Header purely for context */}
      <div className="absolute top-12 left-0 right-0 text-center z-10 px-6">
        <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tighter text-white/40 uppercase mb-2">
          Todo lo que puede hacer MineLab
        </h2>
        <p className="text-white/60 text-sm tracking-widest uppercase">
          Tu servidor de Minecraft gestionado por inteligencia artificial.
        </p>
      </div>

      <div className="container mx-auto px-6 max-w-7xl w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Text Story (Positioned Absolutely to overlap perfectly) */}
          <div className="relative h-[300px] flex items-center">
            
            {/* Text 1 */}
            <div ref={addToTexts} className="absolute left-0 right-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-green/30 bg-accent-green/10 text-accent-green text-[10px] font-bold uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span>
                Autonomía Nivel 1
              </div>
              <h3 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tighter leading-none">
                INSTALA PLUGINS <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-violet">HABLANDO</span>
              </h3>
              <p className="text-lg text-white/60 max-w-md">
                Pídeselo a la IA por chat. Ella busca la versión compatible, resuelve dependencias y lo instala sin tocar FTP.
              </p>
            </div>

            {/* Text 2 */}
            <div ref={addToTexts} className="absolute left-0 right-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                <AlertTriangle size={12} />
                Vigilancia 24/7
              </div>
              <h3 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tighter leading-none">
                DETECCIÓN DE <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">ERRORES</span>
              </h3>
              <p className="text-lg text-white/60 max-w-md">
                Si falta una librería o un plugin entra en bucle, la IA intercepta el error en consola y lo repara antes de que te des cuenta.
              </p>
            </div>

            {/* Text 3 */}
            <div ref={addToTexts} className="absolute left-0 right-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-blue/30 bg-accent-blue/10 text-accent-blue text-[10px] font-bold uppercase tracking-widest mb-4">
                <Download size={12} />
                1-Click Deploy
              </div>
              <h3 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tighter leading-none">
                INSTALACIÓN DE <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-accent-violet">MODPACKS</span>
              </h3>
              <p className="text-lg text-white/60 max-w-md">
                ¿Quieres jugar un modpack pesado? La IA descarga cientos de mods, configura Forge/Fabric y ajusta la RAM automáticamente.
              </p>
            </div>

            {/* Text 4 */}
            <div ref={addToTexts} className="absolute left-0 right-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white/80 text-[10px] font-bold uppercase tracking-widest mb-4">
                <FileJson size={12} />
                Gestión de Configs
              </div>
              <h3 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tighter leading-none">
                EDICIÓN <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">AUTOMÁTICA</span>
              </h3>
              <p className="text-lg text-white/60 max-w-md">
                Pide un cambio a la IA ("Quita el premium") y editará el archivo <code>server.properties</code> por ti en milisegundos.
              </p>
            </div>

            {/* Text 5 */}
            <div ref={addToTexts} className="absolute left-0 right-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                <ServerCrash size={12} />
                Resiliencia
              </div>
              <h3 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tighter leading-none">
                PREVENCIÓN DE <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900">CRASHES</span>
              </h3>
              <p className="text-lg text-white/60 max-w-md">
                Si el servidor cae catastróficamente, la IA aísla la causa (Out Of Memory, End Loop), aplica la solución y reinicia tu mundo.
              </p>
            </div>

          </div>

          {/* Right Side: Visual Demos (Stacked absolutely) */}
          <div className="relative h-[450px] w-full max-w-lg mx-auto perspective-1000">
            
            {/* Step 1: Chat UI */}
            <div ref={step1Ref} className="absolute inset-0 bg-[#0B0F1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col transform rotate-y-[-5deg] rotate-x-[5deg]">
              <div className="bg-white/5 border-b border-white/10 p-3 flex items-center justify-between">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div></div>
                <span className="text-[10px] text-white/30 font-mono tracking-widest">MINELAB_AI_CORE</span>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-4 justify-end">
                <div className="bg-[#1E293B] p-3 rounded-lg rounded-br-sm text-sm text-white/90 self-end max-w-[85%]">
                  instala simple voice chat
                </div>
                <div className="chat-typing opacity-0 bg-white/5 p-3 rounded-lg rounded-bl-sm text-xs text-white/60 self-start max-w-[85%] font-mono space-y-2">
                  <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span> Buscando plugin...</p>
                  <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span> Comprobando dependencias</p>
                  <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span> Descargando archivos</p>
                </div>
                <div className="chat-result opacity-0 translate-y-4 bg-accent-green/10 border border-accent-green/30 p-3 rounded-lg text-xs text-accent-green self-start max-w-[85%] flex items-center gap-2 font-bold">
                  <CheckCircle size={14} /> Plugin instalado correctamente.
                </div>
              </div>
            </div>

            {/* Step 2: Error Console */}
            <div ref={step2Ref} className="absolute inset-0 bg-[#0B0F1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
              <div className="bg-black/50 p-4 flex-1 flex flex-col gap-2">
                <p className="text-white/40">[14:32:01 INFO]: Starting minecraft server version 1.20.1</p>
                <p className="text-white/40">[14:32:02 INFO]: Loading properties</p>
                <div className="console-error p-2 border-l-2 border-transparent transition-colors duration-500">
                  <p className="text-red-500 font-bold">[14:32:04 FATAL]: ERROR Missing dependency Fabric API</p>
                </div>
                <div className="console-fix opacity-0 translate-y-4 p-2 bg-yellow-500/10 border-l-2 border-yellow-500 mt-2">
                  <p className="text-yellow-500 flex items-center gap-2"><Bot size={12}/> AI: Analizando logs...</p>
                  <p className="text-yellow-500 flex items-center gap-2"><Bot size={12}/> AI: Detectando error: Faltan librerías CORE.</p>
                  <p className="text-yellow-500 flex items-center gap-2"><Bot size={12}/> AI: Download fabric-api-0.85.0.jar</p>
                </div>
                <div className="console-result opacity-0 translate-y-4 mt-2 pl-2">
                  <p className="text-accent-green font-bold">[14:32:06 INFO]: Servidor reparado. Iniciando mundo...</p>
                </div>
              </div>
            </div>

            {/* Step 3: Modpack Progress */}
            <div ref={step3Ref} className="absolute inset-0 bg-[#0B0F1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                 <Download size={24} className="text-white animate-bounce" />
               </div>
               <h4 className="font-heading text-white font-bold mb-6 tracking-tight uppercase">Instalando Modpack</h4>
               
               <div className="w-full space-y-3 mb-8">
                 <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                   <div className="progress-bar-fill h-full w-0 bg-accent-green shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                 </div>
                 <div className="flex justify-between text-[10px] text-white/40 font-mono uppercase">
                   <span>Archivos transferidos</span>
                   <span>1.2 GB / 1.2 GB</span>
                 </div>
               </div>

               <div className="w-full space-y-2 text-[10px] font-mono text-white/60">
                 <p className="mod-item-1 opacity-0 -translate-x-4 flex justify-between"><span>Create Mod</span> <span className="text-accent-green">DONE</span></p>
                 <p className="mod-item-2 opacity-0 -translate-x-4 flex justify-between"><span>JEI</span> <span className="text-accent-green">DONE</span></p>
                 <p className="mod-item-3 opacity-0 -translate-x-4 flex justify-between"><span>Terralith</span> <span className="text-accent-green">DONE</span></p>
               </div>

               <div className="modpack-result absolute bottom-6 opacity-0 scale-90 px-4 py-2 bg-accent-green/10 text-accent-green text-xs font-bold rounded-full border border-accent-green/30 uppercase tracking-widest mt-6">
                 Servidor Listo
               </div>
            </div>

            {/* Step 4: Server Properties Edit */}
            <div ref={step4Ref} className="absolute inset-0 bg-[#1E1E1E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
              <div className="bg-[#2D2D2D] p-2 flex items-center gap-2 border-b border-black">
                <FileJson size={14} className="text-yellow-400" />
                <span className="text-white/80">server.properties</span>
              </div>
              <div className="p-4 flex-1 text-white/60 leading-loose relative">
                <p>#Minecraft server properties</p>
                <p>#Fri Jul 21 14:00:22 UTC 2024</p>
                <p>enable-jmx-monitoring=false</p>
                <p>rcon.port=25575</p>
                <p>level-seed=</p>
                <p>gamemode=survival</p>
                <p>enable-command-block=true</p>
                <p className="relative inline-block text-white">
                  online-mode=<span className="code-text-true text-red-400 bg-red-400/20 px-1">true</span><span className="code-text-false hidden text-accent-green bg-accent-green/20 px-1">false</span>
                  <span className="code-cursor absolute top-1/2 -translate-y-1/2 left-[5.5rem] w-2 h-4 bg-white/80 animate-pulse"></span>
                </p>
                <p>max-players=20</p>
                
                <div className="code-save-badge absolute bottom-4 right-4 opacity-0 scale-90 px-3 py-1 bg-white/10 text-white text-[10px] rounded backdrop-blur uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-green rounded-full"></div> Guardando...
                </div>
              </div>
            </div>

            {/* Step 5: Crash Prevention */}
            <div ref={step5Ref} className="absolute inset-0 bg-[#0B0F1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center crash-bg">
              {/* Scanline effect */}
              <div className="absolute top-0 left-0 right-0 h-0 bg-gradient-to-b from-transparent via-white/10 to-transparent crash-scan"></div>
              
              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="w-20 h-20 mb-6 bg-black/40 rounded-full flex items-center justify-center backdrop-blur relative">
                  <Power size={32} className="text-red-500 absolute crash-icon" />
                  <Power size={32} className="text-accent-green absolute online-icon opacity-0" />
                </div>
                <h4 className="font-heading text-2xl font-bold uppercase tracking-tighter text-white mb-2">SYSTEM STATUS</h4>
                <p className="crash-text text-red-500 font-mono text-xs tracking-widest uppercase">Server crashed.</p>
              </div>

               {/* Overlay Logs */}
               <div className="absolute bottom-4 left-4 right-4 h-16 bg-black/50 rounded overflow-hidden text-[8px] font-mono text-white/30 p-2 leading-tight">
                 <p>&gt; Exception in server tick loop</p>
                 <p>&gt; java.lang.OutOfMemoryError: Java heap space</p>
                 <p className="text-yellow-500 mt-1">&gt; AI: Resolving OOM constraint. Adapting JVM args...</p>
                 <p className="text-accent-green">&gt; AI: Restarting node in safe mode.</p>
               </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AIFeaturesSequence;
