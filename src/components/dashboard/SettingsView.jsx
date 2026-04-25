import React, { useState } from 'react';
import { User, Shield, Zap, Settings, FolderSync, Copy, Check, RefreshCw, Loader2, Eye, EyeOff, Plug } from 'lucide-react';
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
const SettingsView = ({ planStatus, user, server, onServerUpdate, memberRole = 'owner' }) => {
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
                {planStatus !== 'none' && (
                  <div className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                    <Zap size={10} className="fill-current" /> Activo
                  </div>
                )}
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
    </div>
  );
};

export default SettingsView;
