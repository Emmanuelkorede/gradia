import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { supabase } from "../lib/supabaseClient";

export const SchoolContext = createContext(null);

export function SchoolProvider({ children }) {

  const { user, profile } = useContext(AuthContext);
  const [selectedSchool, setSelectedSchool] = useState("OAU");
  const [userStats, setUserStats] = useState({
    testsDone: 0,
    avgScore: 0,
    streak: 0,
    rank: "-",
    loading: true

  });




  const refreshStats = useCallback(async () => {
    if (!user) return;
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("streak_count")
        .eq("id", user.id)
        .single();

      const { data: results } = await supabase
        .from("test_results")
        .select("score, total_questions")
        .eq("user_id", user.id);

      const { data: rankData } = await supabase
        .from("weekly_winners")
        .select("rank")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const testsDone = results?.length || 0;
      let avgScore = 0;

      if (testsDone > 0) {

        const totalPoints = results.reduce((acc, curr) => acc + curr.score, 0);
        const totalPossible = results.reduce((acc, curr) => acc + curr.total_questions, 0);
        avgScore = Math.round((totalPoints / totalPossible) * 100);

      }

      setUserStats({
        testsDone,
        avgScore,
        streak: profileData?.streak_count || 0,
        rank: rankData?.rank ? `#${rankData.rank}` : "-",
        loading: false

      });

    } catch (error) {

      console.error("Error refreshing stats:", error);
      setUserStats(prev => ({ ...prev, loading: false }));

    }

  }, [user]);


  useEffect(() => {
    if (profile?.target_school) {
      setSelectedSchool(profile.target_school);

    }

  }, [profile]);




  useEffect(() => {
    if (user) {
      refreshStats();
    }

  }, [user, refreshStats]);



  const value = {
    selectedSchool,
    setSelectedSchool,
    userStats,
    refreshStats,    // Call this after a test to update UI

  };



  return (

    <SchoolContext.Provider value={value}>

      {children}

    </SchoolContext.Provider>

  );

} 