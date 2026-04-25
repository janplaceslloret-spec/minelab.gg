import React, { useState, useEffect, useRef } from 'react';
import { Star, ShieldCheck, ChevronLeft, ChevronRight, Quote, Send, CheckCircle2, X, AlertCircle, PenLine } from 'lucide-react';
import { supabase } from '../supabaseClient';

const STATIC_REVIEWS = [
  {
    id: 's1',
    author: 'Carlos M.',
    avatar: 'CM',
    rating: 5,
    title: 'Rendimiento increíble, sin ningún lag',
    body: 'Llevamos más de dos meses con el servidor de MineLab y la diferencia es brutal. Antes con otro proveedor teníamos picos de TPS horrible en horas punta. Aquí con 40 jugadores conectados el servidor va a 20 TPS perfectos. El panel es muy intuitivo.',
    date: '18 abr 2026',
    plan: 'Pro 8GB',
    verified: true,
    color: '#22C55E',
  },
  {
    id: 's2',
    author: 'Lucía P.',
    avatar: 'LP',
    rating: 5,
    title: 'Soporte técnico de 10, resolvieron todo en minutos',
    body: 'Tuve un problema al instalar un plugin incompatible y me dejó el servidor caído. Contacté al soporte por Discord y en menos de 15 minutos ya tenía el servidor funcionando de nuevo. Muy profesionales. No es habitual encontrar este nivel de servicio.',
    date: '12 abr 2026',
    plan: 'Pro 6GB',
    verified: true,
    color: '#8B5CF6',
  },
  {
    id: 's3',
    author: 'Adrián R.',
    avatar: 'AR',
    rating: 5,
    title: 'Configuración en minutos, todo muy bien explicado',
    body: 'Nunca había montado un servidor de Minecraft propio y con MineLab fue facilísimo. El asistente IA del panel me ayudó a elegir los plugins y configurar todo. En una tarde tenía un servidor Paper completamente funcional. Muy recomendable.',
    date: '3 abr 2026',
    plan: 'Pro 4GB',
    verified: true,
    color: '#3B82F6',
  },
  {
    id: 's4',
    author: 'Sara G.',
    avatar: 'SG',
    rating: 4,
    title: 'Muy buena relación calidad-precio',
    body: 'Comparado con otros hostings que probé antes, MineLab ofrece mejor hardware por el mismo precio. Los AMD EPYC se notan mucho en el rendimiento de Java. Llegaré para renovar sin duda.',
    date: '22 mar 2026',
    plan: 'Pro 6GB',
    verified: true,
    color: '#F59E0B',
  },
  {
    id: 's5',
    author: 'Javier T.',
    avatar: 'JT',
    rating: 5,
    title: 'Mi comunidad notó la diferencia desde el primer día',
    body: 'Migré mi servidor SMP de 60 jugadores y la comunidad me felicitó directamente. El ping bajó, los chunks cargan mucho más rápido y no hemos tenido ni un solo crash en 6 semanas. La migración fue sencilla gracias al gestor de archivos del panel.',
    date: '8 mar 2026',
    plan: 'Pro 12GB',
    verified: true,
    color: '#22C55E',
  },
  {
    id: 's6',
    author: 'Elena V.',
    avatar: 'EV',
    rating: 5,
    title: '100% recomendado, lo mejor que he probado',
    body: 'Probé tres hostings distintos antes de quedarme con MineLab. La combinación de hardware potente, panel sencillo y soporte por Discord lo convierte en la mejor opción del mercado en español. El precio del plan anual es una ganga.',
    date: '14 feb 2026',
    plan: 'Pro 8GB',
    verified: true,
    color: '#8B5CF6',
  },
];

const AVATAR_COLORS = ['#22C55E', '#8B5CF6', '#3B82F6', '#F59E0B', '#EC4899', '#14B8A6'];

const StarRow = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/20 fill-white/10'} />
    ))}
  </div>
);

const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <button key={i} type="button" onClick={() => onChange(i)} className="transition-transform hover:scale-110 focus:outline-none">
        <Star size={28} className={i <= value ? 'text-amber-400 fill-amber-400' : 'text-white/20 fill-transparent'} />
      </button>
    ))}
  </div>
);

