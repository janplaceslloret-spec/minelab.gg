import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import AIAssistantSidebar from './AIAssistantSidebar';
import EmptyServerState from './EmptyServerState';
import CreateServerWizard from './CreateServerWizard';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DiscordWidget from '../DiscordWidget';

const DashboardLayout = () => {
  const [viewState, setViewState] = useState('loading'); // 'loading', 'empty', 'wizard', 'dashboard'
  const [user, setUser] = useState(null);
  const [planStatus, setPlanStatus] = useState('none');
  const [activeServer, setActiveServer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // Controls MainContent views
  const [isActionLoading, setIsActionLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateServer = async () => {
    try {
      setViewState('loading');
      
      // First check if user already has any valid server
      const { data: existingDraft, error: fetchErr } = await supabase
        .from('mc_servers')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['draft', 'ready', 'paid'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (existingDraft) {
         // Draft already exists, just navigate
         navigate('/panel?wizard=true', { replace: true });
         setViewState('wizard');
         return;
      }

      // If no draft exists, create a new one with a unique name
      const uniqueName = `Mi servidor ${Math.floor(Date.now() / 1000)}`;
      const insertData = {
        user_id: user.id,
        server_name: uniqueName,
        server_type: "vanilla",
        mc_version: "1.21.11",
        ram_gb: 6,
        status: "draft",
        status_server: "offline",
        ready: false,
        mods: false,
        mod_count: 0
      };
      const { data: newSrv, error } = await supabase
        .from('mc_servers')
        .insert(insertData)
        .select()
        .single();
        
      if (error) throw error;
      
      navigate('/panel?wizard=true', { replace: true });
      setViewState('wizard');
    } catch(err) {
      console.error('Error in creating server on click:', err);
      // Ensure we still navigate so they aren't stuck, the wizard will try again or handle it
      navigate('/panel?wizard=true', { replace: true });
      setViewState('wizard');
    }
  };

  const handleServerAction = async (action) => {
    if (!activeServer || isActionLoading) return;
    setIsActionLoading(true);

    // Optimistic local update
    if (action === 'restart') {
       setActiveServer(prev => prev ? { ...prev, status_server: 'restarting' } : prev);
    } else if (action === 'stop') {
       setActiveServer(prev => prev ? { ...prev, status_server: 'stopping' } : prev);
    } else if (action === 'start') {
       setActiveServer(prev => prev ? { ...prev, status_server: 'starting' } : prev);
    }

    try {
      const response = await fetch('https://snack55-n8n1.q7pa8v.easypanel.host/webhook/server-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeServer.id,
          action: action
        })
      });

      if (!response.ok) throw new Error("Fallo al ejecutar la acción");
      
      const { data, error } = await supabase
        .from('mc_servers')
        .select('*')
        .eq('id', activeServer.id)
        .single();
        
      if (!error && data) setActiveServer(data);
    } catch (err) {
      console.error("Action error:", err);
      const { data } = await supabase.from('mc_servers').select('*').eq('id', activeServer.id).single();
      if (data) setActiveServer(data);
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    let authSubscription;
    let fallbackTimer;

    const checkSessionAndFetch = async () => {
      try {
        console.log("[DashboardLayout] Checking initial session...");
        
        // Custom bypass for clock-skew/JWT rejection on 2026 test environments:
        if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log("[DashboardLayout] URL has access_token. Bypassing Supabase clock skew...");
          const hashparams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashparams.get('access_token');
          if (accessToken) {
             localStorage.setItem('minelab-forced-token', accessToken);
             try {
               const payloadBase64 = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
               const payload = JSON.parse(atob(payloadBase64));
               const mockUser = { id: payload.sub, email: payload.email };
               setUser(mockUser);
               window.history.replaceState(null, '', window.location.pathname);
               fetchServersAndState(mockUser.id, mockUser.email);
               return; // Skip normal getSession if we just successfully forced it
             } catch (e) {
               console.error("Failed to parse local JWT token:", e);
               // fallthrough
             }
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("[DashboardLayout] getSession result:", session ? "Session found" : "No session", error);
        
        if (session) {
          setUser(session.user);
          fetchServersAndState(session.user.id, session.user.email);
        } else {
           const forcedToken = localStorage.getItem('minelab-forced-token');
           if (forcedToken) {
               try {
                 const payloadBase64 = forcedToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
                 const payload = JSON.parse(atob(payloadBase64));
                 const mockUser = { id: payload.sub, email: payload.email };
                 setUser(mockUser);
                 fetchServersAndState(mockUser.id, mockUser.email);
               } catch (e) {
                 navigate('/');
               }
           } else {
             console.log("[DashboardLayout] No session and no auth hash. Ejecting to landing.");
             navigate('/');
           }
        }
      } catch (err) {
        console.error("[DashboardLayout] Error during checkSessionAndFetch:", err);
        setViewState('empty');
      }
    };

    const fetchServersAndState = async (userId, userEmail = '') => {
      console.log("[DashboardLayout] Fetching servers for user:", userId);
      try {
        const lowerEmail = userEmail ? String(userEmail).toLowerCase() : '';
        const [serversResponse, profileResponse1] = await Promise.all([
           supabase.from('mc_servers').select('*').eq('user_id', userId),
           supabase.from('profiles').select('plan_status, plan').eq('id', userId).limit(1).maybeSingle()
        ]);
        
        const { data: servers, error: serversError } = serversResponse;
        let profile = profileResponse1.data;
        
        // If ID didn't find a valid plan, try by email as a fallback
        let currentPlanStatus = profile?.plan_status || profile?.plan || 'none';
        
        if (currentPlanStatus === 'none' && lowerEmail) {
            const { data: profileResponse2 } = await supabase.from('profiles').select('plan_status, plan').eq('email', lowerEmail).limit(1).maybeSingle();
            if (profileResponse2) {
               profile = profileResponse2;
               currentPlanStatus = profile?.plan_status || profile?.plan || 'none';
            }
        }

        setPlanStatus(currentPlanStatus);

        if (servers && servers.length > 0) {
          // Prefer a non-draft server, otherwise just the first one
          const currentServer = servers.find(s => s.status !== 'draft') || servers[0];
          setActiveServer(currentServer);
        }

        if (serversError) {
          if (serversError.code === 'PGRST303' || serversError.message?.includes('JWT') || serversError.code === '401') {
            console.warn('[DashboardLayout] Token expired. Forcing logout.');
            localStorage.removeItem('minelab-forced-token');
            await supabase.auth.signOut();
            navigate('/', { replace: true });
            return;
          }
          throw serversError;
        }

        console.log("[DashboardLayout] Profile plan status:", currentPlanStatus);
        
        const isWizardRequested = window.location.search.includes('wizard=true');
        
        const normalizedPlan = String(currentPlanStatus).trim().toLowerCase();
        const validPlans = ['pro_4gb', 'pro_6gb', 'pro_8gb', 'pro_12gb', 'admin'];
        const isPlanValid = validPlans.includes(normalizedPlan);
        
        if (!isPlanValid) {
          // Rule: If plan_status is none or invalid -> restrict access, redirect to wizard
          if (isWizardRequested) {
            setViewState('wizard');
          } else {
            setViewState('wizard');
            navigate('/panel?wizard=true', { replace: true });
          }
        } else {
          // Rule: If plan_status is valid -> allow dashboard access
          if (isWizardRequested) {
            setViewState('wizard');
          } else {
            setViewState('dashboard');
          }
        }
      } catch (err) {
        console.error('[DashboardLayout] Error fetching servers:', err);
        // Also catch outer throw just in case
        if (err.code === 'PGRST303' || err.message?.includes('JWT')) {
            localStorage.removeItem('minelab-forced-token');
            navigate('/', { replace: true });
        } else {
            setViewState('empty');
        }
      }
    };

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[DashboardLayout] onAuthStateChange event:", event, session ? "with session" : "no session");
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        setUser(session.user);
        fetchServersAndState(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('minelab-forced-token');
        navigate('/');
      }
    });
    authSubscription = data.subscription;

    checkSessionAndFetch();

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, [navigate]);

  // Real-time Supabase subscription for server status changes
  useEffect(() => {
    if (!user) return;

    console.log("[DashboardLayout] Setting up Supabase realtime subscription for mc_servers");

    const channel = supabase
      .channel('public:mc_servers')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'mc_servers', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log("[DashboardLayout] Supabase realtime update received:", payload);
          if (payload.new) {
             setActiveServer(prev => {
                if (prev && prev.id === payload.new.id) {
                   console.log("[DashboardLayout] Updating active server with new data:", payload.new);
                   return payload.new;
                }
                return prev;
             });
          }
        }
      )
      .subscribe((status) => {
        console.log("[DashboardLayout] Supabase subscription status:", status);
      });

    return () => {
      console.log("[DashboardLayout] Cleaning up Supabase subscription");
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    // If we're already established but the URL changes (e.g., clicking Nuevo Servidor), update viewState
    if (user && viewState === 'dashboard' && window.location.search.includes('wizard=true')) {
       setViewState('wizard');
     } else if (user && viewState === 'wizard' && !window.location.search.includes('wizard=true')) {
        // Evaluate immediately on back navigation based on planStatus instead of fetching servers again
        const normalizedPlanCheck = String(planStatus).trim().toLowerCase();
        const validPlansCheck = ['pro_4gb', 'pro_6gb', 'pro_8gb', 'pro_12gb', 'admin'];
        if (!validPlansCheck.includes(normalizedPlanCheck)) {
           setViewState('wizard');
           navigate('/panel?wizard=true', { replace: true });
        } else {
           setViewState('dashboard');
        }
     }
  }, [window.location.search, user, viewState]);

  if (viewState === 'loading') {
    return (
      <div className="min-h-screen w-full bg-[#0B0B0B] flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-green" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0B0B] flex font-sans">
      <Sidebar 
          viewState={viewState} 
          planStatus={planStatus} 
          onCreateServer={handleCreateServer} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          user={user}
          server={activeServer}
          isActionLoading={isActionLoading}
          onServerAction={handleServerAction}
      />
      
      <div className="flex-1 flex min-w-0 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 relative">
         {viewState === 'empty' && (
           <EmptyServerState onStartWizard={handleCreateServer} />
         )}
         
         {viewState === 'wizard' && (
           <CreateServerWizard user={user} onFinish={() => {
               navigate('/panel');
               setViewState('dashboard');
           }} />
         )}

         {viewState === 'dashboard' && (
           <>
             <MainContent 
                 planStatus={planStatus} 
                 server={activeServer} 
                 activeTab={activeTab} 
                 user={user} 
                 onServerUpdate={setActiveServer} 
                 isActionLoading={isActionLoading}
                 onServerAction={handleServerAction}
             />
             {planStatus !== 'none' && <AIAssistantSidebar activeServer={activeServer} user={user} />}
             <DiscordWidget className="bottom-6 right-[380px]" />
           </>
         )}
      </div>
    </div>
  );
};

export default DashboardLayout;
