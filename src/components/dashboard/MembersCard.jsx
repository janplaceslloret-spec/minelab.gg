import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Copy, Check, Trash2, Loader2,
  Clock, ShieldCheck, UserX, ChevronDown, Link
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

/* ── Role badge ────────────────────────────────────────────────── */
const RoleBadge = ({ role }) => {
  const map = {
    admin:  { label: 'Admin',      cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
    member: { label: 'Miembro',    cls: 'bg-blue-500/10  border-blue-500/20  text-blue-400'  },
    viewer: { label: 'Espectador', cls: 'bg-zinc-500/10  border-zinc-500/20  text-zinc-400'  },
  };
  const { label, cls } = map[role] ?? map.member;
  return (
    <span className={`px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold tracking-widest ${cls}`}>
      {label}
    </span>
  );
};

/* ── Status badge ──────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  if (status === 'active')  return <ShieldCheck size={13} className="text-[#22C55E]" title="Activo" />;
  if (status === 'pending') return <Clock        size={13} className="text-amber-400" title="Pendiente" />;
  return                           <UserX        size={13} className="text-red-400"   title="Revocado" />;
};

/* ── Copy-link button ──────────────────────────────────────────── */
const CopyLink = ({ token }) => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/panel?invite=${token}`;
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      title="Copiar enlace de invitación"
      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-[#1F2937]/60 hover:bg-[#1F2937] border border-[#374151] text-[#B3B3B3] hover:text-white transition-colors"
    >
      {copied ? <Check size={11} className="text-[#22C55E]" /> : <Link size={11} />}
      {copied ? 'Copiado' : 'Copiar enlace'}
    </button>
  );
};

/* ── Main MembersCard ──────────────────────────────────────────── */
const MembersCard = ({ server, user }) => {
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [inviting, setInviting] = useState(false);
  const [email,    setEmail]    = useState('');
  const [role,     setRole]     = useState('member');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  /* ── Load members ──────────────────────────────────────────── */
  const loadMembers = useCallback(async () => {
    if (!server?.id) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('server_members')
      .select('*')
      .eq('server_id', server.id)
      .neq('status', 'revoked')
      .order('created_at', { ascending: false });

    if (!err) setMembers(data || []);
    setLoading(false);
  }, [server?.id]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  /* ── Send invite ───────────────────────────────────────────── */
  const sendInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setSuccess('');
    setInviting(true);

    try {
      // Prevent duplicate active/pending invite for same email
      const { data: existing } = await supabase
        .from('server_members')
        .select('id, status')
        .eq('server_id', server.id)
        .eq('invited_email', email.trim().toLowerCase())
        .in('status', ['pending', 'active'])
        .maybeSingle();

      if (existing) {
        setError('Ya existe una invitación activa para ese email.');
        setInviting(false);
        return;
      }

      const { error: insertErr } = await supabase
        .from('server_members')
        .insert({
          server_id:     server.id,
          invited_email: email.trim().toLowerCase(),
          role,
          invited_by:    user.id,
          status:        'pending',
        });

      if (insertErr) throw new Error(insertErr.message);

      setSuccess(`Invitación creada para ${email.trim()}`);
      setEmail('');
      loadMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  /* ── Revoke access ─────────────────────────────────────────── */
  const revoke = async (memberId) => {
    await supabase
      .from('server_members')
      .update({ status: 'revoked' })
      .eq('id', memberId);
    loadMembers();
  };

  return (
    <div className="bg-[#171717] border border-[#2A2A2A] rounded-xl p-6 flex flex-col shadow-sm lg:col-span-2">

      {/* Header */}
      <h3 className="text-[#22C55E] text-lg font-bold mb-1 flex items-center gap-2">
        <Users size={18} /> Miembros del Servidor
      </h3>
      <p className="text-[#6B6B6B] text-sm mb-6">
        Invita a amigos para que puedan acceder a los archivos y la consola de tu servidor.
      </p>

      {/* Invite form */}
      <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="email"
          placeholder="email@ejemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="flex-1 bg-[#0B0B0B] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm text-[#E5E5E5] placeholder-[#6B6B6B] focus:outline-none focus:border-[#22C55E]/50 transition-colors"
        />

        {/* Role selector */}
        <div className="relative">
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="appearance-none bg-[#0B0B0B] border border-[#2A2A2A] rounded-lg pl-3 pr-7 py-2.5 text-sm text-[#B3B3B3] focus:outline-none focus:border-[#22C55E]/50 cursor-pointer transition-colors"
          >
            <option value="admin">Admin</option>
            <option value="member">Miembro</option>
            <option value="viewer">Espectador</option>
          </select>
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none" />
        </div>

        <button
          type="submit"
          disabled={inviting || !email.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-[#22C55E] hover:bg-[#1faa50] text-[#0B0B0B] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {inviting ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
          Invitar
        </button>
      </form>

      {error   && <p className="mb-4 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>}
      {success && <p className="mb-4 text-[#22C55E] text-xs bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg px-4 py-2">{success}</p>}

      {/* Members list */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-[#6B6B6B]">
          <Loader2 className="animate-spin" size={22} />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-8 text-[#6B6B6B] text-sm border border-dashed border-[#2A2A2A] rounded-xl">
          Aún no has invitado a nadie.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {members.map(m => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 px-4 py-3 bg-[#0B0B0B] border border-[#2A2A2A] rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <StatusBadge status={m.status} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[#E5E5E5] text-sm font-medium truncate">{m.invited_email}</span>
                  {m.status === 'pending' && (
                    <span className="text-[#6B6B6B] text-[10px]">Invitación pendiente</span>
                  )}
                  {m.status === 'active' && m.accepted_at && (
                    <span className="text-[#6B6B6B] text-[10px]">
                      Aceptó el {new Date(m.accepted_at).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <RoleBadge role={m.role} />
                {m.status === 'pending' && <CopyLink token={m.invite_token} />}
                <button
                  onClick={() => revoke(m.id)}
                  title="Revocar acceso"
                  className="p-1.5 rounded hover:bg-red-500/10 text-[#6B6B6B] hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersCard;
