import React, { useState } from 'react';
import { Star, ShieldCheck, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i)}
        className="transition-transform hover:scale-110 focus:outline-none"
        aria-label={`${i} estrella${i > 1 ? 's' : ''}`}
      >
        <Star
          size={32}
          className={i <= value ? 'text-amber-400 fill-amber-400' : 'text-white/20 fill-transparent'}
        />
      </button>
    ))}
  </div>
);

const RATING_LABELS = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Normal',
  4: 'Bueno',
  5: '¡Excelente!',
};

const ReviewView = ({ user, planStatus }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validPlans = ['pro_4gb', 'pro_6gb', 'pro_8gb', 'pro_12gb', 'admin'];
  const isVerified = validPlans.includes(String(planStatus).trim().toLowerCase());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !body.trim()) {
      setError('Por favor, rellena el título y el cuerpo de la reseña.');
      return;
    }
    if (body.trim().length < 30) {
      setError('La reseña debe tener al menos 30 caracteres para ser útil.');
      return;
    }

    setSubmitting(true);
    try {
      const displayName =
        user?.user_metadata?.full_name ||
        user?.email?.split('@')[0] ||
        'Usuario MineLab';

      const { error: insertError } = await supabase.from('reviews').insert({
        user_id: user?.id || null,
        author_name: displayName,
        rating,
        title: title.trim(),
        body: body.trim(),
        plan: planStatus,
        verified: true,
        approved: false, // pendiente de moderación
      });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('No se pudo enviar la reseña. Inténtalo de nuevo más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 text-center py-20 px-8">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <ShieldCheck size={32} className="text-amber-400" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-white text-2xl font-extrabold uppercase tracking-tight">Solo para clientes</h2>
          <p className="text-zinc-400 text-sm max-w-sm">
            Para garantizar que todas las reseñas son auténticas, solo los usuarios con un plan activo pueden dejar una valoración.
          </p>
        </div>
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-xl px-6 py-4 text-sm text-zinc-400 max-w-xs text-center">
          Activa tu plan desde el panel para poder dejar tu reseña verificada ✅
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 text-center py-20 px-8">
        <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-[#22C55E]" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-white text-2xl font-extrabold uppercase tracking-tight">¡Gracias por tu reseña!</h2>
          <p className="text-zinc-400 text-sm max-w-sm">
            Tu valoración ha sido recibida. La revisaremos y la publicaremos en la web en breve. ¡Nos ayuda muchísimo!
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={20} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-white text-2xl font-extrabold uppercase tracking-tight">Deja tu reseña</h2>
        <p className="text-zinc-400 text-sm">
          Tu opinión ayuda a otros jugadores a elegir el mejor hosting. Todas las reseñas son verificadas como clientes reales.
        </p>
      </div>

      {/* Verified badge */}
      <div className="flex items-center gap-2 bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-xl px-4 py-3">
        <ShieldCheck size={18} className="text-[#22C55E] shrink-0" />
        <span className="text-[#22C55E] text-sm font-semibold">Reseña verificada — plan {planStatus?.replace(/_/g, ' ')} activo</span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Star rating */}
        <div className="flex flex-col gap-3">
          <label className="text-white text-sm font-bold uppercase tracking-wider">Puntuación</label>
          <div className="flex items-center gap-4">
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <span className="text-white/60 text-sm font-medium">{RATING_LABELS[rating]}</span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-bold uppercase tracking-wider" htmlFor="review-title">
            Título
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Resume tu experiencia en una frase"
            maxLength={80}
            className="bg-[#171717] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#22C55E]/50 focus:ring-1 focus:ring-[#22C55E]/30 transition-all"
          />
          <span className="text-zinc-600 text-xs text-right">{title.length}/80</span>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-bold uppercase tracking-wider" htmlFor="review-body">
            Tu reseña
          </label>
          <textarea
            id="review-body"
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Cuéntanos tu experiencia con MineLab: rendimiento, soporte, facilidad de uso..."
            maxLength={600}
            rows={5}
            className="bg-[#171717] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#22C55E]/50 focus:ring-1 focus:ring-[#22C55E]/30 transition-all resize-none leading-relaxed"
          />
          <span className="text-zinc-600 text-xs text-right">{body.length}/600</span>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#22C55E] hover:bg-[#16a34a] disabled:bg-[#22C55E]/40 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send size={16} />
              Enviar reseña verificada
            </>
          )}
        </button>

        <p className="text-zinc-600 text-xs text-center">
          Las reseñas se publican tras una breve revisión manual para garantizar su autenticidad.
        </p>
      </form>
    </div>
  );
};

export default ReviewView;
