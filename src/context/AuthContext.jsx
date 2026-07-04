import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

let demoDataPromise;

const getDemoData = async () => {
  if (!demoDataPromise) demoDataPromise = import('../lib/demoData').then((module) => module.demoData);
  return demoDataPromise;
};

const demoProfileForEmail = async (email) => {
  const demoData = await getDemoData();
  if (email?.toLowerCase().includes('admin')) return demoData.profiles[0];
  return demoData.profiles[1];
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const loadSession = async () => {
      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem('monprof-demo-user');
        if (stored && mounted) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setProfile(parsed.profile);
        }
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (mounted) await hydrateUser(data.session?.user || null);
      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        await hydrateUser(session?.user || null);
      });
      setLoading(false);
      return () => listener.subscription.unsubscribe();
    };

    const cleanupPromise = loadSession();
    return () => {
      mounted = false;
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, []);

  const hydrateUser = async (authUser) => {
    setUser(authUser);
    if (!authUser) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
    if (error) {
      console.error('Supabase profile load failed:', {
        userId: authUser.id,
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setProfile(null);
      setProfileError(error);
      setProfileLoading(false);
      return;
    }
    if (!data) {
      const missingProfileError = new Error('Profil introuvable pour cet utilisateur');
      console.error('Supabase profile missing:', {
        userId: authUser.id,
        userEmail: authUser.email,
      });
      setProfile(null);
      setProfileError(missingProfileError);
      setProfileLoading(false);
      return;
    }
    setProfile(data);
    setProfileLoading(false);
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      const nextUser = { id: email?.includes('admin') ? 'admin-demo' : 'student-demo', email };
      const nextProfile = await demoProfileForEmail(email);
      setUser(nextUser);
      setProfile(nextProfile);
      setProfileError(null);
      setProfileLoading(false);
      localStorage.setItem('monprof-demo-user', JSON.stringify({ user: nextUser, profile: nextProfile }));
      return nextProfile;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data: nextProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError) throw profileError;
    setUser(data.user);
    setProfile(nextProfile);
    setProfileError(null);
    setProfileLoading(false);
    return nextProfile;
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
    return true;
  };

  const signOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    localStorage.removeItem('monprof-demo-user');
    setUser(null);
    setProfile(null);
    setProfileError(null);
    setProfileLoading(false);
    navigate('/login');
  };

  const value = useMemo(
    () => ({ user, profile, profileLoading, profileError, loading, signIn, signOut, resetPassword }),
    [user, profile, profileLoading, profileError, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
