import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ChevronLeft, RefreshCw, Activity } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ENDPOINTS = [
  {
    id: 'api',
    label: 'Panel y API',
    subtitle: 'Backend mc-api · gestión de servidores',
    url: 'https://api.fluxoai.co/health',
    parse: 'json',
    test: (data) => data?.ok === true,
  },
  {
    id: 'web',
    label: 'Sitio web',
    subtitle: 'minelab.gg · landing y panel',
    // Si esta página carga, el sitio claramente está vivo. Asumimos OK directamente.
    self: true,
  },
  {
    id: 'auth',
    label: 'Sistema de cuentas',
    subtitle: 'Login con Google · Supabase Auth',
    // Usamos el cliente Supabase ya configurado — getSession() no falla aunque no haya
    // sesión, pero sí lo hace si Supabase Auth está caído. Así verificamos sin claves
    // hardcoded ni CORS issues.
    custom: async () => {
      const { error } = await supabase.auth.getSession();
      return !error;
    },
  },
];

const Pill = ({ status }) => {
  if (status === 'loading') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-wider">
      <Loader2 size={11} className="animate-spin" />
      Comprobando…
    </span>
  );
  if (status === 'ok') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-green/10 border border-accent-green/30 text-accent-green text-xs font-bold uppercase tracking-wider">
      <span className="relative flex w-1.5 h-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green"></span>
      </span>
      Operativo
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider">
      <XCircle size={11} />
      Caído
    </span>
  );
};

export default function StatusPage() {
  const [statuses, setStatuses] = useState(() => Object.fromEntries(ENDPOINTS.map(e => [e.id, 'loading'])));
  const [lastCheck, setLastCheck] = useState(null);

  const runChecks = async () => {
    setStatuses(Object.fromEntries(ENDPOINTS.map(e => [e.id, 'loading'])));
    await Promise.all(ENDPOINTS.map(async (e) => {
      // Self-check (este propio sitio cargado = vivo)
      if (e.self) {
        setStatuses(prev => ({ ...prev, [e.id]: 'ok' }));
        return;
      }
      // Custom probe (función async que devuelve true/false)
      if (typeof e.custom === 'function') {
        try {
          const ok = await e.custom();
          setStatuses(prev => ({ ...prev, [e.id]: ok ? 'ok' : 'fail' }));
        } catch {
          setStatuses(prev => ({ ...prev, [e.id]: 'fail' }));
        }
        return;
      }
      // Default: HTTP fetch
      try {
        const res = await fetch(e.url, {
          method: 'GET',
          mode: 'cors',
          headers: e.headers || {},
        });
        let ok = res.ok;
        if (ok && e.parse === 'json') {
          try {
            const data = await res.json();
            if (typeof e.test === 'function') ok = !!e.test(data);
          } catch {
            ok = false;
          }
        }
        setStatuses(prev => ({ ...prev, [e.id]: ok ? 'ok' : 'fail' }));
      } catch {
        setStatuses(prev => ({ ...prev, [e.id]: 'fail' }));
      }
    }));
    setLastCheck(new Date());
  };

  useEffect(() => {
    runChecks();
    const t = setInterval(runChecks, 60000); // refresh cada 1 min
    return () => clearInterval(t);
  }, []);

  const allOk = Object.values(statuses).every(s => s === 'ok');
  const anyLoading = Object.values(statuses).some(s => s === 'loading');
  const anyFail = Object.values(statuses).some(s => s === 'fail');

  let bannerColor = 'border-white/10 bg-white/[0.02] text-white/70';
  let bannerText = 'Comprobando estado…';
  let bannerEmoji = '⏱️';
  if (!anyLoading) {
    if (allOk) {
      bannerColor = 'border-accent-green/30 bg-accent-green/[0.06] text-accent-green';
      bannerText = 'Todos los servicios operativos';
      bannerEmoji = '🟢';
    } else if (anyFail) {
      bannerColor = 'border-red-500/30 bg-red-500/[0.06] text-red-300';
      bannerText = 'Hay un servicio con problemas — estamos investigando';
      bannerEmoji = '🚨';
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white">
      <header className="sticky top-0 z-30 bg-[#0A0D14]/85 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between max-w-4xl">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-bold uppercase tracking-wider transition-colors">
            <ChevronLeft size={16} />
            MineLab
          </Link>
          <span className="font-black text-lg tracking-tight uppercase">Estado</span>
          <button
            onClick={runChecks}
            className="text-white/60 hover:text-white transition-colors"
            title="Refrescar ahora"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
        <div className="mb-10">
          <p className="text-[10px] uppercase font-black text-accent-green tracking-[0.3em] mb-3 flex items-center gap-2">
            <Activity size={11} />
            Status público
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-black uppercase tracking-tight leading-[0.95] mb-4">
            ESTADO DEL <span className="text-accent-green">SERVICIO</span>
          </h1>
          <p className="text-white/60 max-w-xl">
            Comprobamos en tiempo real desde tu navegador. Se actualiza cada minuto.
            Para alertas en directo, únete a nuestro <a href="https://discord.gg/wUJZkQxAQk" className="text-accent-green hover:underline">Discord</a>.
          </p>
        </div>

        {/* Banner global */}
        <div className={`rounded-2xl border-2 px-6 py-5 mb-6 flex items-center gap-4 ${bannerColor}`}>
          <span className="text-3xl">{bannerEmoji}</span>
          <div>
            <p className="font-black text-lg uppercase tracking-tight">{bannerText}</p>
            {lastCheck && (
              <p className="text-xs opacity-70 mt-0.5">
                Última comprobación: {lastCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        {/* Service rows */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
          {ENDPOINTS.map((e) => (
            <div key={e.id} className="flex items-center justify-between p-5">
              <div>
                <p className="text-white font-black text-base uppercase tracking-tight">{e.label}</p>
                <p className="text-white/50 text-sm mt-0.5">{e.subtitle}</p>
              </div>
              <Pill status={statuses[e.id]} />
            </div>
          ))}
        </div>

        {/* Subscribe / community */}
        <div className="mt-12 grid md:grid-cols-2 gap-4">
          <a
            href="https://discord.gg/wUJZkQxAQk"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-accent-green/30 p-5 transition-all group"
          >
            <p className="text-[10px] uppercase font-black text-accent-green tracking-[0.2em] mb-2">Notificaciones</p>
            <p className="font-black text-white uppercase tracking-tight mb-1">Discord oficial</p>
            <p className="text-white/60 text-sm">
              Avisos en tiempo real cuando algo se cae o vuelve a la normalidad.
            </p>
          </a>
          <Link
            to="/configurar?plan=6gb&billing=monthly"
            className="rounded-2xl border border-accent-green/40 bg-accent-green/[0.06] hover:bg-accent-green/[0.1] p-5 transition-all group"
          >
            <p className="text-[10px] uppercase font-black text-accent-green tracking-[0.2em] mb-2">¿Aún no tienes server?</p>
            <p className="font-black text-white uppercase tracking-tight mb-1">Crear servidor →</p>
            <p className="text-white/60 text-sm">
              Desde 5€/mes. IA gestiona los plugins, mods y errores.
            </p>
          </Link>
        </div>

        <p className="text-center text-white/40 text-xs mt-12">
          Comprobaciones desde tu navegador.
          Para histórico detallado de uptime: <a href="https://discord.gg/wUJZkQxAQk" className="text-accent-green/70 hover:text-accent-green underline">canal #estado en Discord</a>.
        </p>
      </main>
    </div>
  );
}
