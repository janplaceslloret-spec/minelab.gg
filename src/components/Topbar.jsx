import React, { useState, useEffect } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Topbar = ({ isLoggedIn, onLoginDemo, onOpenDashboard }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 w-full z-50 bg-gradient-to-r from-[#0B0F1A] via-[#0B0F1A] to-accent-green/20 border-b border-accent-green/10 shadow-[0_0_15px_rgba(34,197,94,0.15)] backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row items-center justify-between py-2 md:py-2.5 gap-3 md:gap-4">
        
        {/* Left Side: Counter & Promotional Text */}
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
          
          {/* Dashboard-style Pill Counter */}
          <div className="flex items-center gap-2 bg-black/60 border border-dashed border-accent-green/50 rounded-full px-3 py-1 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
            <Clock size={12} className="text-accent-green animate-pulse" />
            <span className="font-mono font-bold text-white text-xs tracking-widest">
              {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>

          {/* Promotional Text */}
          <div className="flex flex-col items-center md:items-start leading-tight">
            <span className="text-white font-bold tracking-wide text-[11px] md:text-sm uppercase flex items-center gap-1.5">
              <Sparkles size={14} className="text-yellow-400" />
              ACCESO ANTICIPADO A LA BETA DE MINELAB
            </span>
            <span className="text-white/60 font-medium text-[9px] md:text-[11px] tracking-wide mt-0.5">
              Los primeros usuarios mantienen precio reducido de por vida
            </span>
          </div>

        </div>

        {/* Right Side: Stats & CTA */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          
          {/* Dynamic Stats */}
          <div className="hidden md:flex items-center gap-1.5 text-accent-green/80 font-medium text-xs tracking-wide">
            <span className="opacity-70">→</span>
            <span><strong className="text-white">193</strong> jugadores en <strong className="text-white">58</strong> servidores</span>
          </div>

          {/* Action CTA Button */}
          <button 
            onClick={isLoggedIn ? onOpenDashboard : onLoginDemo}
            className="bg-white/90 hover:bg-white text-gray-900 px-5 py-1.5 rounded-lg text-[11px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] border border-white flex items-center justify-center min-w-[150px]"
          >
            {isLoggedIn ? 'Ir al Panel' : 'Solicitar Acceso'}
          </button>
          
        </div>

      </div>
    </div>
  );
};

export default Topbar;
