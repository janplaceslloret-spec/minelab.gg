import React from 'react';
import { Sparkles, Server } from 'lucide-react';

const EmptyServerState = ({ onStartWizard }) => {
  return (
    <main className="flex-1 flex flex-col bg-[#121212] relative z-10 min-w-0 min-h-screen items-center justify-center p-8">
      
      <div className="max-w-md w-full text-center flex flex-col items-center">
        
        <div className="w-20 h-20 rounded-full bg-[#171717] border border-[#2A2A2A] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
          <Server size={32} className="text-[#B3B3B3]" />
        </div>
        
        <h2 className="text-3xl font-bold font-heading text-[#FFFFFF] tracking-tight mb-3">
          No tienes ningún servidor activo todavía.
        </h2>
        
        <p className="text-[#B3B3B3] text-sm mb-10 leading-relaxed">
          Crea tu primer servidor de Minecraft en segundos.
        </p>

        <button 
          onClick={onStartWizard}
          className="px-8 py-4 bg-[#22C55E] hover:bg-[#1faa50] text-[#0B0B0B] rounded-xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider transition-all shadow-[0_10px_30px_rgba(34,197,94,0.2)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(34,197,94,0.3)] w-full sm:w-auto"
        >
          <Sparkles size={18} className="fill-current" />
          Crear servidor
        </button>

      </div>

    </main>
  );
};

export default EmptyServerState;
