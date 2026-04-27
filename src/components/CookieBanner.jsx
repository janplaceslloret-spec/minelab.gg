import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'minelab-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner if no choice has been made yet
    const t = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, at: Date.now() }));
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, at: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50 bg-[#0F1116] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-accent-green/15 border border-accent-green/30 flex items-center justify-center shrink-0">
          <Cookie size={16} className="text-accent-green" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-black text-sm uppercase tracking-tight mb-1">Cookies & Privacidad</h3>
          <p className="text-white/65 text-xs leading-relaxed">
            Usamos cookies estrictamente necesarias para el login y el panel.
            No vendemos tus datos. Más info en{' '}
            <a href="/#privacidad" className="text-accent-green hover:underline">privacidad</a>.
          </p>
        </div>
        <button
          onClick={reject}
          className="text-white/40 hover:text-white/70 transition-colors shrink-0 -mt-1 -mr-1"
          aria-label="Cerrar"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={reject}
          className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/70 text-xs font-bold uppercase tracking-wider hover:bg-white/5 hover:text-white transition-colors"
        >
          Solo necesarias
        </button>
        <button
          onClick={accept}
          className="flex-1 py-2.5 rounded-lg bg-accent-green text-gray-900 text-xs font-black uppercase tracking-wider hover:bg-[#1faa50] transition-colors shadow-[0_8px_20px_rgba(34,197,94,0.25)]"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
