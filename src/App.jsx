import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
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

function LandingPage({ isLoggedIn, onAuthAction, showToast }) {
  useEffect(() => {
    // Force scroll to top on every reload as requested for landing UX
    window.scrollTo(0, 0);
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
      <Route path="/panel" element={<DashboardLayout />} />
    </Routes>
  );
}

export default App;
