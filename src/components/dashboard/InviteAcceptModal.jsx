import React, { useState, useEffect } from 'react';
import { Users, Loader2, Check, X, ServerIcon } from 'lucide-react';
import { supabase } from '../../supabaseClient';

/**
 * Shown when the user lands on /panel?invite=<token>
 * Looks up the invite, verifies the user's email matches, and lets them accept.
 *
 * Props:
 *  token       – invite_token from URL
 *  user        – logged-in Supabase user object
 *  onAccepted  – (serverData) callback once accepted
 *  onDismiss   – callback to close without accepting
 */
const InviteAcceptModal = ({ token, user, onAccepted, onDismiss }) => {
  const [state,  setState]  = useState('loading'); // loading | mismatch | ready | accepting | done | error
  const [invite, setInvite] = useState(null);
  const [server, setServer] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!token || !user) return;

      // Use mc-api endpoint with service_role to bypass RLS
      try {
        const r = await fetch('https://api.fluxoai.co/api/members/get-invite?token=' + encodeURIComponent(token));
        const j = await r.json();

        if (!r.ok || !j.ok) {
          setErrMsg(j.message || 'Esta invitación no existe o ya fue aceptada.');
          setState('error');
          return;
        }

        const inv = j.invite;

        // Email check
        const userEmail = user.email?.toLowerCase() || '';
        if (inv.invited_email && inv.invited_email.toLowerCase() !== userEmail) {
          setState('mismatch');
          setInvite(inv);
          return;
        }

        setInvite(inv);
        setServer(j.server);
        setState('ready');
      } catch (err) {
        setErrMsg('Error al verificar invitación: ' + err.message);
        setState('error');
      }
    };

    load();
  }, [token, user]);

  const accept = async () => {
    setState('accepting');
    try {
      // Get user JWT
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || localStorage.getItem('minelab-forced-token');
      if (!accessToken) throw new Error('No hay sesión activa');

      const r = await fetch('https://api.fluxoai.co/api/members/accept-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
        },
        body: JSON.stringify({ token }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        throw new Error(j.message || j.error || 'Error al aceptar la invitación');
      }

      setState('done');
      setTimeout(() => onAccepted(j.server, j.member?.role || invite?.role), 1200);
    } catch (err) {
      setErrMsg(err.message);
      setState('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#111827] border border-[#2A2A2A] rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col gap-5">

        {/* Loading */}
        {state === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="animate-spin text-[#22C55E]" size={36} />
            <p className="text-[#B3B3B3] text-sm">Verificando invitación…</p>
          </div>
        )}

        {/* Email mismatch */}
        {state === 'mismatch' && (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Users size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Invitación para otra cuenta</p>
                <p className="text-[#6B6B6B] text-xs mt-0.5">
                  Esta invitación es para <span className="text-[#E5E5E5]">{invite?.invited_email}</span>.
                  Has iniciado sesión como <span className="text-[#E5E5E5]">{user?.email}</span>.
                </p>
              </div>
            </div>
            <button onClick={onDismiss} className="w-full py-2.5 rounded-lg text-sm font-bold bg-[#1F2937] hover:bg-[#374151] text-[#E5E5E5] transition-colors">
              Entendido
            </button>
          </>
        )}

        {/* Ready to accept */}
        {state === 'ready' && (
          <>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center shrink-0">
                <ServerIcon size={22} className="text-[#22C55E]" />
              </div>
              <div>
                <p className="text-white font-bold">Invitación al servidor</p>
                <p className="text-[#6B6B6B] text-xs mt-0.5">Has sido invitado a unirte a:</p>
              </div>
            </div>

            <div className="bg-[#0B0B0B] border border-[#2A2A2A] rounded-xl px-5 py-4">
              <p className="text-white font-bold text-lg truncate">{server?.server_name || 'Servidor'}</p>
              {server?.ip && (
                <p className="text-[#6B6B6B] font-mono text-xs mt-1">{server.ip}:{server.port}</p>
              )}
              <span className={`mt-2 inline-block px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold tracking-widest
                ${invite?.role === 'admin' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  invite?.role === 'viewer' ? 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                Rol: {invite?.role}
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={onDismiss} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#0B0B0B] hover:bg-[#1F2937] border border-[#2A2A2A] text-[#B3B3B3] transition-colors">
                Rechazar
              </button>
              <button onClick={accept} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#22C55E] hover:bg-[#1faa50] text-[#0B0B0B] transition-colors flex items-center justify-center gap-2">
                <Check size={15} /> Aceptar
              </button>
            </div>
          </>
        )}

        {/* Accepting */}
        {state === 'accepting' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="animate-spin text-[#22C55E]" size={36} />
            <p className="text-[#B3B3B3] text-sm">Uniéndote al servidor…</p>
          </div>
        )}

        {/* Done */}
        {state === 'done' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 border-2 border-[#22C55E]/40 flex items-center justify-center">
              <Check size={28} className="text-[#22C55E]" />
            </div>
            <p className="text-white font-bold text-lg">¡Bienvenido!</p>
            <p className="text-[#6B6B6B] text-sm">Ahora tienes acceso al servidor.</p>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <X size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Invitación inválida</p>
                <p className="text-[#6B6B6B] text-xs mt-0.5">{errMsg}</p>
              </div>
            </div>
            <button onClick={onDismiss} className="w-full py-2.5 rounded-lg text-sm font-bold bg-[#1F2937] hover:bg-[#374151] text-[#E5E5E5] transition-colors">
              Cerrar
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default InviteAcceptModal;
