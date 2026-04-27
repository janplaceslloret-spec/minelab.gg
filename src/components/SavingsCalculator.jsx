import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Regla aproximada para servidores Paper/Spigot: ~1 GB por cada 8-10 jugadores activos + 2 GB base.
function recommendedRam(players) {
  if (players <= 10) return 4;
  if (players <= 20) return 6;
  if (players <= 30) return 8;
  return 12;
}

export default function SavingsCalculator() {
  const [ram, setRam] = useState(4);
  const [players, setPlayers] = useState(8);

  const recRam = recommendedRam(players);
  const ramTooLow = ram < recRam;

  const { aternosCost, minelabCost, savings } = useMemo(() => {
    // Apex Hosting precios reales (USD→EUR aprox, 2026)
    const apexBase = ram <= 4 ? 16.99 : ram <= 6 ? 24.99 : ram <= 8 ? 32.99 : 44.99;
    // MineLab precios v2 (4GB=7,99€ · 6GB=10,99€ · 8GB=14,99€ · 12GB=21,99€ · 16GB=24,99€)
    const minelabBase = ram <= 4 ? 7.99 : ram <= 6 ? 10.99 : ram <= 8 ? 14.99 : ram <= 12 ? 21.99 : 24.99;
    return { aternosCost: apexBase, minelabCost: minelabBase, savings: Math.max(0, apexBase - minelabBase) };
  }, [ram]);

  const aternosBar = Math.min(100, (aternosCost / 45) * 100);
  const minelabBar = Math.min(100, (minelabCost / 45) * 100);
  const apexPerPlayer = aternosCost / players;
  const minelabPerPlayer = minelabCost / players;

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-transparent to-accent-green/[0.05] p-6 md:p-10 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent-green/10 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent-green/80">Calculadora live</span>
          <span className="h-px flex-1 bg-gradient-to-r from-accent-green/40 to-transparent" />
        </div>
        <h3 className="font-heading text-2xl md:text-4xl font-black text-white mb-2 leading-tight">¿Cuánto te ahorras al mes?</h3>
        <p className="text-white/60 mb-8 max-w-2xl">Mueve los sliders. Comparativa real entre Apex Hosting y MineLab según RAM equivalente.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <label className="block">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-white/70">RAM</span>
              <span className="font-heading text-2xl font-black text-accent-green">{ram} GB</span>
            </div>
            <input type="range" min="4" max="12" step="1" value={ram} onChange={(e) => setRam(Number(e.target.value))} className="w-full accent-accent-green" />
          </label>
          <label className="block">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-white/70">Jugadores</span>
              <span className="font-heading text-2xl font-black text-accent-violet">{players}</span>
            </div>
            <input type="range" min="2" max="50" step="1" value={players} onChange={(e) => setPlayers(Number(e.target.value))} className="w-full accent-accent-violet" />
          </label>
        </div>

        <div className="mb-8">
          {ramTooLow ? (
            <button
              onClick={() => setRam(recRam)}
              className="w-full rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 flex items-center justify-between gap-3 hover:bg-yellow-500/15 transition-colors group"
            >
              <span className="flex items-center gap-2.5 text-sm">
                <span className="text-yellow-300 text-base">⚠️</span>
                <span className="text-yellow-100 text-left">
                  Para <strong className="text-white">{players}</strong> jugadores recomendamos al menos{' '}
                  <strong className="text-white">{recRam} GB</strong>. Con {ram} GB puede haber lag.
                </span>
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-yellow-300 whitespace-nowrap group-hover:text-yellow-200">
                Ajustar →
              </span>
            </button>
          ) : (
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.06] px-4 py-3 flex items-center gap-2.5 text-sm">
              <span className="text-accent-green text-base">✓</span>
              <span className="text-white/85">
                <strong className="text-white">{ram} GB</strong> es suficiente para <strong className="text-white">{players}</strong> jugadores activos.
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between items-baseline text-sm mb-2">
              <span className="text-white/70">Apex Hosting</span>
              <span className="flex items-baseline gap-2">
                <span className="text-white/40 text-xs font-mono">{apexPerPlayer.toFixed(2)} €/jugador</span>
                <span className="font-heading font-black text-white">{aternosCost.toFixed(2)} €/mes</span>
              </span>
            </div>
            <div className="h-3 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-400/60 to-red-500/60 transition-all duration-700" style={{ width: `${aternosBar}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-baseline text-sm mb-2">
              <span className="text-accent-green font-semibold">MineLab</span>
              <span className="flex items-baseline gap-2">
                <span className="text-accent-green/60 text-xs font-mono">{minelabPerPlayer.toFixed(2)} €/jugador</span>
                <span className="font-heading font-black text-accent-green">{minelabCost.toFixed(2)} €/mes</span>
              </span>
            </div>
            <div className="h-3 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-green to-emerald-300 transition-all duration-700" style={{ width: `${minelabBar}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-accent-green/30 bg-accent-green/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-accent-green/80 font-bold">Ahorro anual</p>
            <p className="font-heading text-4xl md:text-5xl font-black text-white">{(savings * 12).toFixed(0)} €</p>
          </div>
          <Link to="/configurar?plan=6gb&billing=monthly" className="inline-flex items-center gap-2 rounded-full bg-accent-green px-6 py-3 text-sm font-bold text-[#0B1220] hover:bg-accent-green/90 transition-colors whitespace-nowrap">
            Crear servidor <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
