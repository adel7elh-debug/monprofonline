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
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;

  const hydrateUser = async (authUser) => {
    setUser(authUser);
    if (!authUser) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return null;
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
      return null;
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
      return null;
    }
    setProfile(data);
    setProfileLoading(false);
    return data;
  };

  useEffect(() => {
    let mounted = true;
    let subscription;

    const loadSession = async () => {
      setAuthLoading(true);

      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem('monprof-demo-user');
        if (stored && mounted) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setProfile(parsed.profile);
        }
        setAuthLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      const session = data?.session || null;

      if (error) {
        console.error('Supabase session load failed:', error);
      }

      if (isDev) {
        console.log('AUTH SESSION CHECK', {
          hasSession: Boolean(session),
          userEmail: session?.user?.email,
          authLoading: true,
          profileLoading,
          profile,
        });
      }

      if (mounted) await hydrateUser(session?.user || null);

      const { data: listener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
        if (isDev) console.log('AUTH STATE CHANGE', event);
        if (!mounted) return;
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setProfileError(null);
          setProfileLoading(false);
          setAuthLoading(false);
          return;
        }
        await hydrateUser(nextSession?.user || null);
        if (mounted) setAuthLoading(false);
      });
      subscription = listener.subscription;

      if (mounted) setAuthLoading(false);
    };

    loadSession();
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

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
    const nextProfile = await hydrateUser(data.user);
    if (!nextProfile) throw new Error('Profil introuvable pour cet utilisateur');
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
    setAuthLoading(false);
    navigate('/login');
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      profileLoading,
      profileError,
      authLoading,
      loading: authLoading,
      signIn,
      signOut,
      resetPassword,
    }),
    [user, profile, profileLoading, profileError, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
