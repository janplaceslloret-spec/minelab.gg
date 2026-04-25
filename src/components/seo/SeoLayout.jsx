import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Topbar from '../Topbar';
import Navbar from '../Navbar';
import Footer from '../Footer';
import LegalSections from '../LegalSections';
import DiscordWidget from '../DiscordWidget';

/**
 * Layout para landings SEO. Reusa Topbar + Navbar + Footer reales para
 * que la web se vea unificada (mismo logo, mismo countdown, mismas
 * secciones). Las acciones de auth las manda al panel/login igual que
 * en la home.
 */
export default function SeoLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session || !!localStorage.getItem('minelab-forced-token'));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
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
        options: { redirectTo: window.location.origin + '/panel' },
      });
      if (error) {
        console.error('Supabase OAuth Error:', error.message);
        alert('No se pudo iniciar sesión: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary font-sans relative selection:bg-accent-green/30 selection:text-white">
      {/* Background dark grid effect (igual que la home) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <Topbar onLoginDemo={handleAuthAction} isLoggedIn={isLoggedIn} onOpenDashboard={handleAuthAction} />
      <Navbar onLoginDemo={handleAuthAction} isLoggedIn={isLoggedIn} onOpenDashboard={handleAuthAction} />

      <main className="pt-[120px]">{children}</main>

      <LegalSections />
      <Footer />
      <DiscordWidget />
    </div>
  );
}
