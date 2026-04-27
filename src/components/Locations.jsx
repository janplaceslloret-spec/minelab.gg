import React from 'react';
import { MapPin, Server, Activity } from 'lucide-react';
import ServerMap from './ServerMap';

const Locations = () => {
  return (
    <section id="locations" className="py-24 bg-[#0B0F1A] border-y border-white/5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-green/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10 w-full">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white uppercase mb-4">
            SERVIDORES <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-violet">DISPONIBLES</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Infraestructura optimizada para ofrecer baja latencia en Europa. Expandiendo nuestra red global próximamente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* SVG Map Section */}
          <div className="lg:col-span-8 relative">
            <div className="w-full relative aspect-[2/1] md:aspect-[2.2/1] bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden p-4 md:p-8 flex items-center justify-center">
              
              <ServerMap />
            </div>
          </div>

          {/* Latency and Details list */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <div className="bg-[#111827]/80 backdrop-blur-sm border border-accent-green/20 rounded-xl p-5 shadow-[0_0_20px_rgba(34,197,94,0.05)] relative overflow-hidden group hover:border-accent-green/40 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-green/10 blur-xl rounded-full -mr-10 -mt-10 group-hover:bg-accent-green/20 transition-colors"></div>
              
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">
                <MapPin size={12} /> EUROPA
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent-green z-10 relative"></div>
                      <div className="absolute inset-0 bg-accent-green animate-ping rounded-full opacity-75"></div>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Europa 🇪🇺</h4>
                      <p className="text-white/50 text-xs">AMD última generación · NVMe ultra-rápido</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-accent-green text-xs font-bold uppercase tracking-wider bg-accent-green/10 px-2 py-1 rounded-md">
                    <Activity size={12} /> Alta
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming block */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 border-dashed relative overflow-hidden opacity-70">
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
                <Server size={12} /> FUTURAS UBICACIONES
              </div>
              <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between opacity-50">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      <span className="text-white/80 text-sm">España — Madrid</span>
                   </div>
                   <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2 py-0.5 rounded">Próximamente</span>
                 </div>
                 <div className="flex items-center justify-between opacity-50">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      <span className="text-white/80 text-sm">Estados Unidos — Miami</span>
                   </div>
                   <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2 py-0.5 rounded">Próximamente</span>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Locations;
