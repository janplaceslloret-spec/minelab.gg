import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
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
    <div className="top-bar" style={{ background: '#0B0F1A', borderBottom: '1px solid rgba(34,197,94,0.15)', position: 'fixed', top: 0, left: 0, right: 0, width: '100%', zIndex: 50, height: '48px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>

        {/* Left Side: Counter & Promotional Text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

          {/* Countdown Badge */}
          <div style={{ background: 'rgba(74,222,128,0.2)', border: '1px dashed #4ADE80', borderRadius: '8px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', lineHeight: 1 }}>⏰</span>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, letterSpacing: '-0.5px', color: 'white', fontSize: '13px', whiteSpace: 'nowrap' }}>
              {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>

          {/* Promotional Text */}
          <span style={{ color: 'white', fontSize: '13px', fontWeight: 400, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
            ¡Obtén&nbsp;<strong style={{ fontWeight: 700 }}>ACCESO ANTICIPADO</strong>&nbsp;a la beta por un precio exclusivo!
            <img src="/flecha-verde.png" alt="→" style={{ width: '20px', height: 'auto', marginLeft: '8px' }} />
          </span>

        </div>

        {/* Right Side: Stats & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>

          {/* Dynamic Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', whiteSpace: 'nowrap' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '16px', lineHeight: 1 }}>→</span>
            <span style={{ color: 'white' }}>
              <strong style={{ color: '#4ADE80' }}>97</strong> jugadores en <strong style={{ color: '#4ADE80' }}>29</strong> servidores 📦
            </span>
          </div>

          {/* CTA Button */}
          <button
            onClick={isLoggedIn ? onOpenDashboard : onLoginDemo}
            style={{ background: '#ffffff', color: '#000000', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
            onMouseEnter={e => e.target.style.background = '#e5e7eb'}
            onMouseLeave={e => e.target.style.background = '#ffffff'}
          >
            {isLoggedIn ? 'IR AL PANEL' : 'SOLICITAR ACCESO'}
          </button>

        </div>

      </div>
    </div>
  );
};

export default Topbar;
