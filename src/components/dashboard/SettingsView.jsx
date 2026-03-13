import React from 'react';
import { User, Server, Database, Shield, Zap, Settings } from 'lucide-react';

const SettingsView = ({ planStatus, user, server }) => {
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex flex-col gap-1 mb-2">
          <h2 className="text-[#FFFFFF] text-2xl font-black uppercase tracking-tight flex items-center gap-3">
             <Settings className="text-[#22C55E]" size={24} /> Ajustes de Cuenta
          </h2>
          <p className="text-[#B3B3B3] text-sm">Gestiona la información de tu cuenta, suscripción y facturación.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Account Profile Card */}
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-xl p-6 flex flex-col shadow-sm">
             <h3 className="text-[#22C55E] text-lg font-bold mb-6 flex items-center gap-2">
               <User size={18} /> Perfil del Usuario
             </h3>
             <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-1 pb-4 border-b border-[#2A2A2A]">
                  <span className="text-[#6B6B6B] text-[10px] uppercase font-bold tracking-widest">Nombre completo</span>
                  <span className="text-[#E5E5E5] font-medium">{user?.user_metadata?.full_name || 'No especificado'}</span>
               </div>
               <div className="flex flex-col gap-1 pb-4 border-b border-[#2A2A2A]">
                  <span className="text-[#6B6B6B] text-[10px] uppercase font-bold tracking-widest">Correo Electrónico</span>
                  <span className="text-[#E5E5E5] font-medium">{user?.email || 'No disponible'}</span>
               </div>
               <div className="flex flex-col gap-1 pb-4">
                  <span className="text-[#6B6B6B] text-[10px] uppercase font-bold tracking-widest">ID de Cuenta (UUID)</span>
                  <span className="text-[#B3B3B3] font-mono text-xs truncate select-all">{user?.id}</span>
               </div>
             </div>
          </div>

          {/* Active Subscription Card */}
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-xl p-6 flex flex-col shadow-sm">
             <h3 className="text-[#22C55E] text-lg font-bold mb-6 flex items-center gap-2">
               <Shield size={18} /> Plan y Suscripción
             </h3>
             <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-1 pb-4 border-b border-[#2A2A2A]">
                  <span className="text-[#6B6B6B] text-[10px] uppercase font-bold tracking-widest">Plan Actual</span>
                  <div className="flex items-center gap-2">
                     <span className="text-[#FFFFFF] text-lg font-black uppercase">{planStatus === 'none' ? 'Sin Plan' : planStatus.replace(/_/g, ' ')}</span>
                     {planStatus !== 'none' && <div className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1"><Zap size={10} className="fill-current" /> Activo</div>}
                  </div>
               </div>
               <div className="flex flex-col gap-1 pb-4 border-b border-[#2A2A2A]">
                  <span className="text-[#6B6B6B] text-[10px] uppercase font-bold tracking-widest">Servidores Activos</span>
                  <span className="text-[#E5E5E5] font-medium">{server ? '1 / 1' : '0 / 1'} servidor(es) en uso</span>
               </div>
               <button 
                  className="mt-2 w-full bg-[#1F2937]/50 hover:bg-[#1F2937] border border-[#374151] text-[#E5E5E5] py-2.5 rounded-lg text-sm font-bold transition-colors"
                  onClick={() => alert('La gestión de suscripción estará disponible próximamente en el portal de Stripe.')}
               >
                  Gestionar Suscripción
               </button>
             </div>
          </div>

       </div>
    </div>
  );
};

export default SettingsView;
