import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");

  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;

  }



  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,

    });

    if (error) throw error;
    return data;

  }



  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,

      },

    });

    if (error) throw error;

  }



  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

  }


  async function saveOnboarding(displayName, targetSchool) {
    if (!context.user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        target_school: targetSchool,

      })

      .eq("id", context.user.id);



    if (error) throw error;
    await context.refreshProfile();

  }



  return {


    user:           context.user,
    profile:        context.profile,
    isPremium:      context.isPremium,
    loading:        context.loading,
    signUp,
    login,
    loginWithGoogle,
    logout,
    saveOnboarding,
    refreshProfile: context.refreshProfile,

  };

}

