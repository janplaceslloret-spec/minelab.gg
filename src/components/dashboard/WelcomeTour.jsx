import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight, ChevronLeft, Bot, Activity, Folder, Users, Settings } from 'lucide-react';

const STORAGE_KEY = 'minelab-welcome-seen';

const STEPS = [
  {
    icon: Sparkles,
    title: '¡Bienvenido a MineLab!',
    body: 'Tu servidor ya está creado y arrancando. Te guiamos por las 4 cosas más importantes que puedes hacer desde aquí.',
    bullet: '📍 Empezamos →',
  },
  {
    icon: Bot,
    title: 'Habla con la IA',
    body: 'Pide cualquier cosa al asistente: "instala EssentialsX", "cambia a Fabric 1.21.4", "ban Pepito", "instala un modpack RLCraft". La IA lo hace por ti — sin tocar archivos.',
    bullet: 'Sidebar derecho · Asistente IA',
  },
  {
    icon: Activity,
    title: 'Consola en tiempo real',
    body: 'Dashboard / Consola: ves logs en directo y puedes mandar comandos como /op, /say, /list. Todo lo que harías por SSH, sin SSH.',
    bullet: 'Pestaña Consola',
  },
  {
    icon: Folder,
    title: 'Backups + archivos',
    body: 'Crea backups en 1 click y descárgalos como .tar.gz. Puedes editar cualquier archivo desde el navegador (server.properties, plugins/), o conectar por SFTP con FileZilla.',
    bullet: 'Pestaña Backups · Archivos · Configuración',
  },
  {
    icon: Settings,
    title: 'Listo para jugar',
    body: 'Tu IP y puerto están en el dashboard, arriba a la izquierda. Cópialos y conecta. Si necesitas ayuda — el chat IA + el Discord oficial son la primera parada.',
    bullet: '¡Disfruta!',
  },
];

export default function WelcomeTour({ user, server }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user || !server || !server.ready) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Espera 1 segundo para que el panel termine de cargar y luego abre
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, [user, server]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ seen: true, at: Date.now() }));
    setOpen(false);
  };

  if (!open) return null;

  const isLast = step === STEPS.length - 1;
  const s = STEPS[step];
  const Icon = s.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={close}>
      <div
        className="w-full max-w-lg bg-[#0F0F0F] border-2 border-[#22C55E]/25 rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(34,197,94,0.4)]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'welcomeIn 0.3s cubic-bezier(0.2,0.8,0.2,1)' }}
      >
        {/* Header con dots de progreso */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-[#22C55E]' : i < step ? 'w-2 bg-[#22C55E]/40' : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B6B6B] hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Cerrar tour"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/40 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <Icon size={28} className="text-[#22C55E]" strokeWidth={2.2} />
          </div>
          <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-3 leading-tight">
            {s.title}
          </h2>
          <p className="text-[#B3B3B3] text-sm leading-relaxed mb-4 max-w-sm mx-auto">
            {s.body}
          </p>
          <p className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.2em]">
            {s.bullet}
          </p>
        </div>

        {/* Footer nav */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#0A0A0A] flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-[#B3B3B3] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
            Atrás
          </button>
          <span className="text-[10px] uppercase font-black text-[#6B6B6B] tracking-[0.2em]">
            {step + 1} / {STEPS.length}
          </span>
          {isLast ? (
            <button
              onClick={close}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#22C55E] text-[#0A0A0A] text-xs font-black uppercase tracking-[0.15em] hover:bg-[#1eb754] transition-colors shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
            >
              Empezar
              <Sparkles size={12} />
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#22C55E] text-[#0A0A0A] text-xs font-black uppercase tracking-[0.15em] hover:bg-[#1eb754] transition-colors shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
            >
              Siguiente
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes welcomeIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
