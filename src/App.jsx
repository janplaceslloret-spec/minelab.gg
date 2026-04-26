import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// SEO landings — lazy-loaded to keep main bundle slim
const AternosVsMinelab = lazy(() => import('./pages/AternosVsMinelab'));
const HostingConMods = lazy(() => import('./pages/HostingConMods'));
const MigrarAternos = lazy(() => import('./pages/MigrarAternos'));
const OrderConfigPage = lazy(() => import('./pages/OrderConfigPage'));

function SeoFallback() {
  return (
    <div className="min-h-screen bg-background text-primary flex items-center justify-center">
      <div className="text-white/50 text-sm">Cargando...</div>
    </div>
  );
}
import Topbar from './components/Topbar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AIFeaturesCarousel from './components/AIFeaturesCarousel';
import AIFeature from './components/AIFeature';
import About from './components/About';
import Pricing from './components/Pricing';
import Locations from './components/Locations';
import FAQ from './components/FAQ';
import LegalSections from './components/LegalSections';
import Footer from './components/Footer';
import DiscordWidget from './components/DiscordWidget';
import Testimonials from './components/Testimonials';
import DashboardLayout from './components/dashboard/DashboardLayout';

function ProtectedPanel() {
  const [state, setState] = useState('loading'); // 'loading' | 'auth' | 'guest'
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      const ok = !!session || !!localStorage.getItem('minelab-forced-token');
      setState(ok ? 'auth' : 'guest');
      if (!ok) {
        // No session: bounce to landing, preserve query params
        navigate('/' + window.location.search, { replace: true });
      }
    });
    return () => { active = false; };
  }, [navigate]);
  if (state === 'loading') {
    return <div className="min-h-screen bg-background text-primary flex items-center justify-center">Cargando...</div>;
  }
  if (state === 'guest') return null;
  return <DashboardLayout />;
}

function LandingPage({ isLoggedIn, onAuthAction, showToast }) {
  useEffect(() => {
    // Honor hash navigation (e.g. /#pricing from a SEO landing).
    // Only force-scroll-top when there is no anchor target.
    const hash = window.location.hash;
    if (hash) {
      const id = hash.slice(1);
      // Wait a tick so anchor target is mounted
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-primary font-sans relative selection:bg-accent-green/30 selection:text-white">
      {/* Welcome Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#111827] border border-accent-green/50 text-white px-6 py-3 rounded-xl shadow-[0_10px_30px_rgba(34,197,94,0.3)] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
          <span className="font-medium text-sm">¡Bienvenido a MineLab! Gracias por iniciar sesión.</span>
        </div>
      )}

      {/* Background dark grid effect typical in SaaS */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" 
           style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <Topbar onLoginDemo={onAuthAction} isLoggedIn={isLoggedIn} onOpenDashboard={onAuthAction} />
      <Navbar onLoginDemo={onAuthAction} isLoggedIn={isLoggedIn} onOpenDashboard={onAuthAction} />
      
      <main className="pt-[120px]">
        <Hero onLoginDemo={onAuthAction} isLoggedIn={isLoggedIn} onOpenDashboard={onAuthAction} />
        <AIFeaturesCarousel />
        <AIFeature />
        <About />
        <Locations />
        <Testimonials />
        <Pricing onLoginDemo={onAuthAction} isLoggedIn={isLoggedIn} onOpenDashboard={onAuthAction} />
        <FAQ />
      </main>

      <LegalSections />
      <Footer />
      <DiscordWidget />
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session || !!localStorage.getItem('minelab-forced-token'));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session || !!localStorage.getItem('minelab-forced-token'));
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthAction = async () => {
    const forcedToken = localStorage.getItem('minelab-forced-token');
    if (forcedToken) {
      navigate('/panel');
      return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate('/panel');
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/panel'
        }
      });
      if (error) {
        console.error("Supabase OAuth Error:", error.message);
        alert("No se pudo iniciar sesión. Verifica la configuración de Supabase: " + error.message);
      }
    }
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage isLoggedIn={isLoggedIn} onAuthAction={handleAuthAction} showToast={showToast} />} />
      <Route path="/panel" element={<ProtectedPanel />} />
      <Route path="/aternos-vs-minelab" element={<Suspense fallback={<SeoFallback />}><AternosVsMinelab /></Suspense>} />
      <Route path="/hosting-minecraft-con-mods" element={<Suspense fallback={<SeoFallback />}><HostingConMods /></Suspense>} />
      <Route path="/migrar-servidor-aternos" element={<Suspense fallback={<SeoFallback />}><MigrarAternos /></Suspense>} />
      <Route path="/configurar" element={<Suspense fallback={<SeoFallback />}><OrderConfigPage /></Suspense>} />
    </Routes>
  );
}

export default App;
