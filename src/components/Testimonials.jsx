import React, { useState, useEffect, useRef } from 'react';
import { Star, ShieldCheck, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    author: 'Carlos M.',
    avatar: 'CM',
    rating: 5,
    title: 'Rendimiento increíble, sin ningún lag',
    body: 'Llevamos más de dos meses con el servidor de MineLab y la diferencia es brutal. Antes con otro proveedor teníamos picos de TPS horrible en horas punta. Aquí con 40 jugadores conectados el servidor va a 20 TPS perfectos. El panel es muy intuitivo y pudimos configurar todo nosotros solos.',
    date: '12 mar 2025',
    plan: 'Pro 8GB',
    verified: true,
    color: '#22C55E',
  },
  {
    id: 2,
    author: 'Lucía P.',
    avatar: 'LP',
    rating: 5,
    title: 'Soporte técnico de 10, resolvieron todo en minutos',
    body: 'Tuve un problema al instalar un plugin incompatible y me dejó el servidor caído. Contacté al soporte por Discord y en menos de 15 minutos ya tenía el servidor funcionando de nuevo. Muy profesionales y atentos. No es habitual encontrar este nivel de servicio en hosting de Minecraft.',
    date: '28 feb 2025',
    plan: 'Pro 6GB',
    verified: true,
    color: '#8B5CF6',
  },
  {
    id: 3,
    author: 'Adrián R.',
    avatar: 'AR',
    rating: 5,
    title: 'Configuración en minutos, todo muy bien explicado',
    body: 'Nunca había montado un servidor de Minecraft propio y con MineLab fue facilísimo. El asistente IA del panel me ayudó a elegir los plugins, configurar el server.properties y hasta a optimizar el garbage collector. En una tarde tenía un servidor Paper completamente funcional. Muy recomendable para principiantes.',
    date: '15 ene 2025',
    plan: 'Pro 4GB',
    verified: true,
    color: '#3B82F6',
  },
  {
    id: 4,
    author: 'Sara G.',
    avatar: 'SG',
    rating: 4,
    title: 'Muy buena relación calidad-precio',
    body: 'Comparado con otros hostings que probé antes, MineLab ofrece mejor hardware por el mismo precio o incluso menos. Los AMD EPYC se notan mucho en el rendimiento de Java. El único detalle es que los backups automáticos aún están en desarrollo, pero por lo demás todo perfecto. Llegaré para renovar sin duda.',
    date: '3 ene 2025',
    plan: 'Pro 6GB',
    verified: true,
    color: '#F59E0B',
  },
  {
    id: 5,
    author: 'Javier T.',
    avatar: 'JT',
    rating: 5,
    title: 'Mi comunidad notó la diferencia desde el primer día',
    body: 'Migré mi servidor SMP de 60 jugadores desde otro proveedor y la comunidad me felicitó directamente. El ping bajó de media, los chunks cargan mucho más rápido y no hemos tenido ni un solo crash en 6 semanas. La migración fue sencilla gracias al gestor de archivos del panel. Muy contento.',
    date: '20 dic 2024',
    plan: 'Pro 12GB',
    verified: true,
    color: '#22C55E',
  },
  {
    id: 6,
    author: 'Elena V.',
    avatar: 'EV',
    rating: 5,
    title: '100% recomendado, lo mejor que he probado',
    body: 'Probé tres hostings distintos antes de quedarme con MineLab. La combinación de hardware potente, panel sencillo y soporte por Discord lo convierte en la mejor opción del mercado en español. El precio del plan anual es una ganga. Si estás buscando hosting serio para tu servidor, no busques más.',
    date: '8 dic 2024',
    plan: 'Pro 8GB',
    verified: true,
    color: '#8B5CF6',
  },
];

const StarRow = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={size}
        className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/20 fill-white/10'}
      />
    ))}
  </div>
);

const ReviewCard = ({ review, active }) => (
  <div
    className={`relative flex flex-col bg-[#111827] border rounded-2xl p-6 transition-all duration-500 select-none min-w-[320px] max-w-[360px] shrink-0 ${
      active
        ? 'border-accent-green/40 shadow-[0_0_30px_rgba(34,197,94,0.12)] scale-100 opacity-100'
        : 'border-white/8 opacity-60 scale-[0.97]'
    }`}
  >
    {/* Quote icon */}
    <Quote size={28} className="absolute top-5 right-5 text-white/5" />

    {/* Header */}
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
        style={{ background: review.color + '33', border: `1.5px solid ${review.color}55` }}
      >
        {review.avatar}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-white font-bold text-sm leading-tight truncate">{review.author}</span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">{review.plan}</span>
          {review.verified && (
            <span className="flex items-center gap-1 text-accent-green text-[10px] font-bold">
              <ShieldCheck size={10} /> Verificado
            </span>
          )}
        </div>
      </div>
    </div>

    <StarRow rating={review.rating} />

    <h4 className="text-white font-bold text-sm mt-3 mb-2 leading-snug">{review.title}</h4>
    <p className="text-white/55 text-xs leading-relaxed flex-1">{review.body}</p>

    <p className="text-white/25 text-[10px] mt-4 font-medium uppercase tracking-widest">{review.date}</p>
  </div>
);

const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const totalReviews = reviews.length;
  const intervalRef = useRef(null);

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1);
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const fiveStarPct = Math.round((fiveStarCount / totalReviews) * 100);

  const next = () => setCurrent(c => (c + 1) % totalReviews);
  const prev = () => setCurrent(c => (c - 1 + totalReviews) % totalReviews);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(next, 4500);
    return () => clearInterval(intervalRef.current);
  }, [paused, current]);

  const visibleIndexes = [
    (current - 1 + totalReviews) % totalReviews,
    current,
    (current + 1) % totalReviews,
  ];

  return (
    <section id="reviews" className="py-24 bg-background border-y border-white/5 relative overflow-hidden">
      {/* Background glow */}
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

          {/* Summary stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-heading font-extrabold text-white tracking-tighter">{avgRating}</span>
              <StarRow rating={5} size={18} />
              <span className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">Puntuación media</span>
            </div>
            <div className="hidden sm:block w-px h-16 bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-heading font-extrabold text-accent-green tracking-tighter">{fiveStarPct}%</span>
              <span className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">Puntuaciones 5 ★</span>
            </div>
            <div className="hidden sm:block w-px h-16 bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-heading font-extrabold text-white tracking-tighter">{totalReviews}</span>
              <span className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">Reseñas verificadas</span>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Cards row */}
          <div className="flex items-center justify-center gap-5 overflow-hidden px-4">
            {visibleIndexes.map((idx, pos) => (
              <ReviewCard
                key={reviews[idx].id}
                review={reviews[idx]}
                active={pos === 1}
              />
            ))}
          </div>

          {/* Nav arrows */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-accent-green/40 transition-all"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-accent-green/40 transition-all"
            aria-label="Siguiente"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-2 bg-accent-green'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Ir a reseña ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA to leave review */}
        <div className="text-center mt-12">
          <p className="text-white/40 text-sm">
            ¿Ya eres cliente? <span className="text-accent-green font-semibold cursor-pointer hover:underline" onClick={() => window.location.href = '/panel'}>Deja tu reseña desde el panel →</span>
          </p>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
