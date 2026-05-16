import { createContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);  
  const [profile, setProfile] = useState(null);  
  const [loading, setLoading] = useState(true);  

  const isMounted = useRef(true);

  // ── Robust Profile Fetcher ────────────────────────────────────────
  async function fetchProfile(userId) {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) return null;
      return data;
    } catch (err) {
      console.log(err)
    }
  }

  // ── Unified State Synchronizer ──────────────────────────────────
  async function synchronizeAuth(session) {
    if (!isMounted.current) return;

    if (session?.user) {
      setUser(session.user);
      
      const profileData = await fetchProfile(session.user.id);
      
      if (isMounted.current) {
        setProfile(profileData);
        setLoading(false);
      }
    } else {
      setUser(null);
      setProfile(null);
      if (isMounted.current) setLoading(false);
    }
  }

  useEffect(() => {
    isMounted.current = true;

    // Handle initial token restoration on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      synchronizeAuth(session);
    });

    // Handle background token updates and state changes smoothly
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      synchronizeAuth(session);
    });

    return () => {
      isMounted.current = false;
      if (listener?.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  async function refreshProfile() {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    if (isMounted.current) setProfile(profileData);
  }

  const value = {
    user,
    profile,
    isPremium: profile?.is_premium ?? false,
    loading,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}