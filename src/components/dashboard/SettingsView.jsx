import React, { useState } from 'react';
import { User, Shield, Zap, Settings, FolderSync, Copy, Check, RefreshCw, Loader2, Eye, EyeOff, Plug, ArrowUpRight, TrendingUp, Sparkles, X, ChevronUp, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import MembersCard from './MembersCard';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_MC_API_KEY;

const SFTP_HOST = '46.225.115.78';
const SFTP_PORT = 22;

/* ── Small copy button ─────────────────────────────────────────── */
const CopyBtn = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={copy} className="p-1 rounded hover:bg-[#2A2A2A] text-[#6B6B6B] hover:text-white transition-colors">
      {copied ? <Check size={13} className="text-[#22C55E]" /> : <Copy size={13} />}
    </button>
  );
};

/* ── Credential row ────────────────────────────────────────────── */
const CredRow = ({ label, value, secret = false }) => {
  const [show, setShow] = useState(!secret);
  return (
    <div className="flex flex-col gap-1 pb-4 border-b border-[#2A2A2A] last:border-0 last:pb-0">
      <span className="text-[#6B6B6B] text-[10px] uppercase font-bold tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[#E5E5E5] font-mono text-sm flex-1 truncate">
          {secret && !show ? '•'.repeat(Math.min(value.length, 16)) : value}
        </span>
        {secret && (
          <button onClick={() => setShow(s => !s)} className="p-1 rounded hover:bg-[#2A2A2A] text-[#6B6B6B] hover:text-white transition-colors">
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
        <CopyBtn value={value} />
      </div>
    </div>
  );
};

/* ── Main component ────────────────────────────────────────────── */
const PLAN_OPTIONS = [
  { id: 'pro_4gb',  ram: 4,  price_v2: '7,99',  label: 'Pro 4 GB',  desc: '5-10 jugadores · vanilla / paper ligero' },
  { id: 'pro_6gb',  ram: 6,  price_v2: '10,99', label: 'Pro 6 GB',  desc: '10-20 jugadores · paper + plugins · mods ligeros' },
  { id: 'pro_8gb',  ram: 8,  price_v2: '14,99', label: 'Pro 8 GB',  desc: '20-30 jugadores · ATM medio · Better MC' },
  { id: 'pro_12gb', ram: 12, price_v2: '21,99', label: 'Pro 12 GB', desc: '30-50 jugadores · ATM10 · Vault Hunters' },
  { id: 'pro_16gb', ram: 16, price_v2: '24,99', label: 'Pro 16 GB', desc: '50+ jugadores · grandes comunidades · max mods' },
];

const SettingsView = ({ planStatus, user, server, onServerUpdate, memberRole = 'owner' }) => {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeRequesting, setUpgradeRequesting] = useState(false);
  const [upgradeResponse, setUpgradeResponse] = useState(null);

  const requestUpgrade = async (targetPlan) => {
    setUpgradeRequesting(true);
    setUpgradeResponse(null);
    try {
      const r = await fetch('https://api.fluxoai.co/api/billing/upgrade-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: server?.id, target_plan: targetPlan }),
      });
      const j = await r.json();
      setUpgradeResponse(j);
    } catch (e) {
      setUpgradeResponse({ ok: false, manual: true, message: 'No se pudo conectar al servicio de upgrade. Contáctanos.', contact: { discord: 'https://discord.gg/wUJZkQxAQk', email: 'janplaceslloret@gmail.com' } });
    } finally {
      setUpgradeRequesting(false);
    }
  };

  const [sftpLoading, setSftpLoading] = useState(false);
  const [sftpError, setSftpError]     = useState('');

  const hasSftp = !!(server?.sftp_user && server?.sftp_pass);

  /* Provision SFTP for this server */
  const activateSftp = async () => {
    if (!server?.id) return;
    setSftpLoading(true);
    setSftpError('');
    try {
      const res = await fetch(`${API_URL}/api/sftp/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ server_id: server.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      // Persist credentials in mc_servers row
      const { error: dbErr } = await supabase
        .from('mc_servers')
        .update({ sftp_user: data.username, sftp_pass: data.password })
        .eq('id', server.id);
      if (dbErr) throw new Error(dbErr.message);

      // Refresh server object in parent
      if (onServerUpdate) onServerUpdate({ ...server, sftp_user: data.username, sftp_pass: data.password });
    } catch (err) {
      setSftpError(err.message);
    } finally {
      setSftpLoading(false);
    }
  };

  /* Reset SFTP password */
  const resetSftpPassword = async () => {
    if (!server?.id) return;
    setSftpLoading(true);
    setSftpError('');
    try {
      const res = await fetch(`${API_URL}/api/sftp/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ server_id: server.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      const { error: dbErr } = await supabase
        .from('mc_servers')
        .update({ sftp_pass: data.password })
        .eq('id', server.id);
      if (dbErr) throw new Error(dbErr.message);

      if (onServerUpdate) onServerUpdate({ ...server, sftp_pass: data.password });
    } catch (err) {
      setSftpError(err.message);
    } finally {
      setSftpLoading(false);
    }
  };

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
            <div className="flex flex-col gap-1 pb-4 border-b border-[#2A2A2A]">
              <span className="text-[#6B6B6B] text-[10px] uppercase font-bold tracking-widest">ID de Cuenta (UUID)</span>
              <span className="text-[#B3B3B3] font-mono text-xs truncate select-all">{user?.id}</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('minelab-welcome-seen');
                window.location.reload();
              }}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 text-[#22C55E] py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors"
            >
              <Sparkles size={12} />
              Ver tour de bienvenida otra vez
            </button>
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#FFFFFF] text-lg font-black uppercase">{planStatus === 'none' ? 'Sin Plan' : planStatus.replace(/_/g, ' ')}</span>
                {planStatus !== 'none' && (
                  <div className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                    <Zap size={10} className="fill-current" /> Activo
                  </div>
                )}
                {planStatus !== 'none' && server && !server.stripe_subscription_id && (
                  <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                    🛡️ Founder
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 pb-4 border-b border-[#2A2A2A]">
              <span className="text-[#6B6B6B] text-[10px] uppercase font-bold tracking-widest">Servidores Activos</span>
              <span className="text-[#E5E5E5] font-medium">{server ? '1 / 1' : '0 / 1'} servidor(es) en uso</span>
            </div>

            {/* Upgrade plan: abre modal de upgrade in-place (NO redirige a /configurar) */}
            {planStatus && planStatus !== 'none' && planStatus !== 'pro_16gb' && (
              <div className="rounded-xl border-2 border-[#22C55E]/25 bg-gradient-to-br from-[#22C55E]/[0.06] via-transparent to-transparent p-4 mb-2">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/40 flex items-center justify-center shrink-0">
                    <TrendingUp size={16} className="text-[#22C55E]" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black text-sm uppercase tracking-tight mb-0.5">
                      ¿Necesitas más RAM?
                    </p>
                    <p className="text-[#8B8B8B] text-xs leading-relaxed">
                      Sube de plan conservando tu servidor, mundo y configs.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setUpgradeModalOpen(true); setUpgradeResponse(null); }}
                  className="w-full bg-[#22C55E]/15 hover:bg-[#22C55E]/25 border border-[#22C55E]/40 text-[#22C55E] py-2 rounded-lg text-xs font-black uppercase tracking-[0.15em] transition-colors text-center inline-flex items-center justify-center gap-1.5"
                >
                  Cambiar plan <ChevronUp size={12} strokeWidth={3} />
                </button>
              </div>
            )}

            {/* Si tiene suscripción Stripe real → portal Stripe.
                Si no (Founder Members + asignados manualmente) → contacto soporte */}
            {server?.stripe_subscription_id ? (
              <>
                <a
                  href="https://billing.stripe.com/p/login/eVadRua7ygSU6kU288"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full bg-[#22C55E] hover:bg-[#1eb754] text-[#0A0A0A] py-2.5 rounded-lg text-sm font-black uppercase tracking-wider transition-colors text-center inline-flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(34,197,94,0.25)]"
                >
                  Gestionar facturación →
                </a>
                <p className="text-[#6B6B6B] text-[10px] mt-2 text-center">
                  Cancela, cambia tarjeta o descarga facturas. Te enviaremos un link a {user?.email || 'tu email'}.
                </p>
              </>
            ) : planStatus !== 'none' ? (
              <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">🛡️ Founder Member</p>
                <p className="text-[#B3B3B3] text-xs leading-relaxed mb-3">
                  Tu plan está congelado al precio antiguo (gracias por estar desde el principio).
                  Para cualquier cambio (RAM, cancelación, factura), escríbeme directamente y lo resolvemos en minutos.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="https://discord.gg/wUJZkQxAQk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/40 text-[#9aa5ff] py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition-colors"
                  >
                    💬 Discord (Jan)
                  </a>
                  <a
                    href="mailto:janplaceslloret@gmail.com?subject=Founder%20-%20cambio%20de%20plan"
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition-colors"
                  >
                    ✉️ Email directo
                  </a>
                </div>
              </div>
            ) : (
              <a
                href="/configurar?plan=6gb&billing=monthly"
                className="mt-2 w-full bg-[#22C55E] hover:bg-[#1eb754] text-[#0A0A0A] py-2.5 rounded-lg text-sm font-black uppercase tracking-wider transition-colors text-center inline-flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(34,197,94,0.25)]"
              >
                Activar plan →
              </a>
            )}
          </div>
        </div>

        {/* Members / Invite Card — only for server owner */}
        {server && memberRole === 'owner' && (
          <MembersCard server={server} user={user} />
        )}

        {/* SFTP / FileZilla Card */}
        {server && (
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-xl p-6 flex flex-col shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[#22C55E] text-lg font-bold flex items-center gap-2">
                <FolderSync size={18} /> Acceso SFTP / FileZilla
              </h3>
              {hasSftp && (
                <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                  <Plug size={10} /> Activo
                </span>
              )}
            </div>
            <p className="text-[#6B6B6B] text-sm mb-6">
              Conecta con FileZilla u otro cliente SFTP para gestionar los archivos de tu servidor directamente desde tu PC.
            </p>

            {hasSftp ? (
              <div className="flex flex-col gap-0">
                <CredRow label="Host"     value={SFTP_HOST} />
                <CredRow label="Puerto"   value={String(SFTP_PORT)} />
                <CredRow label="Usuario"  value={server.sftp_user} />
                <CredRow label="Contraseña" value={server.sftp_pass} secret />

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={resetSftpPassword}
                    disabled={sftpLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-[#1F2937]/60 hover:bg-[#1F2937] border border-[#374151] text-[#E5E5E5] transition-colors disabled:opacity-50"
                  >
                    {sftpLoading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                    Nueva contraseña
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-4">
                <div className="w-full bg-[#0B0B0B] border border-[#2A2A2A] rounded-xl p-4 text-sm text-[#B3B3B3] space-y-1">
                  <p className="font-semibold text-[#E5E5E5] mb-1">¿Cómo funciona?</p>
                  <p>1. Pulsa "Activar SFTP" para generar tus credenciales.</p>
                  <p>2. Abre FileZilla y conecta con los datos que aparecerán aquí.</p>
                  <p>3. Navega y edita los archivos de tu servidor en tiempo real.</p>
                </div>
                <button
                  onClick={activateSftp}
                  disabled={sftpLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-[#22C55E] hover:bg-[#1faa50] text-[#0B0B0B] transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
                >
                  {sftpLoading ? <Loader2 size={15} className="animate-spin" /> : <FolderSync size={15} />}
                  Activar SFTP
                </button>
              </div>
            )}

            {sftpError && (
              <p className="mt-4 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                Error: {sftpError}
              </p>
            )}
          </div>
        )}

      </div>

      {/* Modal upgrade plan */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6" onClick={() => !upgradeRequesting && setUpgradeModalOpen(false)}>
          <div className="w-full max-w-2xl bg-[#0A0A0A] border border-[#22C55E]/15 rounded-2xl shadow-[0_30px_80px_-20px_rgba(34,197,94,0.25)] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="relative px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-white/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/8 via-transparent to-transparent pointer-events-none" />
              <button onClick={() => !upgradeRequesting && setUpgradeModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                <X size={16} />
              </button>
              <p className="text-[10px] uppercase font-black text-[#22C55E] tracking-[0.25em] mb-2 relative">◆ Cambiar plan</p>
              <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tighter relative">Sube de RAM en segundos</h3>
              <p className="text-white/60 text-sm mt-2 relative">
                Conservas tu mundo, plugins, mods y configuración. La RAM se aplica en el próximo reinicio.
              </p>
            </div>

            <div className="p-6 md:p-8">
              {upgradeResponse ? (
                /* Respuesta del backend */
                <div className="flex flex-col gap-4">
                  <div className={`rounded-xl border-2 p-5 ${upgradeResponse.manual ? 'border-amber-500/30 bg-amber-500/5' : 'border-[#22C55E]/30 bg-[#22C55E]/5'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${upgradeResponse.manual ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-[#22C55E]/15 border border-[#22C55E]/30'}`}>
                        {upgradeResponse.manual ? <AlertCircle size={18} className="text-amber-300" /> : <Check size={18} className="text-[#22C55E]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-black text-sm mb-1">
                          {upgradeResponse.manual ? '¡Casi! Lo gestionamos manualmente' : 'Upgrade en proceso'}
                        </p>
                        <p className="text-white/70 text-xs leading-relaxed">{upgradeResponse.message}</p>
                      </div>
                    </div>
                  </div>

                  {upgradeResponse.manual && upgradeResponse.contact && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a href={upgradeResponse.contact.discord} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/40 text-[#9aa5ff] text-xs font-bold uppercase tracking-wider transition-colors">
                        💬 Discord
                      </a>
                      <a href={`mailto:${upgradeResponse.contact.email}?subject=Upgrade%20de%20plan%20MineLab`} className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors">
                        ✉️ Email directo
                      </a>
                    </div>
                  )}

                  <button onClick={() => { setUpgradeModalOpen(false); setUpgradeResponse(null); }} className="mt-2 w-full py-2.5 text-white/40 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors">
                    Cerrar
                  </button>
                </div>
              ) : (
                /* Lista de planes */
                <div className="flex flex-col gap-3">
                  {PLAN_OPTIONS.filter(p => p.id !== planStatus).map(p => {
                    const currentRam = parseInt((planStatus || '').replace(/[^0-9]/g, ''), 10) || 0;
                    const isUpgrade = p.ram > currentRam;
                    return (
                      <button
                        key={p.id}
                        onClick={() => requestUpgrade(p.id)}
                        disabled={upgradeRequesting}
                        className={`text-left p-4 rounded-xl border-2 transition-all group disabled:opacity-50 disabled:cursor-not-allowed
                          ${isUpgrade
                            ? 'border-[#22C55E]/25 bg-gradient-to-br from-[#22C55E]/[0.04] to-transparent hover:border-[#22C55E]/60 hover:from-[#22C55E]/10'
                            : 'border-[#1F1F1F] bg-[#0F0F0F]/50 hover:border-white/20'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${isUpgrade ? 'bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E]' : 'bg-white/5 border border-white/10 text-white/40'}`}>
                            {p.ram}GB
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-white font-black text-sm">{p.label}</p>
                              {isUpgrade && <span className="text-[9px] uppercase font-black text-[#22C55E] tracking-wider px-1.5 py-0.5 rounded bg-[#22C55E]/10">↑ Upgrade</span>}
                              {!isUpgrade && <span className="text-[9px] uppercase font-black text-white/40 tracking-wider px-1.5 py-0.5 rounded bg-white/5">Downgrade</span>}
                            </div>
                            <p className="text-white/55 text-xs">{p.desc}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-white font-black text-base">{p.price_v2}€</p>
                            <p className="text-white/40 text-[10px]">/mes</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {upgradeRequesting && (
                    <div className="flex items-center justify-center gap-2 py-3 text-white/60 text-xs">
                      <Loader2 size={14} className="animate-spin" /> Procesando…
                    </div>
                  )}
                  <p className="text-[10px] text-white/30 text-center mt-2">
                    Si eres Founder Member, te aplicamos el upgrade manualmente para conservar el precio congelado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