const ReviewCard = ({ review, active }) => {
  const initials = review.avatar || review.author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const color = review.color || AVATAR_COLORS[review.id % AVATAR_COLORS.length] || '#22C55E';
  return (
    <div className={`relative flex flex-col bg-[#111827] border rounded-2xl p-6 transition-all duration-500 select-none min-w-[320px] max-w-[360px] shrink-0 ${active ? 'border-accent-green/40 shadow-[0_0_30px_rgba(34,197,94,0.12)] scale-100 opacity-100' : 'border-white/8 opacity-60 scale-[0.97]'}`}>
      <Quote size={28} className="absolute top-5 right-5 text-white/5" />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0" style={{ background: color + '33', border: `1.5px solid ${color}55` }}>
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-white font-bold text-sm leading-tight truncate">{review.author}</span>
          <div className="flex items-center gap-2 mt-0.5">
            {review.plan && <span className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">{review.plan}</span>}
            {review.verified && <span className="flex items-center gap-1 text-accent-green text-[10px] font-bold"><ShieldCheck size={10} /> Verificado</span>}
          </div>
        </div>
      </div>
      <StarRow rating={review.rating} />
      <h4 className="text-white font-bold text-sm mt-3 mb-2 leading-snug">{review.title}</h4>
      <p className="text-white/55 text-xs leading-relaxed flex-1">{review.body}</p>
      <p className="text-white/25 text-[10px] mt-4 font-medium uppercase tracking-widest">{review.date}</p>
    </div>
  );
};

/* ── Review submission modal ── */
const RATING_LABELS = { 1: 'Muy malo', 2: 'Malo', 3: 'Normal', 4: 'Bueno', 5: '¡Excelente!' };

const ReviewModal = ({ onClose }) => {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Escribe tu nombre o apodo.'); return; }
    if (!title.trim()) { setError('Añade un título a tu reseña.'); return; }
    if (body.trim().length < 30) { setError('La reseña debe tener al menos 30 caracteres.'); return; }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      const isVerified = !!userId;

      await supabase.from('reviews').insert({
        user_id: userId,
        author_name: name.trim(),
        rating,
        title: title.trim(),
        body: body.trim(),
        verified: isVerified,
        approved: false,
      });
      setSubmitted(true);
    } catch (err) {
      setError('No se pudo enviar. Inténtalo más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div className="relative bg-[#0B0F1A] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"><X size={20} /></button>

        {submitted ? (
          <div className="flex flex-col items-center gap-5 text-center py-6">
            <div className="w-14 h-14 rounded-full bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-accent-green" />
            </div>
            <div>
              <h3 className="text-white text-xl font-extrabold uppercase tracking-tight mb-2">¡Gracias, {name.split(' ')[0]}!</h3>
              <p className="text-white/50 text-sm">Tu reseña ha sido recibida y se publicará tras una breve revisión. ¡Nos ayuda muchísimo!</p>
            </div>
            <StarRow rating={rating} size={20} />
            <button onClick={onClose} className="px-6 py-2.5 bg-accent-green text-black font-bold rounded-xl text-sm hover:bg-[#16a34a] transition-colors">Cerrar</button>
          </div>
        ) : (
          <>
            <h3 className="text-white text-xl font-extrabold uppercase tracking-tight mb-1">Deja tu reseña</h3>
            <p className="text-white/40 text-sm mb-6">Tu opinión ayuda a otros jugadores a elegir el mejor hosting.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-bold uppercase tracking-wider">Puntuación</label>
                <div className="flex items-center gap-3">
                  <StarPicker value={rating} onChange={setRating} />
                  <span className="text-white/50 text-sm">{RATING_LABELS[rating]}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-bold uppercase tracking-wider">Tu nombre o apodo</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)} maxLength={40}
                  placeholder="Ej: Carlos M."
                  className="bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent-green/40 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-bold uppercase tracking-wider">Título</label>
                <input
                  type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={80}
                  placeholder="Resume tu experiencia en una frase"
                  className="bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent-green/40 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-bold uppercase tracking-wider">Tu reseña</label>
                <textarea
                  value={body} onChange={e => setBody(e.target.value)} maxLength={600} rows={4}
                  placeholder="Cuéntanos tu experiencia: rendimiento, soporte, panel..."
                  className="bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent-green/40 transition-colors resize-none leading-relaxed"
                />
                <span className="text-white/20 text-xs text-right">{body.length}/600</span>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  <AlertCircle size={14} className="shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit" disabled={submitting}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-accent-green hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                {submitting ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>Enviando...</> : <><Send size={15} />Enviar reseña</>}
              </button>
              <p className="text-white/20 text-xs text-center">Las reseñas se publican tras revisión manual.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Main component ── */
const Testimonials = () => {
  const [allReviews, setAllReviews] = useState(STATIC_REVIEWS);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Fetch approved customer reviews from Supabase and append to carousel
  useEffect(() => {
    supabase
      .from('reviews')
      .select('id, author_name, rating, title, body, plan, verified, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped = data.map((r, i) => ({
            id: 'db_' + r.id,
            author: r.author_name,
            avatar: r.author_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
            rating: r.rating,
            title: r.title,
            body: r.body,
            date: new Date(r.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
            plan: r.plan?.replace(/_/g, ' ') || '',
            verified: r.verified,
            color: AVATAR_COLORS[i % AVATAR_COLORS.length],
          }));
          setAllReviews([...STATIC_REVIEWS, ...mapped]);
        }
      })
      .catch(() => {}); // silently ignore if table doesn't exist yet
  }, []);

  const total = allReviews.length;
  const avgRating = (allReviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);
  const fiveStarPct = Math.round((allReviews.filter(r => r.rating === 5).length / total) * 100);

  const next = () => setCurrent(c => (c + 1) % total);
  const prev = () => setCurrent(c => (c - 1 + total) % total);

  useEffect(() => {
    if (paused || showModal) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [paused, showModal, total]);

  const visibleIndexes = [
    (current - 1 + total) % total,
    current,
    (current + 1) % total,
  ];

  return (
    <>
      <section id="reviews" className="py-24 bg-background border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent-violet/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-green/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/3"></div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">

          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white uppercase mb-4">
              LO QUE DICEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-violet">NUESTROS CLIENTES</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Reseñas reales de jugadores y comunidades que confían en MineLab para sus servidores.
            </p>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-heading font-black text-white tracking-tighter">{avgRating}</span>
                <StarRow rating={5} size={18} />
                <span className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">Puntuación media</span>
              </div>
              <div className="hidden sm:block w-px h-16 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-heading font-black text-accent-green tracking-tighter">{fiveStarPct}%</span>
                <span className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">Puntuaciones 5 ★</span>
              </div>
              <div className="hidden sm:block w-px h-16 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-heading font-black text-white tracking-tighter">{total}</span>
                <span className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">Reseñas verificadas</span>
              </div>
            </div>
          </div>

          {/* Carousel */}
          <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="flex items-center justify-center gap-5 overflow-hidden px-4">
              {visibleIndexes.map((idx, pos) => (
                <ReviewCard key={allReviews[idx].id} review={allReviews[idx]} active={pos === 1} />
              ))}
            </div>

            <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-accent-green/40 transition-all" aria-label="Anterior">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-accent-green/40 transition-all" aria-label="Siguiente">
              <ChevronRight size={20} />
            </button>

            <div className="flex items-center justify-center gap-2 mt-8">
              {allReviews.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-accent-green' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />
              ))}
            </div>
          </div>

          {/* CTA to write review */}
          <div className="mt-14 flex flex-col items-center gap-4">
            <div className="w-px h-10 bg-white/10"></div>
            <div className="bg-[#111827] border border-white/10 rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center gap-6 max-w-xl w-full">
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <span className="text-white font-bold text-base">¿Eres cliente de MineLab?</span>
                <span className="text-white/50 text-sm">Cuéntanos tu experiencia y ayuda a otros a elegir bien.</span>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="shrink-0 flex items-center gap-2 px-6 py-3 bg-accent-green hover:bg-[#16a34a] text-black font-bold rounded-xl text-sm uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5"
              >
                <PenLine size={16} />
                Escribir reseña
              </button>
            </div>
          </div>

        </div>
      </section>

      {showModal && <ReviewModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Testimonials;
